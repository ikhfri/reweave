import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const logs = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        completed: true,
        userRating: true,
        userFeedback: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
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
      logs,
    });
  } catch (error) {
    console.error(
      "GET /api/activities/history error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch activity history" },
      { status: 500 },
    );
  }
}