-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ID', 'EN');

-- AlterTable
ALTER TABLE "UserPreference" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'ID';
