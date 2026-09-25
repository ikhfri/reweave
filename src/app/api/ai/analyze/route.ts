/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateGeminiContent,
  GEMINI_MODEL,
} from "@/lib/gemini";

const analyzeSchema = z.object({
  checkinId: z.string().min(1, "Check-in ID is required"),
  language: z.enum(["id", "en"]).default("id"),
});

const aiResponseSchema = z.object({
  summary: z.string(),
  validationMessage: z.string().nullable(),
  stressScore: z.number().int().min(0).max(100),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  emotionalState: z.string(),
  possibleTriggers: z.array(z.string()),
  thinkingPatterns: z.array(z.string()),
  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH"]),
});

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 2. Validate request
    // --------------------------------------------------

    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid analysis request.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { checkinId, language } = parsed.data;

    // --------------------------------------------------
    // 3. Get check-in
    // --------------------------------------------------

    const checkin = await prisma.dailyCheckin.findFirst({
      where: {
        id: checkinId,
        userId: user.id,
      },
      include: {
        emotions: {
          include: {
            emotion: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        contexts: {
          include: {
            context: true,
          },
        },
        diaryEntries: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!checkin) {
      return NextResponse.json(
        {
          success: false,
          message: "Check-in not found.",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // 4. Check existing AI analysis
    // --------------------------------------------------

    const existingAnalysis = await prisma.aIAnalysis.findFirst({
      where: {
        userId: user.id,
        checkinId: checkin.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingAnalysis) {
      return NextResponse.json({
        success: true,
        message: "AI analysis already exists.",
        analysis: existingAnalysis,
      });
    }

    // --------------------------------------------------
    // 5. Prepare data for Gemini
    // --------------------------------------------------

    const emotions = checkin.emotions.map((item) => ({
      name: item.emotion.name,
      slug: item.emotion.slug,
      intensity: item.intensity,
      note: item.note ?? null,
    }));

    const contexts = checkin.contexts.map(
      (item) => item.context.name,
    );

    const diaryEntry = checkin.diaryEntries[0] ?? null;
    const diaryContent = diaryEntry?.content?.trim() ?? "";

    // --------------------------------------------------
    // 6. Language instruction
    // --------------------------------------------------

    const languageInstruction =
      language === "id"
        ? `
LANGUAGE REQUIREMENT:
Respond entirely in natural Bahasa Indonesia.

Every user-facing text in the JSON MUST be written in Bahasa Indonesia:
- summary
- validationMessage
- emotionalState
- possibleTriggers
- thinkingPatterns
- recommendations.title
- recommendations.description

Do not use English for these fields.
Use natural, warm, clear Indonesian that sounds like a supportive human companion.

Technical enum values must remain exactly as specified:
POSITIVE, NEUTRAL, NEGATIVE
LOW, MODERATE, HIGH
`
        : `
LANGUAGE REQUIREMENT:
Respond entirely in natural English.

Every user-facing text in the JSON MUST be written in English:
- summary
- validationMessage
- emotionalState
- possibleTriggers
- thinkingPatterns
- recommendations.title
- recommendations.description

Use natural, warm, clear English that sounds like a supportive human companion.

Technical enum values must remain exactly as specified:
POSITIVE, NEUTRAL, NEGATIVE
LOW, MODERATE, HIGH
`;

    // --------------------------------------------------
    // 7. Gemini prompt
    // --------------------------------------------------

    const prompt = `
You are Moodify's AI Emotional Wellbeing Companion.

Your role is to help users understand their emotional wellbeing
based only on the information they provide.

You are NOT a doctor, therapist, or diagnostic system.

${languageInstruction}

Analyze the user's daily emotional check-in using TWO main sources:

1. Emotion-specific notes
2. Daily Story

The emotion-specific notes explain WHY the user selected each emotion.

The Daily Story provides broader context about the user's day.

USER CHECK-IN

Emotion-specific information:
${JSON.stringify(emotions, null, 2)}

Contexts:
${JSON.stringify(contexts, null, 2)}

Daily Story:
${diaryContent || "No Daily Story provided."}

IMPORTANT SAFETY RULES

1. Do not diagnose mental health conditions.
2. Do not claim the user has anxiety, depression, PTSD,
   or another disorder.
3. Treat emotions and their notes as the user's own
   description of their experience.
4. Use cautious language when identifying patterns.
5. Do not invent triggers that are not supported by
   the provided information.
6. Recommendations should be practical, gentle,
   and low-risk.
7. Do not provide medical treatment instructions.
8. If the content suggests possible immediate safety
   concerns, set riskLevel to HIGH.
9. Otherwise use LOW or MODERATE based on the available
   information.
10. Do not include diagnosis labels in thinkingPatterns.
11. Do not infer information that the user did not provide.

ANALYSIS LOGIC

Use the emotion-specific notes to understand the reason
behind each selected emotion.

Use the Daily Story to understand the broader context.

When the emotion note and Daily Story support each other,
you may identify that connection.

Example:

Emotion:
Anxious

Emotion note:
"I have three assignments due tomorrow."

Daily Story:
"I spent most of today trying to finish school work."

Possible trigger:
"School workload and upcoming deadlines."

Do not treat a single emotion note as proof of a mental
health condition.

STRESS SCORE

Return a stressScore from 0 to 100.

This is a general wellbeing indicator, NOT a clinical
measurement.

SENTIMENT

Choose exactly one:

POSITIVE
NEUTRAL
NEGATIVE

EMOTIONAL STATE

Describe the overall emotional state briefly.

Example:
"Mentally pressured and somewhat tired"

POSSIBLE TRIGGERS

Only include triggers supported by:

- emotion-specific notes
- Daily Story
- selected contexts

Do not invent triggers.

If there is not enough evidence, return an empty array.

THINKING PATTERNS

Only include possible thinking patterns when there is
enough evidence.

Use cautious wording.

For Bahasa Indonesia, examples include:
- "Kemungkinan terlalu banyak berpikir"
- "Kemungkinan memberi tekanan pada diri sendiri"
- "Kemungkinan merasa tidak yakin"

For English, examples include:
- "Possible overthinking"
- "Possible self-pressure"
- "Possible uncertainty"

Do not diagnose cognitive disorders.

If there is not enough evidence, return an empty array.

RECOMMENDATIONS

Give 2-4 practical recommendations.

Recommendations should:
- relate to the user's actual situation when possible
- be realistic
- be low-risk
- not sound like medical treatment
- not assume a diagnosis

If the user appears to be experiencing immediate safety concerns,
do not give dangerous or overly specific instructions.
Keep the response focused on immediate support and encourage
contact with appropriate emergency or crisis support.

Return ONLY valid JSON.

Use this exact structure:

{
  "summary": "string",
  "validationMessage": "string or null",
  "stressScore": 0,
  "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
  "emotionalState": "string",
  "possibleTriggers": ["string"],
  "thinkingPatterns": ["string"],
  "recommendations": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "riskLevel": "LOW | MODERATE | HIGH"
}
`;

    // --------------------------------------------------
    // 8. Call Gemini with retry
    // --------------------------------------------------

    const response = await generateGeminiContent(prompt, 3);
    const rawText = response.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    // --------------------------------------------------
    // 9. Parse Gemini JSON
    // --------------------------------------------------

    let aiData: unknown;

    try {
      aiData = JSON.parse(rawText);
    } catch {
      console.error("Invalid Gemini JSON:", rawText);

      return NextResponse.json(
        {
          success: false,
          message: "AI returned an invalid response.",
        },
        { status: 502 },
      );
    }

    const validatedAI = aiResponseSchema.safeParse(aiData);

    if (!validatedAI.success) {
      console.error(
        "Invalid AI response structure:",
        validatedAI.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          message: "AI returned an unexpected response.",
          errors: validatedAI.error.flatten(),
        },
        { status: 502 },
      );
    }

    const analysisData = validatedAI.data;

    // --------------------------------------------------
    // 10. Save AI analysis
    // --------------------------------------------------

    const analysis = await prisma.aIAnalysis.create({
      data: {
        userId: user.id,
        checkinId: checkin.id,
        diaryEntryId: diaryEntry?.id ?? null,

        summary: analysisData.summary,

        validationMessage:
          analysisData.validationMessage,

        stressScore:
          analysisData.stressScore,

        sentiment:
          analysisData.sentiment,

        emotionalState:
          analysisData.emotionalState,

        possibleTriggers:
          analysisData.possibleTriggers,

        thinkingPatterns:
          analysisData.thinkingPatterns,

        recommendations:
          analysisData.recommendations,

        riskLevel:
          analysisData.riskLevel,

        model: GEMINI_MODEL,
      },
    });

    console.log("AI ANALYSIS CREATED:", {
      analysisId: analysis.id,
      checkinId: analysis.checkinId,
      userId: analysis.userId,
      language,
      model: GEMINI_MODEL,
    });

    // --------------------------------------------------
    // 11. Return result
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "AI analysis generated successfully.",
        analysis,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error(
      "POST /api/ai/analyze error:",
      error,
    );

    const status = error?.status;

    if (status === 503) {
      return NextResponse.json(
        {
          success: false,
          code: "AI_TEMPORARILY_UNAVAILABLE",
          message:
            "AI analysis is temporarily unavailable. Your check-in has been saved. Please try again.",
        },
        { status: 503 },
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          success: false,
          code: "AI_RATE_LIMITED",
          message:
            "AI analysis is temporarily rate limited. Your check-in has been saved. Please try again shortly.",
        },
        { status: 429 },
      );
    }

    if (status === 500 || status === 408) {
      return NextResponse.json(
        {
          success: false,
          code: "AI_TEMPORARY_ERROR",
          message:
            "AI analysis is temporarily unavailable. Your check-in has been saved. Please try again.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate AI analysis.",
      },
      { status: 500 },
    );
  }
}
