import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createDiarySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Diary content is required")
    .max(10000, "Diary content is too long"),

  entryType: z
    .enum(["TEXT", "VOICE"])
    .default("TEXT"),

  audioUrl: z
    .string()
    .url()
    .optional()
    .nullable(),

  durationSeconds: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  checkinId: z
    .string()
    .min(1)
    .optional()
    .nullable(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const diaries = await prisma.diaryEntry.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        content: true,
        entryType: true,
        audioUrl: true,
        durationSeconds: true,
        checkinId: true,
        createdAt: true,
        updatedAt: true,

        checkin: {
          select: {
            emotions: {
              select: {
                intensity: true,

                emotion: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },

        aiAnalyses: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,

          select: {
            id: true,
            summary: true,
            emotionalState: true,
            stressScore: true,
            riskLevel: true,
          },
        },
      },
    });

    return NextResponse.json({
      diaries,
    });
  } catch (error) {
    console.error("[GET /api/diary]", error);

    return NextResponse.json(
      {
        error: "Failed to fetch diary entries",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const parsed = createDiarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      content,
      entryType,
      audioUrl,
      durationSeconds,
      checkinId,
    } = parsed.data;

    if (checkinId) {
      const checkin = await prisma.dailyCheckin.findFirst({
        where: {
          id: checkinId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!checkin) {
        return NextResponse.json(
          {
            error: "Check-in not found",
          },
          { status: 404 },
        );
      }
    }

    const diary = await prisma.diaryEntry.create({
      data: {
        userId: user.id,
        checkinId: checkinId ?? null,
        content,
        entryType,
        audioUrl: audioUrl ?? null,
        durationSeconds: durationSeconds ?? null,
      },

      select: {
        id: true,
        content: true,
        entryType: true,
        audioUrl: true,
        durationSeconds: true,
        checkinId: true,
        createdAt: true,
        updatedAt: true,

        checkin: {
          select: {
            emotions: {
              select: {
                intensity: true,

                emotion: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },

        aiAnalyses: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,

          select: {
            id: true,
            summary: true,
            emotionalState: true,
            stressScore: true,
            riskLevel: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Diary created successfully",
        diary,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/diary]", error);

    return NextResponse.json(
      {
        error: "Failed to create diary",
      },
      { status: 500 },
    );
  }
}