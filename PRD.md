# UniLearner - Technical Implementation Specification

**Version:** 2.0 (Code Generation Optimized)  
**Target:** AI Code Generation Tools  
**Timeline:** 6-8 weeks  
**Last Updated:** November 21, 2024

---

## SYSTEM OVERVIEW

UniLearner is an AI-powered blog generation platform using a three-agent sequential workflow.

**Core Flow:**
```
User Input (Topic) → Search Agent → Research Agent → Writer Agent → Draft Blog
```

**Key Characteristics:**
- Simple sequential processing (no complex orchestration)
- Background job execution with polling-based status updates
- Database-driven state management
- Supabase for auth and database
- Next.js 14 full-stack application

---

## TECHNOLOGY STACK

### Frontend
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript (strict mode)
Styling: Tailwind CSS v3
UI Components: shadcn/ui
Form Validation: React Hook Form + Zod
Markdown Rendering: react-markdown + remark-gfm
```

### Backend
```yaml
Runtime: Next.js API Routes (Edge Functions where possible)
Language: TypeScript (strict mode)
Workflow: Async functions (no orchestration framework)
```

### Database & Auth
```yaml
Platform: Supabase
Database: PostgreSQL 15+
ORM: Prisma v5
Auth: Supabase Auth (JWT-based)
```

### AI Services
```yaml
Search: Tavily API
Research: Google Gemini 2.0 Flash (gemini-2.0-flash-exp)
Writing: Anthropic Claude Sonnet 4 (claude-sonnet-4-20250514)
```

### Deployment
```yaml
Platform: Vercel
Region: Auto (Edge-optimized)
Cron Jobs: Vercel Cron (retry stuck generations every 10 minutes)
```

---

## PROJECT STRUCTURE

```
unilearner/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx              # Protected layout with auth check
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Blog list, stats
│   │   ├── blogs/
│   │   │   ├── page.tsx            # All blogs table
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # View/edit blog
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx    # Edit interface
│   │   │   └── new/
│   │   │       └── page.tsx        # Create new blog form
│   │   └── generate/
│   │       └── [blogId]/
│   │           └── page.tsx        # Generation progress page
│   ├── (public)/
│   │   ├── page.tsx                # Public homepage (blog list)
│   │   └── blog/
│   │       └── [slug]/
│   │           └── page.tsx        # Individual blog reading page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts        # Supabase auth callback
│   │   │   └── user/
│   │   │       └── route.ts        # Get current user
│   │   ├── blogs/
│   │   │   ├── route.ts            # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts        # GET, PUT, DELETE
│   │   │   │   ├── publish/
│   │   │   │   │   └── route.ts    # POST publish
│   │   │   │   ├── unpublish/
│   │   │   │   │   └── route.ts    # POST unpublish
│   │   │   │   └── status/
│   │   │   │       └── route.ts    # GET generation status
│   │   │   └── generate/
│   │   │       └── route.ts        # POST start generation
│   │   ├── public/
│   │   │   └── blogs/
│   │   │       ├── route.ts        # GET published blogs
│   │   │       └── [slug]/
│   │   │           └── route.ts    # GET blog by slug
│   │   └── cron/
│   │       └── retry-stuck/
│   │           └── route.ts        # Cron job for retries
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Tailwind imports
├── lib/
│   ├── agents/
│   │   ├── search-agent.ts         # Tavily integration
│   │   ├── research-agent.ts       # Gemini integration
│   │   └── writer-agent.ts         # Claude integration
│   ├── workflows/
│   │   └── blog-generation.ts      # Main workflow orchestration
│   ├── supabase/
│   │   ├── client.ts               # Client-side Supabase
│   │   ├── server.ts               # Server-side Supabase
│   │   └── middleware.ts           # Auth middleware
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # Helper functions
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── blog-card.tsx
│   ├── blog-editor.tsx
│   ├── generation-progress.tsx
│   ├── markdown-renderer.tsx
│   └── ... (other components)
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Migration files
├── public/
│   └── ... (static assets)
├── .env.local                      # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json                     # Vercel config with cron
```

---

## DATABASE SCHEMA

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// USER MODEL
// ============================================
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  name       String?
  supabaseId String   @unique
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  blogs      Blog[]
  
  @@index([supabaseId])
  @@map("users")
}

// ============================================
// BLOG MODEL
// ============================================
model Blog {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  content     String     @db.Text
  excerpt     String?    @db.Text
  status      BlogStatus @default(GENERATING)
  
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  generation  BlogGeneration?
  sources     Source[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  publishedAt DateTime?
  
  @@index([userId, status])
  @@index([slug])
  @@index([publishedAt])
  @@index([status])
  @@map("blogs")
}

// ============================================
// BLOG GENERATION TRACKING MODEL
// ============================================
model BlogGeneration {
  id               String           @id @default(cuid())
  blogId           String           @unique
  blog             Blog             @relation(fields: [blogId], references: [id], onDelete: Cascade)
  
  status           GenerationStatus @default(PENDING)
  currentStep      String?
  
  searchComplete   Boolean          @default(false)
  searchData       Json?
  
  researchComplete Boolean          @default(false)
  researchData     Json?
  
  writerComplete   Boolean          @default(false)
  
  error            String?          @db.Text
  retryCount       Int              @default(0)
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  
  @@index([status, updatedAt])
  @@index([blogId])
  @@map("blog_generations")
}

// ============================================
// SOURCE MODEL
// ============================================
model Source {
  id        String   @id @default(cuid())
  blogId    String
  blog      Blog     @relation(fields: [blogId], references: [id], onDelete: Cascade)
  
  url       String
  title     String
  excerpt   String?  @db.Text
  relevance Float?
  
  createdAt DateTime @default(now())
  
  @@index([blogId])
  @@map("sources")
}

// ============================================
// ENUMS
// ============================================
enum BlogStatus {
  GENERATING  // Being created by agents
  DRAFT       // Ready for review/editing
  PUBLISHED   // Live on public site
}

enum GenerationStatus {
  PENDING     // Queued for processing
  SEARCHING   // Search agent running
  RESEARCHING // Research agent running
  WRITING     // Writer agent running
  COMPLETED   // Successfully completed
  FAILED      // Failed with error
}
```

