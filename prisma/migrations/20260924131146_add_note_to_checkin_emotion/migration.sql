/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CheckinEmotion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CheckinEmotion" DROP CONSTRAINT "CheckinEmotion_emotionId_fkey";

-- DropIndex
DROP INDEX "CheckinEmotion_checkinId_position_key";

-- AlterTable
ALTER TABLE "CheckinEmotion" DROP COLUMN "createdAt",
ADD COLUMN     "note" TEXT;

-- AddForeignKey
ALTER TABLE "CheckinEmotion" ADD CONSTRAINT "CheckinEmotion_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "Emotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
