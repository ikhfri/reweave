import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

import { z } from "zod";

const onboardingSchema = z.object({
  gender: z.enum(["MALE", "FEMALE"]).optional(),

  goals: z.array(z.string()).min(1),

  currentFeeling: z.string().min(1),

  contexts: z.array(z.string()).default([]),

  journalingPreference: z.enum([
    "WRITING",
    "TALKING",
    "TRACKING",
    "CALMING_ACTIVITIES",
    "EVERYTHING",
  ]),

  supportPreference: z.enum([
    "LISTEN",
    "UNDERSTAND",
    "CALM_ACTIVITY",
    "REFLECTION",
    "PRACTICAL_STEPS",
    "SPACE",
  ]),

  communicationStyle: z.enum([
    "GENTLE",
    "PRACTICAL",
    "BALANCED",
  ]),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = onboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = result.data;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          gender: data.gender,
        },
      });

      await tx.userPreference.upsert({
        where: {
          userId: user.id,
        },
        update: {
          journalingPreference: data.journalingPreference,
          supportPreference: data.supportPreference,
          communicationStyle: data.communicationStyle,
        },
        create: {
          userId: user.id,
          journalingPreference: data.journalingPreference,
          supportPreference: data.supportPreference,
          communicationStyle: data.communicationStyle,
        },
      });

      await tx.onboardingAnswer.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.onboardingAnswer.createMany({
        data: [
          {
            userId: user.id,
            questionKey: "goals",
            answerValue: JSON.stringify(data.goals),
          },
          {
            userId: user.id,
            questionKey: "currentFeeling",
            answerValue: data.currentFeeling,
          },
          {
            userId: user.id,
            questionKey: "contexts",
            answerValue: JSON.stringify(data.contexts),
          },
        ],
      });

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          onboardingCompleted: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("ONBOARDING_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}