-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "CommunicationStyle" AS ENUM ('GENTLE', 'PRACTICAL', 'BALANCED');

-- CreateEnum
CREATE TYPE "SupportPreference" AS ENUM ('LISTEN', 'UNDERSTAND', 'CALM_ACTIVITY', 'REFLECTION', 'PRACTICAL_STEPS', 'SPACE');

-- CreateEnum
CREATE TYPE "JournalingPreference" AS ENUM ('WRITING', 'TALKING', 'TRACKING', 'CALMING_ACTIVITIES', 'EVERYTHING');

-- CreateEnum
CREATE TYPE "DiaryEntryType" AS ENUM ('TEXT', 'VOICE');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "ActivityDifficulty" AS ENUM ('EASY', 'MODERATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communicationStyle" "CommunicationStyle" NOT NULL DEFAULT 'BALANCED',
    "supportPreference" "SupportPreference" NOT NULL DEFAULT 'UNDERSTAND',
    "journalingPreference" "JournalingPreference" NOT NULL DEFAULT 'WRITING',
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dailyCheckinTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answerValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinDate" TIMESTAMP(3) NOT NULL,
    "overallIntensity" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Emotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckinEmotion" (
    "id" TEXT NOT NULL,
    "checkinId" TEXT NOT NULL,
    "emotionId" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckinEmotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckinContext" (
    "id" TEXT NOT NULL,
    "checkinId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckinContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinId" TEXT,
    "content" TEXT,
    "entryType" "DiaryEntryType" NOT NULL DEFAULT 'TEXT',
    "audioUrl" TEXT,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinId" TEXT,
    "diaryEntryId" TEXT,
    "summary" TEXT NOT NULL,
    "validationMessage" TEXT,
    "stressScore" INTEGER,
    "sentiment" "Sentiment",
    "emotionalState" TEXT,
    "possibleTriggers" JSONB,
    "thinkingPatterns" JSONB,
    "recommendations" JSONB,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "difficulty" "ActivityDifficulty" NOT NULL DEFAULT 'EASY',
    "instructions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "checkinId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userRating" INTEGER,
    "userFeedback" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "dominantEmotion" TEXT,
    "averageStress" DOUBLE PRECISION,
    "checkinCount" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "patterns" JSONB,
    "helpfulActivities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinId" TEXT,
    "riskLevel" "RiskLevel" NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Context" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrisisResource" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "availableHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrisisResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "OnboardingAnswer_userId_idx" ON "OnboardingAnswer"("userId");

-- CreateIndex
CREATE INDEX "OnboardingAnswer_questionKey_idx" ON "OnboardingAnswer"("questionKey");

-- CreateIndex
CREATE INDEX "DailyCheckin_userId_idx" ON "DailyCheckin"("userId");

-- CreateIndex
CREATE INDEX "DailyCheckin_checkinDate_idx" ON "DailyCheckin"("checkinDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckin_userId_checkinDate_key" ON "DailyCheckin"("userId", "checkinDate");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_slug_key" ON "Emotion"("slug");

-- CreateIndex
CREATE INDEX "Emotion_category_idx" ON "Emotion"("category");

-- CreateIndex
CREATE INDEX "CheckinEmotion_checkinId_idx" ON "CheckinEmotion"("checkinId");

-- CreateIndex
CREATE INDEX "CheckinEmotion_emotionId_idx" ON "CheckinEmotion"("emotionId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckinEmotion_checkinId_position_key" ON "CheckinEmotion"("checkinId", "position");

-- CreateIndex
CREATE INDEX "CheckinContext_checkinId_idx" ON "CheckinContext"("checkinId");

-- CreateIndex
CREATE INDEX "CheckinContext_contextId_idx" ON "CheckinContext"("contextId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckinContext_checkinId_contextId_key" ON "CheckinContext"("checkinId", "contextId");

-- CreateIndex
CREATE INDEX "DiaryEntry_userId_idx" ON "DiaryEntry"("userId");

-- CreateIndex
CREATE INDEX "DiaryEntry_checkinId_idx" ON "DiaryEntry"("checkinId");

-- CreateIndex
CREATE INDEX "DiaryEntry_createdAt_idx" ON "DiaryEntry"("createdAt");

-- CreateIndex
CREATE INDEX "AIAnalysis_userId_idx" ON "AIAnalysis"("userId");

-- CreateIndex
CREATE INDEX "AIAnalysis_checkinId_idx" ON "AIAnalysis"("checkinId");

-- CreateIndex
CREATE INDEX "AIAnalysis_diaryEntryId_idx" ON "AIAnalysis"("diaryEntryId");

-- CreateIndex
CREATE INDEX "AIAnalysis_createdAt_idx" ON "AIAnalysis"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_activityId_idx" ON "ActivityLog"("activityId");

-- CreateIndex
CREATE INDEX "ActivityLog_checkinId_idx" ON "ActivityLog"("checkinId");

-- CreateIndex
CREATE INDEX "WeeklyInsight_userId_idx" ON "WeeklyInsight"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyInsight_userId_weekStart_key" ON "WeeklyInsight"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "SafetyContact_userId_idx" ON "SafetyContact"("userId");

-- CreateIndex
CREATE INDEX "SafetyEvent_userId_idx" ON "SafetyEvent"("userId");

-- CreateIndex
CREATE INDEX "SafetyEvent_checkinId_idx" ON "SafetyEvent"("checkinId");

-- CreateIndex
CREATE INDEX "SafetyEvent_riskLevel_idx" ON "SafetyEvent"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Context_slug_key" ON "Context"("slug");

-- CreateIndex
CREATE INDEX "CrisisResource_country_idx" ON "CrisisResource"("country");

-- CreateIndex
CREATE INDEX "CrisisResource_isActive_idx" ON "CrisisResource"("isActive");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingAnswer" ADD CONSTRAINT "OnboardingAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckin" ADD CONSTRAINT "DailyCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinEmotion" ADD CONSTRAINT "CheckinEmotion_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinEmotion" ADD CONSTRAINT "CheckinEmotion_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "Emotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinContext" ADD CONSTRAINT "CheckinContext_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinContext" ADD CONSTRAINT "CheckinContext_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "Context"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "DiaryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyInsight" ADD CONSTRAINT "WeeklyInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyContact" ADD CONSTRAINT "SafetyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
