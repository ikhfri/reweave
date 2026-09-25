import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const completeSchema = z.object({
  logId: z.string().min(1),
  userRating: z.number().int().min(1).max(5).optional().nullable(),
  userFeedback: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(
  request: Request,
  context: {
    params: Promise<{ activityId: string }>;
  },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { activityId } = await context.params;

    const body = await request.json();

    const parsed = completeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid request",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existingLog = await prisma.activityLog.findFirst({
      where: {
        id: parsed.data.logId,
        activityId,
        userId: user.id,
      },
    });

    if (!existingLog) {
      return NextResponse.json(
        { message: "Activity log not found" },
        { status: 404 },
      );
    }

    if (existingLog.completed) {
      return NextResponse.json({
        message: "Activity already completed",
        log: existingLog,
      });
    }

    const log = await prisma.activityLog.update({
      where: {
        id: existingLog.id,
      },
      data: {
        completed: true,
        completedAt: new Date(),
        userRating: parsed.data.userRating ?? null,
        userFeedback: parsed.data.userFeedback ?? null,
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            durationMinutes: true,
            difficulty: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Activity completed",
      log,
    });
  } catch (error) {
    console.error(
      "POST /api/activities/[activityId]/complete error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to complete activity" },
      { status: 500 },
    );
  }
}