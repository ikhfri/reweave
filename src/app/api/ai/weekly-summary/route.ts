
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGeminiContent, GEMINI_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  language: z.enum(["id", "en"]).default("id"),
  regenerate: z.boolean().optional().default(false),
});

type LanguageCode = "id" | "en";

type WeeklySummary = {
  headline: string;
  summary: string;
  highlights: unknown[];
  reflectionPrompt: string;
  gentleSuggestion: string;
};

function getWeekRange(now = new Date()) {
  // Minggu berjalan: Senin 00:00 sampai Senin berikutnya 00:00.
  // Gunakan UTC agar key cache stabil dan tidak berubah setiap hari.
  const end = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );

  const day = end.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);

  const nextWeek = new Date(start);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  return { start, end: nextWeek };
}

function createFingerprint(data: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

function extractJson<T>(content: string): T {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI returned an invalid JSON response.");
  }

  return JSON.parse(
    cleaned.slice(firstBrace, lastBrace + 1),
  ) as T;
}

function normalizeSummary(value: unknown): WeeklySummary {
  if (!value || typeof value !== "object") {
    throw new Error("AI summary is empty.");
  }

  const data = value as Record<string, unknown>;

  const requiredString = (key: string) => {
    const result = data[key];

    if (typeof result !== "string" || !result.trim()) {
      throw new Error(`AI summary field "${key}" is invalid.`);
    }

    return result.trim();
  };

  return {
    headline: requiredString("headline"),
    summary: requiredString("summary"),
    highlights: Array.isArray(data.highlights)
      ? data.highlights
      : [],
    reflectionPrompt: requiredString("reflectionPrompt"),
    gentleSuggestion: requiredString("gentleSuggestion"),
  };
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = requestSchema.safeParse(await request.json());

    if (!body.success) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const userId = currentUser.id;
    const language: LanguageCode = body.data.language;
    const forceRegenerate = body.data.regenerate;

    const languageKey = language === "id" ? "ID" : "EN";
    const { start, end } = getWeekRange();

    // Data yang sama dengan yang digunakan untuk membuat prompt
    // menghasilkan fingerprint yang sama.
    const [checkins, diaries] = await Promise.all([
      prisma.dailyCheckin.findMany({
        where: {
          userId,
          checkinDate: {
            gte: start,
            lt: end,
          },
        },
        orderBy: { checkinDate: "asc" },
        include: {
          emotions: {
            include: { emotion: true },
            orderBy: { position: "asc" },
          },
          contexts: {
            include: { context: true },
          },
        },
      }),

      prisma.diaryEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          entryType: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    if (checkins.length === 0 && diaries.length === 0) {
      return NextResponse.json({
        summary: null,
        stale: false,
        cached: false,
        message:
          language === "id"
            ? "Belum ada catatan untuk minggu ini."
            : "There are no entries for this week yet.",
      });
    }

    const sourceData = {
      checkins: checkins.map((checkin) => ({
        id: checkin.id,
        date: checkin.checkinDate.toISOString(),
        intensity: checkin.overallIntensity,
        note: checkin.note,
        updatedAt: checkin.updatedAt.toISOString(),
        emotions: checkin.emotions.map((item) => ({
          name: item.emotion.name,
          intensity: item.intensity,
          note: item.note,
          position: item.position,
        })),
        contexts: checkin.contexts.map((item) => ({
          name: item.context.name,
          slug: item.context.slug,
        })),
      })),
      diaries: diaries.map((diary) => ({
        id: diary.id,
        content: diary.content,
        entryType: diary.entryType,
        createdAt: diary.createdAt.toISOString(),
        updatedAt: diary.updatedAt.toISOString(),
      })),
    };

    const sourceFingerprint = createFingerprint(sourceData);

    const existing = await prisma.weeklyAIInsight.findUnique({
      where: {
        userId_weekStart_language: {
          userId,
          weekStart: start,
          language: languageKey,
        },
      },
    });

    // Cache hit: data belum berubah, jadi tidak perlu memanggil AI.
    if (
      existing &&
      existing.sourceFingerprint === sourceFingerprint &&
      !forceRegenerate
    ) {
      return NextResponse.json({
        summary: {
          headline: existing.headline,
          summary: existing.summary,
          highlights: existing.highlights,
          reflectionPrompt: existing.reflectionPrompt,
          gentleSuggestion: existing.gentleSuggestion,
        },
        stale: false,
        cached: true,
        generatedAt: existing.generatedAt,
      });
    }

    const prompt =
      language === "id"
        ? `
Kamu adalah pendamping refleksi emosional untuk aplikasi Reweave.
Gunakan bahasa Indonesia yang natural, hangat, tenang, tidak menghakimi,
dan tidak memberikan diagnosis medis.

Analisis data refleksi pengguna selama satu minggu berikut.
Gunakan hanya informasi yang tersedia. Jangan mengarang penyebab,
gejala, atau kejadian yang tidak disebutkan pengguna.

Data minggu ini:
${JSON.stringify(sourceData, null, 2)}

Buat refleksi yang personal dan spesifik. Hindari kalimat generik,
klaim klinis, atau kesimpulan berlebihan dari data yang terbatas.

Balas HANYA dengan JSON valid menggunakan struktur:
{
  "headline": "Judul refleksi singkat",
  "summary": "Ringkasan pola emosi dan konteks minggu ini",
  "highlights": [
    {
      "title": "Temuan singkat",
      "description": "Penjelasan berdasarkan data",
      "type": "emotion"
    }
  ],
  "reflectionPrompt": "Satu pertanyaan refleksi yang lembut",
  "gentleSuggestion": "Satu saran sederhana dan realistis"
}

Highlights harus berupa array. Jika data terbatas, sampaikan
ketidakpastian secara wajar. Jangan membuat diagnosis kesehatan mental.
`
        : `
You are an emotional reflection companion for Reweave.
Use natural, warm, calm, non-judgmental language. Do not provide
medical diagnoses.

Analyze the user's emotional reflections for this week using only
the information provided. Do not invent causes, symptoms, or events.

Weekly data:
${JSON.stringify(sourceData, null, 2)}

Make the reflection personal and specific. Avoid generic advice,
clinical claims, or conclusions that go beyond the available data.

Return ONLY valid JSON with this structure:
{
  "headline": "A short reflection headline",
  "summary": "A summary of this week's emotional patterns and context",
  "highlights": [
    {
      "title": "A concise observation",
      "description": "An explanation grounded in the data",
      "type": "emotion"
    }
  ],
  "reflectionPrompt": "One gentle reflection question",
  "gentleSuggestion": "One simple, realistic suggestion"
}

Highlights must be an array. If the data is limited, acknowledge
uncertainty. Do not make mental health diagnoses.
`;

   const response = await generateGeminiContent(prompt, 3);

const summary = normalizeSummary(
  extractJson<unknown>(response.text),
);

    // Simpan hasil terbaru. Unique key mencegah satu baris per
    // pengguna, minggu, dan bahasa.
    const saved = await prisma.weeklyAIInsight.upsert({
      where: {
        userId_weekStart_language: {
          userId,
          weekStart: start,
          language: languageKey,
        },
      },
      create: {
        userId,
        weekStart: start,
        weekEnd: end,
        periodStart: start,
        periodEnd: end,
        language: languageKey,
        headline: summary.headline,
        summary: summary.summary,
        highlights: summary.highlights as never,
        reflectionPrompt: summary.reflectionPrompt,
        gentleSuggestion: summary.gentleSuggestion,
        sourceFingerprint,
        model: GEMINI_MODEL,
      },
      update: {
        weekEnd: end,
        periodStart: start,
        periodEnd: end,
        headline: summary.headline,
        summary: summary.summary,
        highlights: summary.highlights as never,
        reflectionPrompt: summary.reflectionPrompt,
        gentleSuggestion: summary.gentleSuggestion,
        sourceFingerprint,
        model: GEMINI_MODEL,
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({
      summary: {
        headline: saved.headline,
        summary: saved.summary,
        highlights: saved.highlights,
        reflectionPrompt: saved.reflectionPrompt,
        gentleSuggestion: saved.gentleSuggestion,
      },
      stale: false,
      cached: false,
      generatedAt: saved.generatedAt,
    });
  } catch (error: unknown) {
    console.error("[Weekly Summary] Failed:", error);

    return NextResponse.json(
      { error: "Failed to generate weekly summary." },
      { status: 500 },
    );
  }
}
