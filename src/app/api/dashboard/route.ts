import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalDayRange } from "@/lib/date/timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =========================
    // USER TIMEZONE
    // =========================

    const preference =
      await prisma.userPreference.findUnique({
        where: {
          userId: user.id,
        },

        select: {
          timezone: true,
        },
      });

    /**
     * Default ke WIB jika user belum
     * mempunyai timezone.
     */
    const timezone =
      preference?.timezone ||
      "Asia/Jakarta";

    // =========================
    // DATE RANGE
    // =========================

    const now = new Date();

    const {
      start: startOfToday,
      end: endOfToday,
      date: localDate,
    } = getLocalDayRange(
      now,
      timezone,
    );

    /**
     * 7 hari terakhir termasuk hari ini.
     *
     * Karena DailyCheckin disimpan sebagai
     * DateTime UTC, kita mundurkan boundary
     * UTC sebanyak 6 hari.
     */
    const startOfWeek = new Date(
      startOfToday,
    );

    startOfWeek.setUTCDate(
      startOfWeek.getUTCDate() - 6,
    );

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
      // =========================
      // TODAY'S CHECK-IN
      // =========================

      prisma.dailyCheckin.findFirst({
        where: {
          userId: user.id,

          checkinDate: {
            gte: startOfToday,
            lt: endOfToday,
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

      // =========================
      // LATEST DIARY
      // =========================

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

      // =========================
      // LATEST AI ANALYSIS
      // =========================

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

      // =========================
      // RECOMMENDED ACTIVITIES
      // =========================

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

      // =========================
      // LAST 7 DAYS
      // =========================

      prisma.dailyCheckin.findMany({
        where: {
          userId: user.id,

          checkinDate: {
            gte: startOfWeek,
            lt: endOfToday,
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

  // Samakan nama field dengan tipe data frontend.
  overallIntensity: checkin.overallIntensity,

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
    // TODAY ANALYSIS
    // =========================

    const todayAnalysis =
      todayCheckin?.aiAnalyses[0] ??
      null;

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
      },

      today: {
        hasCheckin:
          Boolean(todayCheckin),

        checkin: todayCheckin,

        analysis: todayAnalysis,
      },

      latestDiary,

      latestAnalysis,

      recommendedActivities,

      weekly: {
        startDate: startOfWeek,
        endDate: endOfToday,
        checkins: weeklyData,
      },

      meta: {
        timezone,
        localDate,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/dashboard error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch dashboard data",
      },
      {
        status: 500,
      },
    );
  }
}