---

## ENVIRONMENT VARIABLES

**File:** `.env.local`

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."

# AI Services
TAVILY_API_KEY="tvly-..."
GEMINI_API_KEY="AIza..."
ANTHROPIC_API_KEY="sk-ant-..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## AGENT IMPLEMENTATIONS

### 1. Search Agent (Tavily)

**File:** `lib/agents/search-agent.ts`

```typescript
import { TavilySearchClient } from '@tavily/core';

export interface SearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
}

/**
 * Search Agent - Uses Tavily API to find relevant web sources
 * 
 * @param topic - The blog topic to search for
 * @returns Array of search results with content
 * @throws Error if Tavily API fails
 */
export async function searchAgent(topic: string): Promise<SearchResult[]> {
  const tavily = new TavilySearchClient({
    apiKey: process.env.TAVILY_API_KEY!,
  });
  
  try {
    const response = await tavily.search(topic, {
      searchDepth: 'advanced',
      maxResults: 10,
      includeAnswer: false,
      includeRawContent: true,
    });
    
    return response.results.map(result => ({
      url: result.url,
      title: result.title,
      content: result.content,
      score: result.score,
    }));
  } catch (error) {
    console.error('Search agent error:', error);
    throw new Error(`Search agent failed: ${error.message}`);
  }
}
```

### 2. Research Agent (Gemini)

**File:** `lib/agents/research-agent.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SearchResult } from './search-agent';

export interface ResearchOutput {
  insights: string[];
  keyPoints: string[];
  outline: {
    section: string;
    points: string[];
  }[];
  themes: string[];
}

/**
 * Research Agent - Analyzes search results using Gemini 2.0 Flash
 * 
 * @param topic - The blog topic
 * @param searchResults - Results from search agent
 * @returns Structured research output with insights and outline
 * @throws Error if Gemini API fails
 */
export async function researchAgent(
  topic: string,
  searchResults: SearchResult[]
): Promise<ResearchOutput> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = buildResearchPrompt(topic, searchResults);
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Gemini response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Research agent error:', error);
    throw new Error(`Research agent failed: ${error.message}`);
  }
}

function buildResearchPrompt(topic: string, results: SearchResult[]): string {
  return `Analyze the following search results about "${topic}" and provide structured research output.

