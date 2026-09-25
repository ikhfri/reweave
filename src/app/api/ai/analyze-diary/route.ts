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
  diaryId: z.string().min(1),
  language: z.enum(["id", "en"]).default("id"),
});

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

    const { diaryId, language } = parsed.data;

    const diary = await prisma.diaryEntry.findFirst({
      where: {
        id: diaryId,
        userId: user.id,
      },
      select: {
        id: true,
        content: true,
        entryType: true,
        createdAt: true,
      },
    });

    if (!diary) {
      return NextResponse.json(
        { error: "Diary not found" },
        { status: 404 },
      );
    }

    if (!diary.content?.trim()) {
      return NextResponse.json(
        {
          error: "Diary does not contain text",
        },
        { status: 400 },
      );
    }

    const outputLanguage =
      language === "id"
        ? "Bahasa Indonesia"
        : "English";

    const prompt = `
You are Moodify, an AI emotional wellbeing companion.

Analyze the user's diary entry carefully.

IMPORTANT SAFETY RULES:
- Do not diagnose any mental health disorder.
- Do not claim that the user has depression, anxiety, or another condition.
- Use cautious language such as "your entry suggests", "this may indicate", or "you might be experiencing".
- Do not make unsupported assumptions.
- Do not exaggerate emotional risk.
- Recommendations must be low-risk and practical.
- If there is a possible immediate safety concern, set riskLevel to HIGH.
- Otherwise use LOW or MODERATE.
- Do not include emergency contact information unless explicitly provided.
- Do not expose internal reasoning.

Return ONLY valid JSON.

The response must use ${outputLanguage} for all user-facing text.

Required JSON structure:

{
  "summary": "Short supportive summary of the diary",
  "validationMessage": "A short empathetic validation",
  "stressScore": 0,
  "sentiment": "POSITIVE",
  "emotionalState": "Short description of the emotional state",
  "possibleTriggers": [
    "Possible trigger 1"
  ],
  "thinkingPatterns": [
    "Possible thinking pattern, stated cautiously"
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Short practical recommendation"
    }
  ],
  "riskLevel": "LOW"
}

Rules:
- stressScore must be an integer from 0 to 100.
- sentiment must be one of:
  POSITIVE
  NEUTRAL
  NEGATIVE
- riskLevel must be one of:
  LOW
  MODERATE
  HIGH
- possibleTriggers must contain only patterns reasonably supported by the diary.
- thinkingPatterns must be cautious observations, not diagnoses.
- recommendations should be realistic and safe.
- Keep the response concise.

DIARY ENTRY:

${diary.content}
`;

    const response = await generateGeminiContent(
      prompt,
      3,
    );

    const rawText = response.text;

    if (!rawText) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty response",
        },
        { status: 502 },
      );
    }

    let result: any;

    try {
      result = JSON.parse(rawText);
    } catch (error) {
      console.error(
        "[Diary AI] Invalid Gemini JSON:",
        rawText,
        error,
      );

      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
        },
        { status: 502 },
      );
    }

    const analysis = await prisma.aIAnalysis.create({
      data: {
        userId: user.id,
        diaryEntryId: diary.id,

        summary:
          result.summary ??
          "No summary available.",

        validationMessage:
          result.validationMessage ?? null,

        stressScore:
          typeof result.stressScore === "number"
            ? Math.max(
                0,
                Math.min(100, result.stressScore),
              )
            : null,

        sentiment:
          result.sentiment ?? "NEUTRAL",

        emotionalState:
          result.emotionalState ?? null,

        possibleTriggers:
          Array.isArray(result.possibleTriggers)
            ? result.possibleTriggers
            : [],

        thinkingPatterns:
          Array.isArray(result.thinkingPatterns)
            ? result.thinkingPatterns
            : [],

        recommendations:
          Array.isArray(result.recommendations)
            ? result.recommendations
            : [],

        riskLevel:
          result.riskLevel ?? "LOW",

        model: GEMINI_MODEL,
      },
    });

    console.log("[Diary AI] Analysis created:", {
      analysisId: analysis.id,
      diaryId: diary.id,
      userId: user.id,
      model: GEMINI_MODEL,
      language,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error(
      "[POST /api/ai/analyze-diary]",
      error,
    );

    const status = error?.status;

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "AI service is temporarily unavailable",
        },
        { status: 503 },
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          error: "AI request limit reached",
        },
        { status: 429 },
      );
    }

    if (
      status === 500 ||
      status === 408
    ) {
      return NextResponse.json(
        {
          error: "AI service temporarily failed",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to analyze diary",
      },
      { status: 500 },
    );
  }
}