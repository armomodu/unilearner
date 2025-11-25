-- Add performance tracking columns to blog_generations table
-- Run this script manually in your database when ready to enable performance metrics

ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "searchStartedAt" TIMESTAMP(3);
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "searchCompletedAt" TIMESTAMP(3);
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "researchStartedAt" TIMESTAMP(3);
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "researchCompletedAt" TIMESTAMP(3);
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "writerStartedAt" TIMESTAMP(3);
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "writerCompletedAt" TIMESTAMP(3);
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "totalDurationMs" INTEGER;
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "searchDurationMs" INTEGER;
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "researchDurationMs" INTEGER;
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "writerDurationMs" INTEGER;
ALTER TABLE "blog_generations" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Update existing Prisma client after running this:
-- npx prisma generate && npx prisma db push