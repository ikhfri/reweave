-- CreateTable
CREATE TABLE "EmotionDescription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinId" TEXT,
    "description" TEXT NOT NULL,
    "aiEmotion" TEXT,
    "aiEmotionReason" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionDescription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmotionDescription" ADD CONSTRAINT "EmotionDescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionDescription" ADD CONSTRAINT "EmotionDescription_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
