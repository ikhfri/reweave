import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  console.log("🌱 Seeding Reweave database...");


  const emotions = [
    {
      name: "Happy",
      slug: "happy",
      category: "positive",
      emoji: "😊",
      description: "Feeling happy, cheerful, or joyful.",
    },
    {
      name: "Calm",
      slug: "calm",
      category: "positive",
      emoji: "😌",
      description: "Feeling peaceful, relaxed, and emotionally settled.",
    },
    {
      name: "Excited",
      slug: "excited",
      category: "positive",
      emoji: "🤩",
      description: "Feeling enthusiastic or energized about something.",
    },
    {
      name: "Hopeful",
      slug: "hopeful",
      category: "positive",
      emoji: "🌱",
      description: "Feeling optimistic about the future.",
    },
    {
      name: "Loved",
      slug: "loved",
      category: "positive",
      emoji: "🥰",
      description: "Feeling cared for, connected, or appreciated.",
    },
    {
      name: "Anxious",
      slug: "anxious",
      category: "difficult",
      emoji: "😰",
      description: "Feeling worried, nervous, or uneasy.",
    },
    {
      name: "Stressed",
      slug: "stressed",
      category: "difficult",
      emoji: "😩",
      description: "Feeling pressured, tense, or mentally overloaded.",
    },
    {
      name: "Overwhelmed",
      slug: "overwhelmed",
      category: "difficult",
      emoji: "😵",
      description: "Feeling like emotions or responsibilities are difficult to manage.",
    },
    {
      name: "Sad",
      slug: "sad",
      category: "difficult",
      emoji: "😔",
      description: "Feeling unhappy, disappointed, or emotionally low.",
    },
    {
      name: "Angry",
      slug: "angry",
      category: "difficult",
      emoji: "😡",
      description: "Feeling frustrated, irritated, or angry.",
    },
    {
      name: "Lonely",
      slug: "lonely",
      category: "difficult",
      emoji: "😞",
      description: "Feeling disconnected or lacking companionship.",
    },
    {
      name: "Tired",
      slug: "tired",
      category: "difficult",
      emoji: "🥱",
      description: "Feeling physically or emotionally exhausted.",
    },
  ];

  for (const emotion of emotions) {
    await prisma.emotion.upsert({
      where: {
        slug: emotion.slug,
      },
      update: emotion,
      create: emotion,
    });
  }

  console.log(`✅ ${emotions.length} emotions seeded`);

  // =========================
  // CONTEXTS
  // =========================

  const contexts = [
    {
      name: "School / Work",
      slug: "school-work",
      icon: "🎓",
    },
    {
      name: "Family",
      slug: "family",
      icon: "👨‍👩‍👧",
    },
    {
      name: "Relationship",
      slug: "relationship",
      icon: "❤️",
    },
    {
      name: "Financial",
      slug: "financial",
      icon: "💰",
    },
    {
      name: "Sleep",
      slug: "sleep",
      icon: "😴",
    },
    {
      name: "Physical Health",
      slug: "physical-health",
      icon: "💪",
    },
    {
      name: "Social",
      slug: "social",
      icon: "👥",
    },
    {
      name: "Life Changes",
      slug: "life-changes",
      icon: "🌍",
    },
    {
      name: "Other",
      slug: "other",
      icon: "📌",
    },
  ];

  for (const context of contexts) {
    await prisma.context.upsert({
      where: {
        slug: context.slug,
      },
      update: context,
      create: context,
    });
  }

  console.log(`✅ ${contexts.length} contexts seeded`);

  // =========================
  // ACTIVITIES
  // =========================

  const activities = [
    {
      title: "Box Breathing",
      slug: "box-breathing",
      description:
        "A simple breathing exercise that can help you slow down and create a moment of calm.",
      category: "breathing",
      durationMinutes: 2,
      difficulty: "EASY" as const,
      instructions:
        "Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, then hold for 4 seconds. Repeat for several rounds.",
    },
    {
      title: "Grounding 5-4-3-2-1",
      slug: "grounding-5-4-3-2-1",
      description:
        "A grounding activity that brings your attention back to the present moment.",
      category: "grounding",
      durationMinutes: 5,
      difficulty: "EASY" as const,
      instructions:
        "Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
    },
    {
      title: "Short Walk",
      slug: "short-walk",
      description:
        "Take a short mindful walk and give yourself some space away from your current environment.",
      category: "movement",
      durationMinutes: 10,
      difficulty: "EASY" as const,
      instructions:
        "Walk somewhere safe for 10 minutes. Pay attention to your surroundings, breathing, and how your body feels.",
    },
    {
      title: "Gratitude Journal",
      slug: "gratitude-journal",
      description:
        "Reflect on a few things that you appreciate or that went well today.",
      category: "reflection",
      durationMinutes: 5,
      difficulty: "EASY" as const,
      instructions:
        "Write down three things you appreciate today. They can be small moments, people, experiences, or things you noticed.",
    },
    {
      title: "Progressive Muscle Relaxation",
      slug: "progressive-muscle-relaxation",
      description:
        "A relaxation exercise involving gentle tensing and releasing of different muscle groups.",
      category: "relaxation",
      durationMinutes: 10,
      difficulty: "MODERATE" as const,
      instructions:
        "Sit or lie somewhere comfortable. Gently tense one muscle group for a few seconds, then release and notice the difference. Move through different muscle groups.",
    },
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: {
        slug: activity.slug,
      },
      update: activity,
      create: activity,
    });
  }

  console.log(`✅ ${activities.length} activities seeded`);

  console.log("🎉 Reweave seed completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });