import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // =========================================================
    // AUTH
    // =========================================================

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

    // =========================================================
    // GET EMOTIONS + CONTEXTS
    // =========================================================

    const [emotions, contexts] =
      await Promise.all([
        prisma.emotion.findMany({
          orderBy: [
            {
              category: "asc",
            },
            {
              name: "asc",
            },
          ],
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
          },
        }),

        prisma.context.findMany({
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        }),
      ]);

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json({
      success: true,
      emotions,
      contexts,
    });
  } catch (error) {
    console.error(
      "GET /api/check-ins/options error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load check-in options.",
      },
      { status: 500 },
    );
  }
}