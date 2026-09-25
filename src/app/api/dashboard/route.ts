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

    // =========================
    // DATE RANGE
    // =========================

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    // =========================
    // FETCH DASHBOARD DATA
    // =========================

    const [
      todayCheckin,
      latestDiary,
      latestAnalysis,
      recommendedActivities,
      weeklyCheckins,
    ] = await Promise.all([
      // Today's check-in
      prisma.dailyCheckin.findFirst({
        where: {
          userId: user.id,
          checkinDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          emotions: {
            orderBy: {
              position: "asc",
            },
            include: {
              emotion: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  category: true,
                  description: true,
                },
              },
            },
          },
          contexts: {
            include: {
              context: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                },
              },
            },
          },
          diaryEntries: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              content: true,
              entryType: true,
              audioUrl: true,
              durationSeconds: true,
              createdAt: true,
            },
          },
        },
      }),

      // Latest diary
      prisma.diaryEntry.findFirst({
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
          aiAnalyses: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              summary: true,
              validationMessage: true,
              stressScore: true,
              sentiment: true,
              emotionalState: true,
              possibleTriggers: true,
              thinkingPatterns: true,
              recommendations: true,
              riskLevel: true,
              model: true,
              createdAt: true,
            },
          },
        },
      }),

      // Latest AI analysis
      prisma.aIAnalysis.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          checkinId: true,
          diaryEntryId: true,
          summary: true,
          validationMessage: true,
          stressScore: true,
          sentiment: true,
          emotionalState: true,
          possibleTriggers: true,
          thinkingPatterns: true,
          recommendations: true,
          riskLevel: true,
          model: true,
          createdAt: true,
        },
      }),

      // Recommended activities
      prisma.activity.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          {
            difficulty: "asc",
          },
          {
            durationMinutes: "asc",
          },
          {
            title: "asc",
          },
        ],
        take: 3,
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
      }),

      // Last 7 days check-ins
      prisma.dailyCheckin.findMany({
        where: {
          userId: user.id,
          checkinDate: {
            gte: startOfWeek,
            lte: endOfToday,
          },
        },
        orderBy: {
          checkinDate: "asc",
        },
        include: {
          emotions: {
            orderBy: {
              position: "asc",
            },
            take: 3,
            include: {
              emotion: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  category: true,
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
              stressScore: true,
              sentiment: true,
              emotionalState: true,
              riskLevel: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    // =========================
    // WEEKLY DATA
    // =========================

    const weeklyData = weeklyCheckins.map((checkin) => ({
      id: checkin.id,
      date: checkin.checkinDate,
      intensity: checkin.overallIntensity,
      emotions: checkin.emotions.map((item) => ({
        id: item.emotion.id,
        name: item.emotion.name,
        slug: item.emotion.slug,
        category: item.emotion.category,
        intensity: item.intensity,
        note: item.note,
      })),
      analysis: checkin.aiAnalyses[0] ?? null,
    }));

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
      },

      today: {
        hasCheckin: Boolean(todayCheckin),
        checkin: todayCheckin,
        analysis:
          todayCheckin
            ? await prisma.aIAnalysis.findFirst({
                where: {
                  userId: user.id,
                  checkinId: todayCheckin.id,
                },
                orderBy: {
                  createdAt: "desc",
                },
                select: {
                  id: true,
                  summary: true,
                  validationMessage: true,
                  stressScore: true,
                  sentiment: true,
                  emotionalState: true,
                  possibleTriggers: true,
                  thinkingPatterns: true,
                  recommendations: true,
                  riskLevel: true,
                  model: true,
                  createdAt: true,
                },
              })
            : null,
      },

      latestDiary,

      latestAnalysis,

      recommendedActivities,

      weekly: {
        startDate: startOfWeek,
        endDate: endOfToday,
        checkins: weeklyData,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch dashboard data",
      },
      {
        status: 500,
      },
    );
  }
}