SEARCH RESULTS:
${results.map((r, i) => `
Source ${i + 1}: ${r.title}
URL: ${r.url}
Relevance Score: ${r.score}
Content: ${r.content.substring(0, 1000)}...
---
`).join('\n')}

TASK:
Extract and synthesize information to create:
1. Key insights (3-5 unique angles or perspectives)
2. Important facts and statistics
3. Main themes across sources
4. Detailed content outline with sections and key points
5. OUTPUT FORMAT (JSON only, no other text):
{
  "insights": [
    "Unique insight or angle 1",
    "Unique insight or angle 2",
    "Unique insight or angle 3"
  ],
  "keyPoints": [
    "Important fact or statistic 1",
    "Important fact or statistic 2"
  ],
  "themes": [
    "Main theme 1",
    "Main theme 2"
  ],
  "outline": [
    {
      "section": "Introduction",
      "points": ["Hook point", "Context point"]
    },
    {
      "section": "Main Section 1 Title",
      "points": ["Key point 1", "Key point 2"]
    },
    {
      "section": "Conclusion",
      "points": ["Summary point", "Call to action"]
    }
  ]
}`;
}
```

### 3. Writer Agent (Claude)

**File:** `lib/agents/writer-agent.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { SearchResult } from './search-agent';
import { ResearchOutput } from './research-agent';

export interface WriterOutput {
  title: string;
  content: string;
  excerpt: string;
  citations: {
    title: string;
    url: string;
  }[];
}

/**
 * Writer Agent - Generates blog content using Claude Sonnet 4
 * 
 * @param topic - The blog topic
 * @param searchResults - Original search results for citations
 * @param research - Synthesized research from research agent
 * @returns Complete blog post with citations
 * @throws Error if Claude API fails
 */
export async function writerAgent(
  topic: string,
  searchResults: SearchResult[],
  research: ResearchOutput
): Promise<WriterOutput> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
  
  const prompt = buildWriterPrompt(topic, searchResults, research);
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }
    
    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Writer agent error:', error);
    throw new Error(`Writer agent failed: ${error.message}`);
  }
}

function buildWriterPrompt(
  topic: string,
  searchResults: SearchResult[],
  research: ResearchOutput
): string {
  return `Write a comprehensive, engaging blog post about "${topic}".

RESEARCH INSIGHTS:
${JSON.stringify(research, null, 2)}

AVAILABLE SOURCES FOR CITATIONS:
${searchResults.map((r, i) => `[${i + 1}] ${r.title} - ${r.url}`).join('\n')}

REQUIREMENTS:
1. Write in an engaging, conversational yet professional style
2. Follow the provided outline structure from research
3. Incorporate specific facts, statistics, and insights
4. Use natural inline citations in format: [Source Title](url)
5. Create an attention-grabbing introduction
6. Provide actionable takeaways in the conclusion
7. Target length: 1200-1500 words
8. Use Markdown formatting:
   - # for title (H1)
   - ## for section headers (H2)
   - ### for subsections (H3)
   - **bold** for emphasis
   - *italic* for subtle emphasis
   - > for blockquotes
   - - for bullet lists
   - 1. for numbered lists
9. Optimize for SEO with natural keyword usage
10. Ensure content is original synthesis, not just summarization

OUTPUT FORMAT (JSON only, no markdown code blocks or other text):
{
  "title": "Compelling, SEO-optimized blog title",
  "content": "Full markdown content with inline citations using [Source Title](url) format",
  "excerpt": "Engaging 2-3 sentence summary for preview and SEO meta description",
  "citations": [
    {"title": "Source 1 Title", "url": "https://..."},
    {"title": "Source 2 Title", "url": "https://..."}
  ]
}

CRITICAL: Return ONLY the JSON object. Do not include any text before or after the JSON.`;
}
```

---

## WORKFLOW ORCHESTRATION

