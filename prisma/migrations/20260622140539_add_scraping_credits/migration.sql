-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "extraCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scrapingCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "plan" SET DEFAULT 'starter';
