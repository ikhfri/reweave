import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalDayRange } from "@/lib/date/timezone";

const checkInSchema = z
  .object({
    emotions: z
      .array(
        z.object({
          name: z.string().min(1, "Emotion is required"),
          intensity: z.number().int().min(1).max(5),
          note: z
            .string()
            .max(500, "Emotion note is too long")
            .nullable()
            .optional(),
        }),
      )
      .max(3)
      .default([]),

    contexts: z
      .array(z.string().min(1, "Context is required"))
      .default([]),

    // Daily Story
    note: z
      .string()
      .max(2000, "Daily story is too long")
      .nullable()
      .optional(),

    // User does not know what emotion they are feeling
    emotionDescription: z
      .string()
      .max(2000, "Emotion description is too long")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasEmotions = data.emotions.length > 0;

    const hasDescription =
      typeof data.emotionDescription === "string" &&
      data.emotionDescription.trim().length > 0;

    if (!hasEmotions && !hasDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emotions"],
        message:
          "Select at least one emotion or describe how you are feeling.",
      });
    }
  });

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------
    // 2. Parse request
    // --------------------------------------------------

    const body = await request.json();

    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid check-in data.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      emotions,
      contexts,
      note,
      emotionDescription,
    } = parsed.data;

    const cleanedEmotionDescription =
      emotionDescription?.trim() || null;

    const cleanedNote =
      note?.trim() || null;

    // --------------------------------------------------
    // 3. Validate duplicate emotions
    // --------------------------------------------------

    const emotionSlugs = emotions.map(
      (emotion) => emotion.name,
    );

    const uniqueEmotionSlugs =
      new Set(emotionSlugs);

    if (
      uniqueEmotionSlugs.size !==
      emotionSlugs.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot select the same emotion more than once.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 4. Find emotions
    // --------------------------------------------------

    const emotionRecords =
      emotionSlugs.length > 0
        ? await prisma.emotion.findMany({
            where: {
              slug: {
                in: emotionSlugs,
              },
            },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          })
        : [];

    const foundEmotionSlugs =
      new Set(
        emotionRecords.map(
          (emotion) => emotion.slug,
        ),
      );

    const missingEmotions =
      emotionSlugs.filter(
        (slug) =>
          !foundEmotionSlugs.has(slug),
      );

    if (missingEmotions.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected emotions were not found.",
          missingEmotions,
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 5. Validate duplicate contexts
    // --------------------------------------------------

    const uniqueContextSlugs =
      new Set(contexts);

    if (
      uniqueContextSlugs.size !==
      contexts.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot select the same context more than once.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 6. Find contexts
    // --------------------------------------------------

    const contextRecords =
      contexts.length > 0
        ? await prisma.context.findMany({
            where: {
              slug: {
                in: contexts,
              },
            },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          })
        : [];

    const foundContextSlugs =
      new Set(
        contextRecords.map(
          (context) => context.slug,
        ),
      );

    const missingContexts =
      contexts.filter(
        (slug) =>
          !foundContextSlugs.has(slug),
      );

    if (missingContexts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected contexts were not found.",
          missingContexts,
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 7. Check today's check-in
    // --------------------------------------------------

    const now = new Date();

    /*
     * Use the user's configured timezone instead
     * of relying on the server timezone.
     *
     * Default:
     * Asia/Jakarta
     */

    const preference =
      await prisma.userPreference.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          timezone: true,
        },
      });

    const timezone =
      preference?.timezone ||
      "Asia/Jakarta";

    const {
      start: startOfDay,
      end: endOfDay,
    } = getLocalDayRange(
      now,
      timezone,
    );

    const existingCheckin =
      await prisma.dailyCheckin.findFirst({
        where: {
          userId: user.id,

          checkinDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },

        select: {
          id: true,
        },
      });

    if (existingCheckin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already completed today's check-in.",
          checkinId:
            existingCheckin.id,
        },
        { status: 409 },
      );
    }

    // --------------------------------------------------
    // 8. Calculate overall intensity
    // --------------------------------------------------

    /*
     * Normal mode:
     * average intensity from selected emotions.
     *
     * Unknown-emotion mode:
     * there are no selected emotions yet,
     * so we temporarily use 0.
     *
     * The AI analysis can later interpret the
     * EmotionDescription and provide the emotional insight.
     */

    const totalIntensity =
      emotions.reduce(
        (total, emotion) =>
          total + emotion.intensity,
        0,
      );

    const overallIntensity =
      emotions.length > 0
        ? Math.round(
            totalIntensity /
              emotions.length,
          )
        : 0;

    // --------------------------------------------------
    // 9. Create transaction
    // --------------------------------------------------

    const result =
      await prisma.$transaction(
        async (tx) => {
          // ----------------------------------------------
          // Daily Check-in
          // ----------------------------------------------

          const checkin =
            await tx.dailyCheckin.create({
              data: {
                userId: user.id,

                /*
                 * Keep the real timestamp.
                 *
                 * The timezone is only used when
                 * determining which local day this
                 * timestamp belongs to.
                 */
                checkinDate: now,

                overallIntensity,

                note: cleanedNote,
              },
            });

          // ----------------------------------------------
          // Emotion map
          // ----------------------------------------------

          const emotionRecordMap =
            new Map(
              emotionRecords.map(
                (emotion) => [
                  emotion.slug,
                  emotion,
                ],
              ),
            );

          // ----------------------------------------------
          // Check-in emotions
          // ----------------------------------------------

          if (emotions.length > 0) {
            await tx.checkinEmotion.createMany({
              data: emotions.map(
                (emotion, index) => {
                  const emotionRecord =
                    emotionRecordMap.get(
                      emotion.name,
                    );

                  if (!emotionRecord) {
                    throw new Error(
                      `Emotion not found: ${emotion.name}`,
                    );
                  }

                  return {
                    checkinId:
                      checkin.id,

                    emotionId:
                      emotionRecord.id,

                    position:
                      index + 1,

                    intensity:
                      emotion.intensity,

                    note:
                      emotion.note?.trim() ||
                      null,
                  };
                },
              ),
            });
          }

          // ----------------------------------------------
          // Check-in contexts
          // ----------------------------------------------

          if (contextRecords.length > 0) {
            await tx.checkinContext.createMany({
              data: contextRecords.map(
                (context) => ({
                  checkinId:
                    checkin.id,

                  contextId:
                    context.id,
                }),
              ),
            });
          }

          // ----------------------------------------------
          // Emotion Description
          //
          // Used when the user does not know
          // what emotion they are experiencing.
          // ----------------------------------------------

          let emotionDescriptionRecord =
            null;

          if (cleanedEmotionDescription) {
            emotionDescriptionRecord =
              await tx.emotionDescription.create({
                data: {
                  userId: user.id,

                  checkinId:
                    checkin.id,

                  description:
                    cleanedEmotionDescription,
                },
              });
          }

          // ----------------------------------------------
          // Daily Story → DiaryEntry
          // ----------------------------------------------

          let diaryEntry = null;

          if (cleanedNote) {
            diaryEntry =
              await tx.diaryEntry.create({
                data: {
                  userId: user.id,

                  checkinId:
                    checkin.id,

                  content:
                    cleanedNote,

                  entryType:
                    "TEXT",
                },
              });
          }

          return {
            checkin,

            diaryEntry,

            emotionDescription:
              emotionDescriptionRecord,
          };
        },
      );

    // --------------------------------------------------
    // 10. Response
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Check-in saved successfully.",

        checkin:
          result.checkin,

        diaryEntry:
          result.diaryEntry,

        emotionDescription:
          result.emotionDescription,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/check-ins error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save check-in.",
      },
      { status: 500 },
    );
  }
}