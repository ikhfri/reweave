-- CreateTable
CREATE TABLE "WeeklyAIInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'ID',
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "highlights" JSONB NOT NULL,
    "reflectionPrompt" TEXT NOT NULL,
    "gentleSuggestion" TEXT NOT NULL,
    "sourceFingerprint" TEXT NOT NULL,
    "model" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyAIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyAIInsight_userId_idx" ON "WeeklyAIInsight"("userId");

-- CreateIndex
CREATE INDEX "WeeklyAIInsight_weekStart_idx" ON "WeeklyAIInsight"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyAIInsight_userId_weekStart_language_key" ON "WeeklyAIInsight"("userId", "weekStart", "language");

-- AddForeignKey
ALTER TABLE "WeeklyAIInsight" ADD CONSTRAINT "WeeklyAIInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
