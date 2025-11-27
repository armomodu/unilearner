-- ============================================
-- Graphics Agent Support Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create new enums
DO $$ BEGIN
  CREATE TYPE "StyleType" AS ENUM ('WRITING', 'GRAPHICS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new value to GenerationStatus enum
ALTER TYPE "GenerationStatus" ADD VALUE IF NOT EXISTS 'GENERATING_GRAPHICS';

-- Step 2: Add columns to writing_styles table
ALTER TABLE writing_styles
  ADD COLUMN IF NOT EXISTS "style_type" "StyleType" DEFAULT 'WRITING' NOT NULL,
  ADD COLUMN IF NOT EXISTS "graphics_config" JSONB;

-- Step 3: Add columns to blogs table
ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS "graphics_style_id" TEXT,
  ADD COLUMN IF NOT EXISTS "graphics" JSONB;

-- Step 4: Add foreign key constraint for graphics_style_id
DO $$ BEGIN
  ALTER TABLE blogs
    ADD CONSTRAINT "blogs_graphics_style_id_fkey"
    FOREIGN KEY ("graphics_style_id")
    REFERENCES writing_styles(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 5: Add columns to blog_generations table
ALTER TABLE blog_generations
  ADD COLUMN IF NOT EXISTS "graphics_complete" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "graphics_data" JSONB,
  ADD COLUMN IF NOT EXISTS "graphics_started_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "graphics_completed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "graphics_duration_ms" INTEGER;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS "writing_styles_style_type_idx" ON writing_styles("style_type");

-- Step 7: Verify changes
SELECT
  'writing_styles' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'writing_styles'
  AND column_name IN ('style_type', 'graphics_config')
UNION ALL
SELECT
  'blogs' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'blogs'
  AND column_name IN ('graphics_style_id', 'graphics')
UNION ALL
SELECT
  'blog_generations' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'blog_generations'
  AND column_name IN ('graphics_complete', 'graphics_data', 'graphics_started_at', 'graphics_completed_at', 'graphics_duration_ms')
ORDER BY table_name, column_name;
