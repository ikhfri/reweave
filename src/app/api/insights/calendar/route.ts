import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getMonthRange(year: number, month: number) {
  const start = new Date(
    Date.UTC(year, month - 1, 1),
  );

  const end = new Date(
    Date.UTC(year, month, 1),
  );

  return {
    start,
    end,
  };
}

function toDayKey(value: Date | string) {
  const date = new Date(value);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const url = new URL(request.url);

    const currentDate = new Date();

    const requestedYear = Number(
      url.searchParams.get("year"),
    );

    const requestedMonth = Number(
      url.searchParams.get("month"),
    );

    const year =
      Number.isInteger(requestedYear) &&
      requestedYear >= 2000 &&
      requestedYear <= 2100
        ? requestedYear
        : currentDate.getFullYear();

    const month =
      Number.isInteger(requestedMonth) &&
      requestedMonth >= 1 &&
      requestedMonth <= 12
        ? requestedMonth
        : currentDate.getMonth() + 1;

    const { start, end } = getMonthRange(
      year,
      month,
    );

    const [
      checkins,
      diaries,
      analyses,
      activityLogs,
    ] = await Promise.all([
      prisma.dailyCheckin.findMany({
        where: {
          userId: user.id,
          checkinDate: {
            gte: start,
            lt: end,
          },
        },

        orderBy: {
          checkinDate: "asc",
        },

        select: {
          id: true,
          checkinDate: true,
          overallIntensity: true,

          emotions: {
            orderBy: {
              position: "asc",
            },

            select: {
              id: true,
              intensity: true,
              note: true,
              position: true,

              emotion: {
                select: {
                  name: true,
                  slug: true,
                  category: true,
                },
              },
            },
          },

          contexts: {
            select: {
              id: true,

              context: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),

      prisma.diaryEntry.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: start,
            lt: end,
          },
        },

        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
          content: true,
          entryType: true,
          createdAt: true,
        },
      }),

      prisma.aIAnalysis.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: start,
            lt: end,
          },
        },

        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
          checkinId: true,
          diaryEntryId: true,
          summary: true,
          stressScore: true,
          sentiment: true,
          emotionalState: true,
          possibleTriggers: true,
          recommendations: true,
          riskLevel: true,
          createdAt: true,
        },
      }),

      prisma.activityLog.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: start,
            lt: end,
          },
        },

        orderBy: {
          createdAt: "asc",
        },

        include: {
          activity: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              durationMinutes: true,
            },
          },
        },
      }),
    ]);

    /*
     * ------------------------------------------------------
     * GROUP DIARY BY DAY
     * ------------------------------------------------------
     */

    const diaryByDay = new Map<
      string,
      typeof diaries
    >();

    for (const diary of diaries) {
      const dayKey = toDayKey(
        diary.createdAt,
      );

      const current =
        diaryByDay.get(dayKey) ?? [];

      current.push(diary);

      diaryByDay.set(dayKey, current);
    }

    /*
     * ------------------------------------------------------
     * GROUP AI ANALYSIS BY CHECK-IN
     * ------------------------------------------------------
     */

    const analysisByCheckin = new Map<
      string,
      (typeof analyses)[number]
    >();

    for (const analysis of analyses) {
      if (!analysis.checkinId) {
        continue;
      }

      analysisByCheckin.set(
        analysis.checkinId,
        analysis,
      );
    }

    /*
     * ------------------------------------------------------
     * GROUP AI ANALYSIS BY DIARY
     * ------------------------------------------------------
     */

    const analysisByDiary = new Map<
      string,
      (typeof analyses)[number]
    >();

    for (const analysis of analyses) {
      if (!analysis.diaryEntryId) {
        continue;
      }

      analysisByDiary.set(
        analysis.diaryEntryId,
        analysis,
      );
    }

    /*
     * ------------------------------------------------------
     * GROUP ACTIVITIES BY DAY
     * ------------------------------------------------------
     */

    const activityByDay = new Map<
      string,
      Array<{
        id: string;
        title: string;
        slug: string;
        category: string;
        durationMinutes: number;
        completed: boolean;
        userRating: number | null;
        createdAt: string;
      }>
    >();

    for (const log of activityLogs) {
      const dayKey = toDayKey(
        log.createdAt,
      );

      const current =
        activityByDay.get(dayKey) ?? [];

      current.push({
        id: log.activity.id,
        title: log.activity.title,
        slug: log.activity.slug,
        category: log.activity.category,
        durationMinutes:
          log.activity.durationMinutes,
        completed: Boolean(log.completed),
        userRating:
          typeof log.userRating === "number"
            ? log.userRating
            : null,
        createdAt:
          log.createdAt.toISOString(),
      });

      activityByDay.set(
        dayKey,
        current,
      );
    }

    /*
     * ------------------------------------------------------
     * BUILD CALENDAR DATA
     * ------------------------------------------------------
     */

    const days = checkins.map(
      (checkin) => {
        const dateKey = toDayKey(
          checkin.checkinDate,
        );

        const dayDiaries =
          diaryByDay.get(dateKey) ?? [];

        const checkinAnalysis =
          analysisByCheckin.get(
            checkin.id,
          ) ?? null;

        const diaryAnalysis =
          dayDiaries
            .map((diary) =>
              analysisByDiary.get(
                diary.id,
              ),
            )
            .find(Boolean) ?? null;

        const analysis =
          checkinAnalysis ??
          diaryAnalysis;

        return {
          date: dateKey,

          hasCheckin: true,

          checkin: {
            id: checkin.id,
            overallIntensity:
              checkin.overallIntensity,
          },

          emotions:
            checkin.emotions.map(
              (item) => ({
                id: item.id,
                name: item.emotion.name,
                slug: item.emotion.slug,
                category:
                  item.emotion.category,
                intensity:
                  item.intensity,
                note: item.note,
              }),
            ),

          contexts:
            checkin.contexts.map(
              (item) => ({
                id: item.id,
                name: item.context.name,
                slug: item.context.slug,
              }),
            ),

          diary: dayDiaries[0]
            ? {
                id: dayDiaries[0].id,
                content:
                  dayDiaries[0].content,
                entryType:
                  dayDiaries[0].entryType,
                createdAt:
                  dayDiaries[0].createdAt.toISOString(),
              }
            : null,

          diaryCount:
            dayDiaries.length,

          activities:
            activityByDay.get(
              dateKey,
            ) ?? [],

          aiInsight: analysis
            ? {
                id: analysis.id,
                summary:
                  analysis.summary,
                stressScore:
                  analysis.stressScore,
                sentiment:
                  analysis.sentiment,
                emotionalState:
                  analysis.emotionalState,
                possibleTriggers:
                  analysis.possibleTriggers,
                recommendations:
                  analysis.recommendations,
                riskLevel:
                  analysis.riskLevel,
                createdAt:
                  analysis.createdAt.toISOString(),
              }
            : null,
        };
      },
    );

    /*
     * ------------------------------------------------------
     * RESPONSE
     * ------------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      year,
      month,
      days,
    });
  } catch (error) {
    console.error(
      "[GET /api/insights/calendar]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load mood calendar.",
      },
      {
        status: 500,
      },
    );
  }
}