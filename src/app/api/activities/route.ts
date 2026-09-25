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

    const activities = await prisma.activity.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { difficulty: "asc" },
        { durationMinutes: "asc" },
        { title: "asc" },
      ],
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
    });

    return NextResponse.json({
      activities,
    });
  } catch (error) {
    console.error("GET /api/activities error:", error);

    return NextResponse.json(
      { message: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}