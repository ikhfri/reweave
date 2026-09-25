import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase();
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const latestAnalysis = await prisma.aIAnalysis.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        stressScore: true,
        emotionalState: true,
        possibleTriggers: true,
        recommendations: true,
        riskLevel: true,
      },
    });

    const activities = await prisma.activity.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
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
    });

    if (!latestAnalysis) {
      return NextResponse.json({
        activities: activities.slice(0, 3),
        reason: "No AI analysis available yet",
      });
    }

    const stressScore = latestAnalysis.stressScore ?? 0;

    const emotionalState = normalize(
      latestAnalysis.emotionalState,
    );

    const recommendations = normalize(
      latestAnalysis.recommendations,
    );

    const triggers = normalize(
      latestAnalysis.possibleTriggers,
    );

    const scored = activities.map((activity) => {
      const category = normalize(activity.category);
      const title = normalize(activity.title);
      const description = normalize(activity.description);

      let score = 0;

      // High stress → breathing / grounding / relaxation
      if (stressScore >= 7) {
        if (
          category.includes("breath") ||
          category.includes("ground") ||
          category.includes("relax") ||
          title.includes("breath") ||
          title.includes("ground")
        ) {
          score += 5;
        }
      }

      // Medium stress
      if (stressScore >= 4 && stressScore < 7) {
        if (
          category.includes("ground") ||
          category.includes("reflection") ||
          category.includes("movement")
        ) {
          score += 3;
        }
      }

      // Emotional state
      if (
        emotionalState.includes("anx") ||
        emotionalState.includes("overwhelm") ||
        emotionalState.includes("stress")
      ) {
        if (
          category.includes("breath") ||
          category.includes("ground") ||
          category.includes("relax")
        ) {
          score += 4;
        }
      }

      if (
        emotionalState.includes("sad") ||
        emotionalState.includes("lonely")
      ) {
        if (category.includes("reflection")) {
          score += 3;
        }
      }

      // AI recommendation / trigger text
      const aiText = `${recommendations} ${triggers}`;

      if (
        aiText.includes("breath") &&
        (category.includes("breath") || title.includes("breath"))
      ) {
        score += 3;
      }

      if (
        aiText.includes("ground") &&
        (category.includes("ground") || title.includes("ground"))
      ) {
        score += 3;
      }

      if (
        aiText.includes("walk") &&
        (category.includes("movement") || title.includes("walk"))
      ) {
        score += 3;
      }

      if (
        aiText.includes("gratitude") &&
        (category.includes("reflection") ||
          title.includes("gratitude"))
      ) {
        score += 3;
      }

      // Small bonus for simple activities
      if (activity.difficulty === "EASY") {
        score += 1;
      }

      // Avoid unused variable warning while still keeping
      // description available for future recommendation logic.
      if (description.length > 0) {
        score += 0;
      }

      return {
        ...activity,
        recommendationScore: score,
      };
    });

    scored.sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore ||
        a.durationMinutes - b.durationMinutes,
    );

    return NextResponse.json({
      activities: scored.slice(0, 3),
      analysis: {
        stressScore: latestAnalysis.stressScore,
        emotionalState: latestAnalysis.emotionalState,
        riskLevel: latestAnalysis.riskLevel,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/activities/recommended error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch recommended activities" },
      { status: 500 },
    );
  }
}