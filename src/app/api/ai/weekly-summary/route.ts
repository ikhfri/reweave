import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGeminiContent } from "@/lib/gemini";

function getSevenDaysRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export async function POST(request: Request) {
  // Deklarasikan variabel isId di luar try agar dapat diakses di catch block
  let isId = true;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const language = body.language === "id" ? "id" : "en";
    isId = language === "id";

    const { start, end } = getSevenDaysRange();

    // 1. Ambil data Check-in dan Diary 7 hari terakhir
    const [checkins, diaries] = await Promise.all([
      prisma.dailyCheckin.findMany({
        where: {
          userId: user.id,
          checkinDate: { gte: start, lte: end },
        },
        include: {
          emotions: { include: { emotion: true } },
          contexts: { include: { context: true } },
        },
        orderBy: { checkinDate: "asc" },
      }),
      prisma.diaryEntry.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: start, lte: end },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // 2. Tangani jika belum ada data sama sekali
    if (checkins.length === 0 && diaries.length === 0) {
      return NextResponse.json({
        summary: null,
        message: isId
          ? "Belum ada cukup data untuk membuat refleksi."
          : "Not enough data to generate a reflection.",
      });
    }

    // 3. Susun ringkasan data aktivitas
    const activityData = {
      totalCheckins: checkins.length,
      totalDiaries: diaries.length,
      emotionsLogged: checkins.flatMap((c) =>
        c.emotions.map((e) => e.emotion.name),
      ),
      contextsLogged: checkins.flatMap((c) =>
        c.contexts.map((ct) => ct.context.name),
      ),
      diaryExcerpts: diaries
        .map((d) => d.content)
        .filter(Boolean)
        .slice(0, 5),
    };

    // 4. Buat prompt terstruktur
    const prompt = `
You are an empathetic, gentle wellness reflection assistant for an app called Reweave.
Analyze the following user's 7-day emotional log data and produce a JSON response.

STRICT INSTRUCTIONS:
- You MUST respond ONLY with a valid JSON object.
- Do NOT output any explanation, prelude, or Markdown codeblock syntax.
- Language: ${isId ? "Indonesian (Bahasa Indonesia)" : "English"}.

REQUIRED JSON SCHEMA:
{
  "headline": "A short, warm headline capturing the essence of their week",
  "summary": "A 2-3 sentence empathetic summary reflecting on their feelings and journey",
  "highlights": ["Key pattern or observation 1", "Key pattern or observation 2"],
  "reflectionPrompt": "A gentle, open question for the user to contemplate",
  "gentleSuggestion": "A low-pressure, actionable small step for next week"
}

USER LOG DATA:
${JSON.stringify(activityData, null, 2)}
`;

    // 5. Panggil AI via centralized helper
    const response = await generateGeminiContent(prompt, 3);
    const rawText = response.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: isId ? "Respon AI kosong." : "AI returned empty response." },
        { status: 502 },
      );
    }

    // 6. Parse JSON
    let parsedSummary;
    try {
      parsedSummary = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("[Weekly AI Error] Gagal parsing JSON:", rawText, parseErr);
      return NextResponse.json(
        { error: isId ? "Gagal memproses format data AI." : "Failed to parse AI output format." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      summary: parsedSummary,
      stale: false,
    });
  } catch (error: unknown) {
    console.error("[POST /api/ai/weekly-summary Error]:", error);

    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : undefined;

    if (status === 429) {
      return NextResponse.json(
        { error: isId ? "Batas pemanggilan AI tercapai." : "AI request limit reached." },
        { status: 429 },
      );
    }

    if (status === 503 || status === 500) {
      return NextResponse.json(
        { error: isId ? "Layanan AI sedang tidak tersedia." : "AI service temporarily unavailable." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: isId ? "Gagal membuat refleksi mingguan." : "Failed to generate weekly reflection." },
      { status: 500 },
    );
  }
}