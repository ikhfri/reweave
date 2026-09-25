/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateGeminiContent,
  GEMINI_MODEL,
} from "@/lib/gemini";

const schema = z.object({
  language: z.enum(["id", "en"]).default("id"),
});

function getDateRange() {
  const end = new Date();

  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return { start, end };
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

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { language } = parsed.data;
    const { start, end } = getDateRange();

    const [checkins, diaries, analyses] =
      await Promise.all([
        prisma.dailyCheckin.findMany({
          where: {
            userId: user.id,
            checkinDate: {
              gte: start,
              lte: end,
            },
          },
          select: {
            checkinDate: true,
            overallIntensity: true,
            emotions: {
              select: {
                intensity: true,
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
          select: {
            id: true,
            content: true,
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
            createdAt: "desc",
          },
          select: {
            summary: true,
            stressScore: true,
            sentiment: true,
            emotionalState: true,
            possibleTriggers: true,
            recommendations: true,
            riskLevel: true,
          },
        }),
      ]);

    const emotionMap = new Map<
      string,
      {
        name: string;
        count: number;
      }
    >();

    for (const checkin of checkins) {
      for (const item of checkin.emotions) {
        const slug = item.emotion.slug;
        const existing = emotionMap.get(slug);

        if (existing) {
          existing.count += 1;
        } else {
          emotionMap.set(slug, {
            name: item.emotion.name,
            count: 1,
          });
        }
      }
    }

    const topEmotions = Array.from(
      emotionMap.values(),
    )
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stressValues = analyses
      .map((item) => item.stressScore)
      .filter(
        (value): value is number =>
          typeof value === "number",
      );

    const averageStress =
      stressValues.length > 0
        ? Number(
            (
              stressValues.reduce(
                (sum, value) => sum + value,
                0,
              ) / stressValues.length
            ).toFixed(1),
          )
        : null;

    const sentiment = {
      positive: analyses.filter(
        (item) => item.sentiment === "POSITIVE",
      ).length,

      neutral: analyses.filter(
        (item) => item.sentiment === "NEUTRAL",
      ).length,

      negative: analyses.filter(
        (item) => item.sentiment === "NEGATIVE",
      ).length,
    };

    const contexts = new Map<
      string,
      number
    >();

    for (const checkin of checkins) {
      for (const item of checkin.contexts) {
        const name = item.context.name;

        contexts.set(
          name,
          (contexts.get(name) ?? 0) + 1,
        );
      }
    }

    const topContexts = Array.from(
      contexts.entries(),
    )
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const prompt = `
You are Moodify, an AI emotional wellbeing companion.

Create a short weekly emotional wellbeing summary based ONLY on the structured data provided below.

Language:
${
  language === "id"
    ? "Bahasa Indonesia"
    : "English"
}

IMPORTANT:
- Do not diagnose mental health conditions.
- Do not claim the user has depression, anxiety, or another disorder.
- Do not invent facts.
- Do not make assumptions that are not supported by the data.
- Use cautious language such as "your week suggests", "you may have noticed", or "a pattern appears".
- Do not make medical claims.
- Recommendations must be low-risk.
- Do not expose internal reasoning.
- Return ONLY valid JSON.

Return:

{
  "headline": "Short title",
  "summary": "2-4 sentence summary of the week",
  "highlights": [
    "Short observation"
  ],
  "reflectionPrompt": "One thoughtful reflection question",
  "gentleSuggestion": "One practical low-risk suggestion"
}

Keep:
- headline under 80 characters
- summary under 500 characters
- highlights maximum 3 items
- reflectionPrompt under 180 characters
- gentleSuggestion under 250 characters

WEEKLY DATA:

Check-ins: ${checkins.length}

Diary entries: ${diaries.length}

Average stress score: ${
      averageStress ?? "No data"
    }

Top emotions:
${JSON.stringify(topEmotions)}

Sentiment:
${JSON.stringify(sentiment)}

Common contexts:
${JSON.stringify(topContexts)}

Recent AI observations:
${JSON.stringify(
  analyses.slice(0, 5).map((item) => ({
    summary: item.summary,
    emotionalState: item.emotionalState,
    possibleTriggers: item.possibleTriggers,
  })),
)}
`;

    const response =
      await generateGeminiContent(
        prompt,
        3,
      );

    if (!response.text) {
      return NextResponse.json(
        {
          error:
            "AI returned an empty response",
        },
        { status: 502 },
      );
    }

    let result: {
      headline?: string;
      summary?: string;
      highlights?: unknown;
      reflectionPrompt?: string;
      gentleSuggestion?: string;
    };

    try {
      result = JSON.parse(response.text);
    } catch {
      console.error(
        "[Weekly AI] Invalid JSON:",
        response.text,
      );

      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
        },
        { status: 502 },
      );
    }

    const highlights = Array.isArray(
      result.highlights,
    )
      ? result.highlights.filter(
          (item): item is string =>
            typeof item === "string",
        ).slice(0, 3)
      : [];

    return NextResponse.json({
      success: true,

      summary: {
        headline:
          result.headline ??
          (language === "id"
            ? "Ringkasan minggu kamu"
            : "Your weekly summary"),

        summary:
          result.summary ??
          (language === "id"
            ? "Belum cukup data untuk membuat ringkasan."
            : "There is not enough data to create a summary."),

        highlights,

        reflectionPrompt:
          result.reflectionPrompt ?? "",

        gentleSuggestion:
          result.gentleSuggestion ?? "",
      },

      meta: {
        model: GEMINI_MODEL,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error(
      "[POST /api/ai/weekly-summary]",
      error,
    );

    const status = error?.status;

    if (status === 429) {
      return NextResponse.json(
        {
          error: "AI request limit reached",
        },
        { status: 429 },
      );
    }

    if (
      status === 503 ||
      status === 500 ||
      status === 408
    ) {
      return NextResponse.json(
        {
          error:
            "AI service is temporarily unavailable",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to generate weekly summary",
      },
      { status: 500 },
    );
  }
}