import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        durationMinutes: true,
        difficulty: true,
        instructions: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { message: "Activity not found" },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => ({}));

    const checkinId =
      typeof body.checkinId === "string"
        ? body.checkinId
        : null;

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
          { message: "Check-in not found" },
          { status: 404 },
        );
      }
    }

    const log = await prisma.activityLog.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        checkinId,
        startedAt: new Date(),
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            category: true,
            durationMinutes: true,
            difficulty: true,
            instructions: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Activity started",
        log,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/activities/[activityId]/start error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to start activity" },
      { status: 500 },
    );
  }
}