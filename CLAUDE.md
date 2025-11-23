# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UniLearner is an AI-powered blog generation platform using a three-agent sequential workflow (Search → Research → Writer). Built with Next.js 16, TypeScript, Supabase for auth/database, and Prisma ORM.

## Key Commands

### Development
```bash
# Start development server
npm run dev

# Generate Prisma client (run after schema changes)
npx prisma generate

# Push schema changes to database
npx prisma db push

# Build for production
npm run build

# Run linter
npx eslint .

# Type checking (no dedicated script, use tsc directly)
npx tsc --noEmit
```

### Database Operations
```bash
# Generate Prisma client with Windows support
npx prisma generate

# View database in browser
npx prisma studio

# Reset database (DESTRUCTIVE)
npx prisma db push --force-reset
```

## Architecture Overview

### Core Workflow
```
User Input (Topic) → Search Agent (Tavily) → Research Agent (Gemini 3 Pro) → Writer Agent (Claude Sonnet 4.5) → Draft Blog
```

### Project Structure
- **`/src/app/(admin)/`** - Protected admin dashboard with blog management
- **`/src/app/(auth)/`** - Authentication pages (login, signup) 
- **`/src/app/(public)/`** - Public blog reading interface
- **`/src/app/api/`** - API routes for CRUD operations and generation
- **`/src/lib/agents/`** - AI agent implementations (search, research, writer)
- **`/src/lib/workflows/`** - Orchestration logic for blog generation
- **`/src/components/`** - React components, including shadcn/ui
- **`/src/middleware.ts`** - Route protection and authentication redirects

### Database Schema
Key models: `User`, `Blog`, `BlogGeneration`, `Source`
- Blogs have statuses: `GENERATING` → `DRAFT` → `PUBLISHED`
- BlogGeneration tracks async workflow progress
- Sources store citations from web searches

## Important Implementation Details

### Prisma Configuration
The project requires Windows binary targets for local development:
```typescript
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "windows"]
}
```

### Supabase Setup
- Uses connection pooling with direct URL for migrations
- Requires both `DATABASE_URL` and `DIRECT_URL` environment variables
- Authentication middleware protects `/dashboard` routes and redirects users appropriately

