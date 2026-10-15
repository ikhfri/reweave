import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
  };
}

// Helper format tanggal lokal (YYYY-MM-DD) tanpa pengaruh UTC offset
function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { start, end } = getDateRange();

    const [checkins, diaries, analyses, activityLogs] =
      await Promise.all([
        prisma.dailyCheckin.findMany({
          where: {
            userId: user.id,
            checkinDate: {
              gte: start,
              lte: end,
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
              select: {
                intensity: true,
                position: true,
                emotion: {
                  select: {
                    name: true,
                    slug: true,
                    category: true,
                  },
                },
              },
              orderBy: {
                position: "asc",
              },
            },
            contexts: {
              select: {
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
              lte: end,
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
              lte: end,
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
            thinkingPatterns: true,
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
              lte: end,
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
                difficulty: true,
              },
            },
          },
        }),
      ]);

    /* EMOTION FREQUENCY */
    const emotionMap = new Map<
      string,
      {
        name: string;
        slug: string;
        category: string;
        count: number;
        totalIntensity: number;
      }
    >();

    for (const checkin of checkins) {
      for (const item of checkin.emotions) {
        const key = item.emotion.slug;
        const existing = emotionMap.get(key);

        if (existing) {
          existing.count += 1;
          existing.totalIntensity += item.intensity;
        } else {
          emotionMap.set(key, {
            name: item.emotion.name,
            slug: item.emotion.slug,
            category: item.emotion.category,
            count: 1,
            totalIntensity: item.intensity,
          });
        }
      }
    }

    const emotions = Array.from(emotionMap.values())
      .map((emotion) => ({
        ...emotion,
        averageIntensity:
          emotion.count > 0
            ? Number((emotion.totalIntensity / emotion.count).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const dominantEmotion = emotions[0] ?? null;

    /* STRESS */
    const stressValues = analyses
      .map((analysis) => analysis.stressScore)
      .filter((score): score is number => typeof score === "number");

    const averageStress =
      stressValues.length > 0
        ? Number(
            (
              stressValues.reduce((sum, score) => sum + score, 0) /
              stressValues.length
            ).toFixed(1),
          )
        : null;

    /* SENTIMENT */
    const sentimentCounts = {
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0,
    };

    for (const analysis of analyses) {
      if (analysis.sentiment) {
        sentimentCounts[analysis.sentiment]++;
      }
    }

    /* CONTEXT FREQUENCY */
    const contextMap = new Map<
      string,
      {
        name: string;
        slug: string;
        count: number;
      }
    >();

    for (const checkin of checkins) {
      for (const item of checkin.contexts) {
        const key = item.context.slug;
        const existing = contextMap.get(key);

        if (existing) {
          existing.count += 1;
        } else {
          contextMap.set(key, {
            name: item.context.name,
            slug: item.context.slug,
            count: 1,
          });
        }
      }
    }

    const commonContexts = Array.from(contextMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    /* AI TRIGGERS */
    const triggerMap = new Map<string, number>();

    for (const analysis of analyses) {
      if (!Array.isArray(analysis.possibleTriggers)) {
        continue;
      }

      for (const trigger of analysis.possibleTriggers) {
        if (typeof trigger !== "string") continue;
        const normalized = trigger.trim();
        if (!normalized) continue;

        triggerMap.set(
          normalized,
          (triggerMap.get(normalized) ?? 0) + 1,
        );
      }
    }

    const possibleTriggers = Array.from(triggerMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    /* DAILY TREND - Perbaikan Penanganan Tanggal Lokal */
    const dailyTrend = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayCheckins = checkins.filter(
        (checkin) =>
          checkin.checkinDate >= date && checkin.checkinDate < nextDate,
      );

      const dayAnalyses = analyses.filter(
        (analysis) =>
          analysis.createdAt >= date && analysis.createdAt < nextDate,
      );

      const dayStress = dayAnalyses
        .map((analysis) => analysis.stressScore)
        .filter((score): score is number => typeof score === "number");

      const averageDayStress =
        dayStress.length > 0
          ? Number(
              (
                dayStress.reduce((sum, score) => sum + score, 0) /
                dayStress.length
              ).toFixed(1),
            )
          : null;

      const emotionCounts = new Map<string, number>();

      for (const checkin of dayCheckins) {
        for (const emotion of checkin.emotions) {
          const key = emotion.emotion.slug;
          emotionCounts.set(key, (emotionCounts.get(key) ?? 0) + 1);
        }
      }

      let dominantDayEmotion: string | null = null;
      let highestCount = 0;

      for (const [emotion, count] of emotionCounts) {
        if (count > highestCount) {
          highestCount = count;
          dominantDayEmotion = emotion;
        }
      }

      dailyTrend.push({
        date: formatDateKey(date), // Menggunakan helper formatDateKey lokal
        checkinCount: dayCheckins.length,
        diaryCount: diaries.filter(
          (diary) =>
            diary.createdAt >= date && diary.createdAt < nextDate,
        ).length,
        averageStress: averageDayStress,
        dominantEmotion: dominantDayEmotion,
      });
    }

    /* ACTIVITY ANALYTICS */
    const completedActivities = activityLogs.filter((log) => log.completed);
    const totalActivitiesStarted = activityLogs.length;
    const totalActivitiesCompleted = completedActivities.length;

    const activityCompletionRate =
      totalActivitiesStarted > 0
        ? Math.round(
            (totalActivitiesCompleted / totalActivitiesStarted) * 100,
          )
        : 0;

    const activityRatings = completedActivities
      .map((log) => log.userRating)
      .filter(
        (rating): rating is number =>
          typeof rating === "number" && rating >= 1 && rating <= 5,
      );

    const averageActivityRating =
      activityRatings.length > 0
        ? Number(
            (
              activityRatings.reduce((sum, rating) => sum + rating, 0) /
              activityRatings.length
            ).toFixed(1),
          )
        : null;

    const activityFrequency = new Map<
      string,
      {
        id: string;
        title: string;
        count: number;
      }
    >();

    for (const log of activityLogs) {
      const existing = activityFrequency.get(log.activity.id);
      if (existing) {
        existing.count += 1;
      } else {
        activityFrequency.set(log.activity.id, {
          id: log.activity.id,
          title: log.activity.title,
          count: 1,
        });
      }
    }

    const mostUsedActivity =
      Array.from(activityFrequency.values()).sort(
        (a, b) => b.count - a.count,
      )[0] ?? null;

    const activitySummary = {
      totalStarted: totalActivitiesStarted,
      totalCompleted: totalActivitiesCompleted,
      completionRate: activityCompletionRate,
      averageRating: averageActivityRating,
      mostUsed: mostUsedActivity,
    };

    /* SUMMARY RESPONSE */
    const summary = {
      totalCheckins: checkins.length,
      totalDiaries: diaries.length,
      totalAnalyses: analyses.length,
      dominantEmotion,
      averageStress,
      sentiment: sentimentCounts,
      commonContexts,
      possibleTriggers,
      dailyTrend,
      activity: activitySummary,
    };

    return NextResponse.json({
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary,
      checkins,
      diaries,
      analyses,
      activityLogs,
    });
  } catch (error) {
    console.error("[GET /api/insights/weekly]", error);
    return NextResponse.json(
      { error: "Failed to generate weekly insights" },
      { status: 500 },
    );
  }
}