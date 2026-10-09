import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGeminiContent, GEMINI_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  language: z.enum(["id", "en"]).default("id"),
  // Only an explicit user action should regenerate a cached summary.
  regenerate: z.boolean().default(false),
});

const aiResponseSchema = z.object({
  headline: z.string().min(1).max(80),
  summary: z.string().min(1).max(500),
  highlights: z.array(z.string().min(1)).max(3),
  reflectionPrompt: z.string().max(180),
  gentleSuggestion: z.string().max(250),
});

function getDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

// Use Monday as the stable cache key for the current calendar week.
// The source data remains the same rolling seven-day window as the Insights API.
function getWeekKey(date: Date) {
  const key = new Date(date);
  key.setHours(0, 0, 0, 0);
  const day = key.getDay();
  key.setDate(key.getDate() - ((day + 6) % 7));
  return key;
}

function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function toSummary(record: {
  headline: string;
  summary: string;
  highlights: unknown;
  reflectionPrompt: string;
  gentleSuggestion: string;
}) {
  return {
    headline: record.headline,
    summary: record.summary,
    highlights: Array.isArray(record.highlights)
      ? record.highlights.filter((item): item is string => typeof item === "string").slice(0, 3)
      : [],
    reflectionPrompt: record.reflectionPrompt,
    gentleSuggestion: record.gentleSuggestion,
  };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { language, regenerate } = parsed.data;
    const { start, end } = getDateRange();
    const weekStart = getWeekKey(end);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [checkins, diaries, analyses] = await Promise.all([
      prisma.dailyCheckin.findMany({
        where: { userId: user.id, checkinDate: { gte: start, lte: end } },
        select: {
          checkinDate: true,
          overallIntensity: true,
          emotions: {
            select: {
              intensity: true,
              emotion: { select: { name: true, slug: true, category: true } },
            },
          },
          contexts: {
            select: { context: { select: { name: true, slug: true } } },
          },
        },
      }),
      prisma.diaryEntry.findMany({
        where: { userId: user.id, createdAt: { gte: start, lte: end } },
        select: { id: true, content: true, createdAt: true },
      }),
      prisma.aIAnalysis.findMany({
        where: { userId: user.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "desc" },
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

    const emotionMap = new Map<string, { name: string; count: number }>();
    const contextMap = new Map<string, number>();

    for (const checkin of checkins) {
      for (const item of checkin.emotions) {
        const slug = item.emotion.slug;
        const current = emotionMap.get(slug);
        if (current) current.count += 1;
        else emotionMap.set(slug, { name: item.emotion.name, count: 1 });
      }

      for (const item of checkin.contexts) {
        const name = item.context.name;
        contextMap.set(name, (contextMap.get(name) ?? 0) + 1);
      }
    }

    const topEmotions = [...emotionMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topContexts = [...contextMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stressValues = analyses
      .map((item) => item.stressScore)
      .filter((value): value is number => typeof value === "number");

    const averageStress =
      stressValues.length > 0
        ? Number((stressValues.reduce((sum, value) => sum + value, 0) / stressValues.length).toFixed(1))
        : null;

    const sentiment = {
      positive: analyses.filter((item) => item.sentiment === "POSITIVE").length,
      neutral: analyses.filter((item) => item.sentiment === "NEUTRAL").length,
      negative: analyses.filter((item) => item.sentiment === "NEGATIVE").length,
    };

    // Fingerprint only the summarized source data. We do not send raw diary
    // entries to the weekly summary prompt.
    const sourceData = {
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      checkinCount: checkins.length,
      diaryCount: diaries.length,
      topEmotions,
      topContexts,
      averageStress,
      sentiment,
      observations: analyses.slice(0, 5).map((item) => ({
        summary: item.summary,
        emotionalState: item.emotionalState,
        possibleTriggers: item.possibleTriggers,
      })),
    };
    const sourceFingerprint = fingerprint(sourceData);

    const existing = await prisma.weeklyAIInsight.findUnique({
      where: {
        userId_weekStart_language: {
          userId: user.id,
          weekStart,
          language: language === "id" ? "ID" : "EN",
        },
      },
    });

    if (existing && !regenerate) {
      return NextResponse.json({
        success: true,
        cached: true,
        stale: existing.sourceFingerprint !== sourceFingerprint,
        summary: toSummary(existing),
        meta: {
          model: existing.model ?? GEMINI_MODEL,
          generatedAt: existing.generatedAt,
          period: { start: existing.periodStart.toISOString(), end: existing.periodEnd.toISOString() },
        },
      });
    }

    const languageInstruction =
      language === "id"
        ? "Write all user-facing text in natural Bahasa Indonesia."
        : "Write all user-facing text in natural English.";

    const prompt = `
You are Moodify, an AI emotional wellbeing companion.

Create a concise weekly emotional wellbeing summary based ONLY on the aggregated data below.
${languageInstruction}

Rules:
- Do not diagnose mental health conditions or make medical claims.
- Do not invent facts or infer details that are not supported by the data.
- Use cautious language such as "data minggu ini menunjukkan" / "this week's data suggests".
- Recommendations must be practical and low-risk.
- Do not expose internal reasoning.
- Return ONLY valid JSON, without markdown fences.

Required JSON:
{
  "headline": "Short title, max 80 characters",
  "summary": "2-4 sentence summary, max 500 characters",
  "highlights": ["Observation, maximum 3 items"],
  "reflectionPrompt": "One reflection question, max 180 characters",
  "gentleSuggestion": "One practical suggestion, max 250 characters"
}

AGGREGATED DATA:
${JSON.stringify(sourceData)}
`;

    const response = await generateGeminiContent(prompt, 3);
    if (!response.text?.trim()) {
      return NextResponse.json({ success: false, error: "AI returned an empty response" }, { status: 502 });
    }

    let rawResult: unknown;
    try {
      rawResult = JSON.parse(response.text);
    } catch {
      console.error("[Weekly AI] Gemini returned invalid JSON.");
      return NextResponse.json({ success: false, error: "AI returned invalid JSON" }, { status: 502 });
    }

    const validated = aiResponseSchema.safeParse(rawResult);
    if (!validated.success) {
      console.error("[Weekly AI] Invalid response schema:", validated.error.flatten());
      return NextResponse.json(
        { success: false, error: "AI returned an unexpected response format" },
        { status: 502 },
      );
    }

    const result = validated.data;
    const saved = await prisma.weeklyAIInsight.upsert({
      where: {
        userId_weekStart_language: {
          userId: user.id,
          weekStart,
          language: language === "id" ? "ID" : "EN",
        },
      },
      create: {
        userId: user.id,
        weekStart,
        weekEnd,
        periodStart: start,
        periodEnd: end,
        language: language === "id" ? "ID" : "EN",
        headline: result.headline,
        summary: result.summary,
        highlights: result.highlights,
        reflectionPrompt: result.reflectionPrompt,
        gentleSuggestion: result.gentleSuggestion,
        sourceFingerprint,
        model: GEMINI_MODEL,
        generatedAt: new Date(),
      },
      update: {
        weekEnd,
        periodStart: start,
        periodEnd: end,
        headline: result.headline,
        summary: result.summary,
        highlights: result.highlights,
        reflectionPrompt: result.reflectionPrompt,
        gentleSuggestion: result.gentleSuggestion,
        sourceFingerprint,
        model: GEMINI_MODEL,
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      cached: false,
      stale: false,
      summary: toSummary(saved),
      meta: {
        model: saved.model ?? GEMINI_MODEL,
        generatedAt: saved.generatedAt,
        period: { start: saved.periodStart.toISOString(), end: saved.periodEnd.toISOString() },
      },
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/ai/weekly-summary]", error);

    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : undefined;

    if (status === 429) {
      return NextResponse.json({ success: false, error: "AI request limit reached" }, { status: 429 });
    }

    if (status === 503 || status === 500 || status === 408) {
      return NextResponse.json({ success: false, error: "AI service is temporarily unavailable" }, { status: 503 });
    }

    return NextResponse.json({ success: false, error: "Failed to generate weekly summary" }, { status: 500 });
  }
}
