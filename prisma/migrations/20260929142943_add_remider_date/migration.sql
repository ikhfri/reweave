/*
  Warnings:

  - You are about to drop the column `date` on the `ReminderLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,type,reminderDate]` on the table `ReminderLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reminderDate` to the `ReminderLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ReminderLog_userId_date_idx";

-- DropIndex
DROP INDEX "ReminderLog_userId_type_date_key";

-- AlterTable
ALTER TABLE "ReminderLog" DROP COLUMN "date",
ADD COLUMN     "reminderDate" VARCHAR(10) NOT NULL;

-- CreateIndex
CREATE INDEX "ReminderLog_userId_reminderDate_idx" ON "ReminderLog"("userId", "reminderDate");

-- CreateIndex
CREATE INDEX "ReminderLog_sentAt_idx" ON "ReminderLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_userId_type_reminderDate_key" ON "ReminderLog"("userId", "type", "reminderDate");
