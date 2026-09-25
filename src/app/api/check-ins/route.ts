import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const checkInSchema = z.object({
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
    .min(1)
    .max(3),

  contexts: z
    .array(z.string().min(1, "Context is required"))
    .default([]),

  // Daily Story
  note: z
    .string()
    .max(2000, "Daily story is too long")
    .nullable()
    .optional(),
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
    } = parsed.data;

    // --------------------------------------------------
    // 3. Validate duplicate emotions
    // --------------------------------------------------

    const emotionSlugs = emotions.map(
      (emotion) => emotion.name,
    );

    const uniqueEmotionSlugs = new Set(emotionSlugs);

    if (
      uniqueEmotionSlugs.size !== emotionSlugs.length
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
      await prisma.emotion.findMany({
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
      });

    const foundEmotionSlugs = new Set(
      emotionRecords.map(
        (emotion) => emotion.slug,
      ),
    );

    const missingEmotions = emotionSlugs.filter(
      (slug) => !foundEmotionSlugs.has(slug),
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

    const uniqueContextSlugs = new Set(contexts);

    if (
      uniqueContextSlugs.size !== contexts.length
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
      await prisma.context.findMany({
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
      });

    const foundContextSlugs = new Set(
      contextRecords.map(
        (context) => context.slug,
      ),
    );

    const missingContexts = contexts.filter(
      (slug) => !foundContextSlugs.has(slug),
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

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCheckin =
      await prisma.dailyCheckin.findFirst({
        where: {
          userId: user.id,
          checkinDate: {
            gte: startOfDay,
            lte: endOfDay,
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
          checkinId: existingCheckin.id,
        },
        { status: 409 },
      );
    }

    // --------------------------------------------------
    // 8. Calculate overall intensity
    // --------------------------------------------------

    const totalIntensity = emotions.reduce(
      (total, emotion) =>
        total + emotion.intensity,
      0,
    );

    const overallIntensity = Math.round(
      totalIntensity / emotions.length,
    );

    // --------------------------------------------------
    // 9. Create transaction
    // --------------------------------------------------

    const result = await prisma.$transaction(
      async (tx) => {
        const checkin =
          await tx.dailyCheckin.create({
            data: {
              userId: user.id,
              checkinDate: now,
              overallIntensity,
              note: note?.trim() || null,
            },
          });

        // ----------------------------------------------
        // Emotion map
        // ----------------------------------------------

        const emotionRecordMap = new Map(
          emotionRecords.map((emotion) => [
            emotion.slug,
            emotion,
          ]),
        );

        // ----------------------------------------------
        // Check-in emotions
        // ----------------------------------------------

        await tx.checkinEmotion.createMany({
          data: emotions.map(
            (emotion, index) => ({
              checkinId: checkin.id,

              emotionId:
                emotionRecordMap.get(
                  emotion.name,
                )!.id,

              position: index + 1,

              intensity:
                emotion.intensity,

              note:
                emotion.note?.trim() || null,
            }),
          ),
        });

        // ----------------------------------------------
        // Check-in contexts
        // ----------------------------------------------

        if (contextRecords.length > 0) {
          await tx.checkinContext.createMany({
            data: contextRecords.map(
              (context) => ({
                checkinId: checkin.id,
                contextId: context.id,
              }),
            ),
          });
        }

        // ----------------------------------------------
        // Daily Story → DiaryEntry
        // ----------------------------------------------

        let diaryEntry = null;

        const cleanedNote = note?.trim();

        if (cleanedNote) {
          diaryEntry =
            await tx.diaryEntry.create({
              data: {
                userId: user.id,
                checkinId: checkin.id,
                content: cleanedNote,
                entryType: "TEXT",
              },
            });
        }

        return {
          checkin,
          diaryEntry,
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

        checkin: result.checkin,

        diaryEntry:
          result.diaryEntry,
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