**File:** `lib/workflows/blog-generation.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { searchAgent } from '@/lib/agents/search-agent';
import { researchAgent } from '@/lib/agents/research-agent';
import { writerAgent } from '@/lib/agents/writer-agent';

/**
 * Main blog generation workflow
 * Runs asynchronously in background, updates database at each step
 * 
 * @param blogId - The blog ID to generate content for
 * @param topic - The blog topic
 */
export async function runGenerationWorkflow(
  blogId: string,
  topic: string
): Promise<void> {
  try {
    // ===================================
    // STEP 1: SEARCH
    // ===================================
    await updateGenerationStatus(blogId, {
      status: 'SEARCHING',
      currentStep: 'Searching web sources...',
    });
    
    const searchResults = await searchAgent(topic);
    
    await prisma.blogGeneration.update({
      where: { blogId },
      data: {
        searchComplete: true,
        searchData: searchResults,
        updatedAt: new Date(),
      },
    });
    
    // ===================================
    // STEP 2: RESEARCH
    // ===================================
    await updateGenerationStatus(blogId, {
      status: 'RESEARCHING',
      currentStep: 'Analyzing sources and extracting insights...',
    });
    
    const research = await researchAgent(topic, searchResults);
    
    await prisma.blogGeneration.update({
      where: { blogId },
      data: {
        researchComplete: true,
        researchData: research,
        updatedAt: new Date(),
      },
    });
    
    // ===================================
    // STEP 3: WRITE
    // ===================================
    await updateGenerationStatus(blogId, {
      status: 'WRITING',
      currentStep: 'Generating blog content...',
    });
    
    const content = await writerAgent(topic, searchResults, research);
    
    await prisma.blogGeneration.update({
      where: { blogId },
      data: {
        writerComplete: true,
        updatedAt: new Date(),
      },
    });
    
    // ===================================
    // STEP 4: FINALIZE
    // ===================================
    
    // Update blog record with final content
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        title: content.title,
        slug: generateSlug(content.title, blogId),
        content: content.content,
        excerpt: content.excerpt,
        status: 'DRAFT',
        updatedAt: new Date(),
      },
    });
    
    // Create source records
    if (content.citations.length > 0) {
      await prisma.source.createMany({
        data: content.citations.map(citation => ({
          blogId,
          url: citation.url,
          title: citation.title,
        })),
      });
    }
    
    // Mark generation as completed
    await prisma.blogGeneration.update({
      where: { blogId },
      data: {
        status: 'COMPLETED',
        currentStep: 'Blog generation complete',
        updatedAt: new Date(),
      },
    });
    
  } catch (error) {
    console.error('Generation workflow failed:', error);
    
    // Log error to database
    await prisma.blogGeneration.update({
      where: { blogId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        currentStep: 'Generation failed',
        retryCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    
    throw error;
  }
}

/**
 * Helper to update generation status
 */
async function updateGenerationStatus(
  blogId: string,
  data: {
    status: 'PENDING' | 'SEARCHING' | 'RESEARCHING' | 'WRITING' | 'COMPLETED' | 'FAILED';
    currentStep: string;
  }
): Promise<void> {
  await prisma.blogGeneration.update({
    where: { blogId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string, blogId: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Add short ID suffix to ensure uniqueness
  const suffix = blogId.substring(0, 8);
  return `${baseSlug}-${suffix}`;
}
```

---

## API ROUTE IMPLEMENTATIONS

### Start Blog Generation

