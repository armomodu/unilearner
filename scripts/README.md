# Performance Metrics Setup

## Current Status
The performance metrics feature has been implemented in the codebase but requires database schema updates to be fully functional.

## What's Working Now
- ✅ Performance metrics UI components (charts, progress bars, ratings)
- ✅ Performance calculation utilities (formatting, percentages, speeds)
- ✅ Fallback handling when database columns don't exist
- ✅ Blog generation workflow with timing measurements
- ✅ Dashboard integration (table column, detailed cards)

## What Needs Database Updates
- ⏳ Storing actual timing data in database
- ⏳ Displaying real performance metrics instead of placeholders
- ⏳ Performance analytics and historical data

## How to Enable Full Performance Metrics

### Option 1: Automatic (Recommended)
When your database connection is working:
```bash
npx prisma generate
npx prisma db push
```

### Option 2: Manual SQL
If Prisma commands fail, run this SQL manually in your database:
```sql
-- See add-performance-metrics.sql for the full script
ALTER TABLE "blog_generations" ADD COLUMN "totalDurationMs" INTEGER;
ALTER TABLE "blog_generations" ADD COLUMN "searchDurationMs" INTEGER;
-- ... (see full script)
```

### Option 3: Fresh Database Setup
If starting with a new Supabase project:
1. Create the enum types first in Supabase SQL Editor:
```sql
CREATE TYPE "BlogStatus" AS ENUM ('GENERATING', 'DRAFT', 'PUBLISHED');
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'SEARCHING', 'RESEARCHING', 'WRITING', 'COMPLETED', 'FAILED');
```
2. Run `npx prisma db push`
3. Run `npx prisma generate`

## Features Available After Database Update
- **Real-time timing**: Track how long each AI agent takes
- **Performance ratings**: Excellent (<2min), Good (<5min), etc.
- **Phase breakdown**: See % of time spent on Search vs Research vs Writing
- **Writing speed**: Words per minute during content generation
- **Historical analytics**: Compare blog generation performance over time
- **Optimization insights**: Identify bottlenecks in the generation process

## Current Fallback Behavior
- Performance metrics columns show "--" when data not available
- Generation workflow continues to work normally
- UI components gracefully handle missing data
- No functionality is broken by the pending database updates