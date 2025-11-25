-- Complete database schema for UniLearner
-- Run this in Supabase SQL Editor if Prisma commands fail

-- First create the enums
CREATE TYPE "BlogStatus" AS ENUM ('GENERATING', 'DRAFT', 'PUBLISHED');
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'SEARCHING', 'RESEARCHING', 'WRITING', 'COMPLETED', 'FAILED');

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "supabaseId" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Blogs table
CREATE TABLE IF NOT EXISTS "blogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT UNIQUE,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "BlogStatus" NOT NULL DEFAULT 'GENERATING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "blogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Blog generations table (with performance metrics)
CREATE TABLE IF NOT EXISTS "blog_generations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogId" TEXT NOT NULL UNIQUE,
    "status" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" TEXT,
    "searchComplete" BOOLEAN NOT NULL DEFAULT false,
    "searchData" JSONB,
    "searchStartedAt" TIMESTAMP(3),
    "searchCompletedAt" TIMESTAMP(3),
    "researchComplete" BOOLEAN NOT NULL DEFAULT false,
    "researchData" JSONB,
    "researchStartedAt" TIMESTAMP(3),
    "researchCompletedAt" TIMESTAMP(3),
    "writerComplete" BOOLEAN NOT NULL DEFAULT false,
    "writerStartedAt" TIMESTAMP(3),
    "writerCompletedAt" TIMESTAMP(3),
    "totalDurationMs" INTEGER,
    "searchDurationMs" INTEGER,
    "researchDurationMs" INTEGER,
    "writerDurationMs" INTEGER,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "blog_generations_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Sources table
CREATE TABLE IF NOT EXISTS "sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "relevance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sources_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "users_supabaseId_idx" ON "users"("supabaseId");
CREATE INDEX IF NOT EXISTS "blogs_userId_status_idx" ON "blogs"("userId", "status");
CREATE INDEX IF NOT EXISTS "blogs_slug_idx" ON "blogs"("slug");
CREATE INDEX IF NOT EXISTS "blogs_publishedAt_idx" ON "blogs"("publishedAt");
CREATE INDEX IF NOT EXISTS "blogs_status_idx" ON "blogs"("status");
CREATE INDEX IF NOT EXISTS "blog_generations_status_updatedAt_idx" ON "blog_generations"("status", "updatedAt");
CREATE INDEX IF NOT EXISTS "blog_generations_blogId_idx" ON "blog_generations"("blogId");
CREATE INDEX IF NOT EXISTS "sources_blogId_idx" ON "sources"("blogId");

-- After running this, run:
-- npx prisma db pull
-- npx prisma generate