**File:** `app/api/blogs/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { runGenerationWorkflow } from '@/lib/workflows/blog-generation';
import { z } from 'zod';

const generateSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters').max(200),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validation = generateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { topic } = validation.data;
    
    // Create blog record
    const blog = await prisma.blog.create({
      data: {
        title: `Draft: ${topic}`,
        slug: '', // Will be set after generation
        content: '',
        status: 'GENERATING',
        userId: dbUser.id,
      },
    });
    
    // Create generation tracker
    await prisma.blogGeneration.create({
      data: {
        blogId: blog.id,
        status: 'PENDING',
        currentStep: 'Initializing...',
      },
    });
    
    // Start workflow asynchronously (don't await)
    runGenerationWorkflow(blog.id, topic).catch(error => {
      console.error('Workflow error:', error);
    });
    
    // Return immediately
    return NextResponse.json({
      blogId: blog.id,
      status: 'generating',
      message: 'Blog generation started',
    });
    
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Get Generation Status

**File:** `app/api/blogs/[id]/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
+) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get blog and generation status
    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: {
        generation: true,
      },
    });
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (blog.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Return status
    return NextResponse.json({
      blogId: blog.id,
      blogStatus: blog.status,
      generation: blog.generation ? {
        status: blog.generation.status,
        currentStep: blog.generation.currentStep,
        searchComplete: blog.generation.searchComplete,
        researchComplete: blog.generation.researchComplete,
        writerComplete: blog.generation.writerComplete,
        error: blog.generation.error,
        updatedAt: blog.generation.updatedAt,
      } : null,
    });
    
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### List Blogs

**File:** `app/api/blogs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build query
    const where: any = {
      userId: dbUser.id,
    };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get blogs
    const blogs = await prisma.blog.findMany({
      where,
      include: {
        generation: {
          select: {
            status: true,
            currentStep: true,
          },
        },
        _count: {
          select: {
            sources: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ blogs });
    
  } catch (error) {
    console.error('List blogs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Publish Blog

**File:** `app/api/blogs/[id]/publish/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
+) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get blog
    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
    });
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (blog.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Check if blog is in DRAFT status
    if (blog.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Blog must be in DRAFT status to publish' },
        { status: 400 }
      );
    }
    
    // Publish blog
    const updatedBlog = await prisma.blog.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      blog: updatedBlog,
      message: 'Blog published successfully',
    });
    
  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Get Public Blog by Slug