### Environment Variables
Required in `.env.local`:
```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# AI Services
TAVILY_API_KEY="..."
GEMINI_API_KEY="..."
ANTHROPIC_API_KEY="..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### AI Agent Implementation
1. **Search Agent** (`lib/agents/search-agent.ts`) - Uses Tavily API to find web sources
   - Import: `import { tavily } from '@tavily/core'`
   - Function call pattern: `tavily({ apiKey }).search(topic, options)`
2. **Research Agent** (`lib/agents/research-agent.ts`) - Uses Gemini 3 Pro to analyze sources  
   - SDK: `@google/genai` (new Gemini 3 API)
   - Model: `gemini-3-pro-preview` with `thinking_level: 'high'`
3. **Writer Agent** (`lib/agents/writer-agent.ts`) - Uses Claude Sonnet 4.5 to generate final content
   - SDK: `@anthropic-ai/sdk`
   - Model: `claude-sonnet-4-5`

### Async Workflow Pattern
Blog generation runs asynchronously:
1. API creates blog record with `GENERATING` status
2. Background workflow updates `BlogGeneration` table at each step
3. Frontend polls status endpoint every 2 seconds
4. On completion, blog status becomes `DRAFT` for user review

### Authentication Flow
- Supabase handles auth with email/password
- Middleware (`src/middleware.ts`) redirects unauthenticated users from `/dashboard` routes
- Authenticated users are redirected from auth pages and root to dashboard
- User records are synced between Supabase and local database via `getOrCreateUser()`
- **Important**: Always compare `blog.userId` with local user ID (`user.id`), not Supabase ID (`session.user.id`)

## Development Workflow

### Adding New Features
1. Update Prisma schema if database changes needed
2. Run `npx prisma generate` and `npx prisma db push`
3. Create/update API routes in `src/app/api/`
4. Build UI components in `src/components/`
5. Test authentication and error handling

### Common Issues
- **Prisma client errors**: Regenerate with `npx prisma generate` after schema changes
- **Connection pooling issues**: Use direct connection URL for migrations, pooled for app
- **Windows development**: Ensure binary targets include "windows" in schema
- **Access denied errors**: Check user ID comparison - use local `user.id`, not `session.user.id`
- **Unique slug constraint**: Blog creation generates unique slugs like `draft-topic-timestamp`
- **AI model errors**: Use correct model names: `gemini-3-pro-preview` and `claude-sonnet-4-5`

### Testing Blog Generation
Use these test topics for development:
- "How to build a REST API with Node.js"
- "The future of artificial intelligence"
- "Best practices for React development"

## shadcn/ui Integration

Components are configured in `components.json` with:
- Style: "new-york" 
- Base color: "neutral"
- CSS variables enabled
- Component aliases: `@/components`, `@/lib/utils`

Add new components with:
```bash
npx shadcn@latest add [component-name]
```

## API Endpoints

### Blog Management
- `GET /api/blogs` - List user's blogs
- `POST /api/blogs/generate` - Start blog generation
- `GET /api/blogs/[id]/status` - Get generation status
- `POST /api/blogs/[id]/publish` - Publish draft blog

### Public Access
- `GET /api/public/blogs` - List published blogs
- `GET /api/public/blogs/[slug]` - Get published blog by slug

## Error Handling Patterns

All AI agents include comprehensive error handling:
- Try-catch blocks with specific error messages
- Database updates on failure with retry counts
- User-friendly error displays in UI
- Logging for debugging

When adding new agents or workflows, follow the established pattern of updating database state on both success and failure.

## Lessons Learned & Setup Best Practices

### Supabase Database Setup
**Problem**: When switching Supabase projects, the new database is empty causing schema mismatches.

**Best Practices**:
1. **Always verify database schema exists** before running the app
2. **Create enum types first** in Supabase SQL Editor:
   ```sql
   CREATE TYPE "BlogStatus" AS ENUM ('GENERATING', 'DRAFT', 'PUBLISHED');
   CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');
   ```
3. **Use both connection URLs** correctly:
   - `DATABASE_URL` - Pooled connection for app (contains `?pgbouncer=true&connection_limit=1`)
   - `DIRECT_URL` - Direct connection for migrations (no pooler parameters)
4. **Test connection** with `npx prisma db push` after setup
5. **Run Prisma generate** after any schema changes: `npx prisma generate`

### Tavily Search API Setup
**Problem**: Import errors and incorrect API usage patterns.

**Best Practices**:
1. **Use correct import**: `import { tavily } from '@tavily/core'` (not `TavilySearchClient`)
2. **Instantiation pattern**: `tavily({ apiKey })` (not `new TavilySearchClient()`)
3. **Parameter names**: Use camelCase (`searchDepth`, `maxResults`, `includeRawContent`)
4. **Content access**: Use `result.rawContent || result.content` for fallback
5. **Test with simple query** before complex searches

### Gemini API Setup
**Problem**: Model naming changes and SDK updates cause 404 errors.

**Best Practices**:
1. **Use latest SDK**: `@google/genai` (not `@google/generative-ai` for Gemini 3)
2. **Correct model name**: `gemini-3-pro-preview` (not older version names)
3. **Enable advanced features**: Add `thinking_level: 'high'` for complex reasoning
4. **JSON responses**: Use `response_mime_type: 'application/json'` for structured output
5. **Test model availability** first with simple prompt before complex workflows

### Claude API Setup  
**Problem**: Outdated model names causing authentication failures.

**Best Practices**:
1. **Use current model**: `claude-sonnet-4-5` (not dated versions like `claude-3-5-sonnet-20241022`)
2. **SDK**: Stick with `@anthropic-ai/sdk` (stable)
3. **Token limits**: Set appropriate `max_tokens` (8000 for blog content)
4. **Temperature**: Use `1` for creative content generation
5. **Error handling**: Parse JSON responses with fallback extraction

### Prisma Windows Development
**Problem**: Binary target mismatches causing client generation failures.

**Best Practices**:
1. **Always include Windows target**:
   ```typescript
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "windows"]
   }
   ```
2. **Regenerate after schema changes**: `npx prisma generate`
3. **Push vs Deploy**: Use `db push` for development, `migrate` for production
4. **Connection testing**: Run `npx prisma studio` to verify connectivity

### Authentication & Access Control
**Problem**: User ID mismatches causing "Access Denied" errors.

**Best Practices**:
1. **Use local user ID**: Compare with `user.id` (from database), not `session.user.id` (from Supabase)
2. **User sync pattern**: Always use `getOrCreateUser(session)` to sync users
3. **Middleware protection**: Protect admin routes with proper redirects
4. **Test with fresh account**: When switching Supabase projects, create new test accounts

### Unique Constraints & Data Integrity
**Problem**: Empty slug fields causing unique constraint violations.

**Best Practices**:
1. **Generate unique identifiers**: Use timestamps or UUIDs for slugs during creation
2. **Pattern**: `draft-${slugified-topic}-${timestamp}` for draft blogs
3. **Validation**: Always validate unique fields before database operations
4. **Error handling**: Provide meaningful error messages for constraint violations

### Development Environment
**Problem**: Environment-specific issues and dependency conflicts.

**Best Practices**:
1. **Environment files**: Use `.env.local` for Next.js (not `.env`)
2. **API key testing**: Verify each API key works independently before integration
3. **Dependency versions**: Pin major versions to avoid breaking changes
4. **Windows compatibility**: Always test Prisma and other tools on target OS
5. **Hot reload**: Restart dev server after environment variable changes