**File:** `app/api/public/blogs/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
+) {
  try {
    // Get published blog by slug
    const blog = await prisma.blog.findUnique({
      where: {
        slug: params.slug,
        status: 'PUBLISHED',
      },
      include: {
        sources: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ blog });
    
  } catch (error) {
    console.error('Public blog API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Retry Stuck Generations (Cron Job)

**File:** `app/api/cron/retry-stuck/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runGenerationWorkflow } from '@/lib/workflows/blog-generation';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this header)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find stuck generations (>10 minutes, <3 retries)
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);
    
    const stuck = await prisma.blogGeneration.findMany({
      where: {
        status: {
          in: ['SEARCHING', 'RESEARCHING', 'WRITING'],
        },
        updatedAt: {
          lt: cutoff,
        },
        retryCount: {
          lt: 3,
        },
      },
      include: {
        blog: true,
      },
    });
    
    console.log(`Found ${stuck.length} stuck generations`);
    
    // Retry each stuck generation
    const retried = [];
    for (const gen of stuck) {
      console.log(`Retrying generation ${gen.blogId}`);
      
      // Extract topic from blog title
      const topic = gen.blog.title.replace(/^Draft: /, '');
      
      // Start workflow (don't await)
      runGenerationWorkflow(gen.blogId, topic).catch(error => {
        console.error(`Retry failed for ${gen.blogId}:`, error);
      });
      
      retried.push(gen.blogId);
    }
    
    return NextResponse.json({
      message: 'Retry job completed',
      found: stuck.length,
      retried: retried.length,
      blogIds: retried,
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## FRONTEND COMPONENTS

### Generation Progress Component

**File:** `components/generation-progress.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

interface GenerationStatus {
  blogId: string;
  blogStatus: string;
  generation: {
    status: string;
    currentStep: string;
    searchComplete: boolean;
    researchComplete: boolean;
    writerComplete: boolean;
    error: string | null;
    updatedAt: string;
  } | null;
}

export function GenerationProgress({ blogId }: { blogId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Poll for status every 2 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/blogs/${blogId}/status`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch status');
        }
        
        const data: GenerationStatus = await res.json();
        setStatus(data);
        
        // Redirect when completed
        if (data.generation?.status === 'COMPLETED') {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/dashboard/blogs/${blogId}`);
          }, 1000);
        }
        
        // Show error if failed
        if (data.generation?.status === 'FAILED') {
          clearInterval(interval);
          setError(data.generation.error || 'Unknown error');
        }
        
      } catch (err) {
        console.error('Status polling error:', err);
        setError('Failed to fetch status');
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [blogId, router]);
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Generation Failed
            </h2>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!status) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading status...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Generating Your Blog</h1>
      <p className="text-gray-600 mb-8">
        {status.generation?.currentStep || 'Initializing...'}
      </p>
      
      <div className="space-y-6">
        {/* Step 1: Search */}
        <ProgressStep
          title="Searching Web Sources"
          description="Finding relevant and credible sources"
          status={getStepStatus(
            status.generation?.status,
            status.generation?.searchComplete
          )}
        />
        
        {/* Step 2: Research */}
        <ProgressStep
          title="Analyzing & Synthesizing"
          description="Extracting insights and building outline"
          status={getStepStatus(
            status.generation?.status,
            status.generation?.researchComplete,
            status.generation?.searchComplete
          )}
        />
        
        {/* Step 3: Write */}
        <ProgressStep
          title="Writing Content"
          description="Generating blog post with citations"
          status={getStepStatus(
            status.generation?.status,
            status.generation?.writerComplete,
            status.generation?.researchComplete
          )}
        />
      </div>
      
      {status.generation?.status === 'COMPLETED' && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">
                Blog Generated Successfully!
              </h3>
              <p className="text-sm text-green-700">
                Redirecting to review page...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressStep({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">
        {status === 'complete' && (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        )}
        {status === 'active' && (
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        )}
        {status === 'pending' && (
          <Circle className="w-6 h-6 text-gray-300" />
        )}
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold ${
          status === 'complete' ? 'text-green-900' :
          status === 'active' ? 'text-blue-900' :
          'text-gray-400'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          status === 'complete' ? 'text-green-700' :
          status === 'active' ? 'text-blue-700' :
          'text-gray-400'
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
}

function getStepStatus(
  generationStatus?: string,
  stepComplete?: boolean,
  previousStepComplete?: boolean
): 'pending' | 'active' | 'complete' {
  if (stepComplete) return 'complete';
  
  if (previousStepComplete === false) return 'pending';
  
  if (generationStatus === 'SEARCHING' && previousStepComplete !== false) {
    return 'active';
  }
  if (generationStatus === 'RESEARCHING' && previousStepComplete) {
    return 'active';
  }
  if (generationStatus === 'WRITING' && previousStepComplete) {
    return 'active';
  }
  
  return 'pending';
}
```

---

## CONFIGURATION FILES

### Vercel Configuration

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/retry-stuck",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

### Next.js Configuration

**File:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
```

### Tailwind Configuration

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Weeks 1-2)

**Week 1:**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Install dependencies: Tailwind, shadcn/ui, Prisma, Supabase client
- [ ] Configure Tailwind and create theme
- [ ] Set up Supabase project (create project, get credentials)
- [ ] Create Prisma schema
- [ ] Run initial Prisma migration
- [ ] Implement Supabase auth helpers
- [ ] Create auth pages: login, signup, password reset
- [ ] Build auth middleware for protected routes
- [ ] Create base layout components

**Week 2:**
- [ ] Build admin dashboard layout
- [ ] Create blog list page with table
- [ ] Implement blog card component
- [ ] Build markdown editor component with preview
- [ ] Create public homepage layout
- [ ] Build individual blog page template
- [ ] Set up all environment variables
- [ ] Test authentication flow end-to-end

### Phase 2: Agent Development (Weeks 3-4)

**Week 3:**
- [ ] Install Tavily SDK
- [ ] Implement search agent function
- [ ] Test search agent with various topics
- [ ] Install Google Generative AI SDK
- [ ] Implement research agent function
- [ ] Create research prompt template
- [ ] Test research agent output parsing
- [ ] Add error handling to both agents

**Week 4:**
- [ ] Install Anthropic SDK
- [ ] Implement writer agent function
- [ ] Create writer prompt template
- [ ] Test writer agent output
- [ ] Build workflow orchestration function
- [ ] Add BlogGeneration database updates
- [ ] Implement retry logic for failed steps
- [ ] Test complete workflow end-to-end

### Phase 3: Integration (Weeks 5-6)

**Week 5:**
- [ ] Create blog generation form
- [ ] Build generation progress page with polling
- [ ] Implement status API endpoint
- [ ] Connect generation form to workflow
- [ ] Build draft editing interface
- [ ] Add publish/unpublish buttons
- [ ] Implement blog search and filter
- [ ] Create source citation display

**Week 6:**
- [ ] Build public blog listing page
- [ ] Implement blog search on public site
- [ ] Create blog reading page with markdown rendering
- [ ] Add SEO meta tags (title, description, OG tags)
- [ ] Implement responsive design throughout
- [ ] Add loading states to all async operations
- [ ] Build error pages (404, 500)
- [ ] Add syntax highlighting for code blocks

### Phase 4: Testing & Polish (Week 7)

- [ ] Test all authentication flows
- [ ] Test blog generation with multiple topics
- [ ] Test error scenarios (API failures, timeouts)
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Performance optimization (bundle size, load times)
- [ ] Security audit (XSS, CSRF, SQL injection)
- [ ] Set up Sentry for error tracking
- [ ] Configure Vercel Analytics
- [ ] Write user documentation

### Phase 5: Launch (Week 8)

- [ ] Deploy to Vercel production
- [ ] Set up custom domain
- [ ] Configure production environment variables
- [ ] Test production deployment
- [ ] Monitor first 24 hours
- [ ] Gather user feedback
- [ ] Plan iteration roadmap

---

## CRITICAL IMPLEMENTATION NOTES

### 1. Error Handling
- Every agent function must have try-catch
- Always update BlogGeneration.error on failure
- Implement retry logic with max 3 attempts
- Log all errors to console for debugging

### 2. Database Updates
- Use Prisma transactions for multi-step updates
- Always update `updatedAt` field when changing status
- Include proper indexes for query performance
- Use cascade deletes for related records

### 3. Authentication
- Always verify user ownership before mutations
- Use Supabase Row Level Security where possible
- Validate all inputs with Zod schemas
- Rate limit generation endpoint (5/hour per user)

### 4. Performance
- Use Edge Functions for API routes where possible
- Implement proper loading states
- Cache search results for common topics (future optimization)
- Use Prisma select to only fetch needed fields

### 5. Cost Management
- Monitor AI API usage daily
- Implement user quotas (5-10 blogs/month free tier)
- Add cost alerts for API spending
- Use cheapest models where quality permits

### 6. Security
- Never expose API keys in client code
- Sanitize all user inputs
- Use environment variables for secrets
- Implement CORS properly for public APIs

---

## TESTING STRATEGY

### Unit Tests
- Test each agent function independently
- Mock API responses for consistent testing
- Test slug generation edge cases
- Test markdown rendering

### Integration Tests
- Test complete workflow end-to-end
- Test authentication flows
- Test blog CRUD operations
- Test error recovery

### Manual Testing
- Generate blogs on 10+ different topics
- Test on mobile devices
- Test slow network conditions
- Test with API failures

---

## DEPLOYMENT CHECKLIST

### Pre-Deploy
- [ ] All environment variables set in Vercel
- [ ] Supabase production project created
- [ ] Database migrated to production
- [ ] AI API keys valid and funded
- [ ] Custom domain configured
- [ ] SSL certificate active

### Post-Deploy
- [ ] Test signup/login flow
- [ ] Generate test blog
- [ ] Verify public blog accessible
- [ ] Check cron job execution
- [ ] Monitor error rates
- [ ] Verify analytics tracking

---

## MAINTENANCE TASKS

### Daily
- Monitor error rates in Sentry
- Check AI API costs
- Review failed generations

### Weekly
- Analyze generation success rates
- Review user feedback
- Check database performance
- Update dependencies

### Monthly
- Security audit
- Performance review
- Cost optimization review
- Feature roadmap planning

---

## SUCCESS CRITERIA

### Technical
- ✅ 90%+ generation success rate
- ✅ <3 minute average generation time
- ✅ <2 second page load times
- ✅ 99.5%+ uptime

### User Experience
- ✅ Intuitive admin interface
- ✅ Clear progress feedback
- ✅ Fast, responsive UI
- ✅ Clean blog reading experience

### Business
- ✅ <$0.15 per blog generation cost
- ✅ 10+ active users in first month
- ✅ 70%+ publish rate for generated drafts
- ✅ Positive user feedback
