import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { runGenerationWorkflow } from '@/lib/workflows/blog-generation';
import { resolveWritingStyle } from '@/lib/agents/writer-styles';
import { resolveGraphicsStyle } from '@/lib/agents/graphics-styles';
import { z } from 'zod';

const generateSchema = z.object({
    topic: z.string().min(5, 'Topic must be at least 5 characters').max(200),
    styleId: z.string().optional(),
    graphicsStyleId: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const supabase = await createServerClient();
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

        const { topic, styleId, graphicsStyleId } = validation.data;
        const writingStyle = await resolveWritingStyle(styleId);

        // Resolve graphics style if provided
        const graphicsStyle = graphicsStyleId ? await resolveGraphicsStyle(graphicsStyleId) : null;

        // Generate a unique slug for the draft
        const timestamp = Date.now();
        const slugBase = topic.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        const draftSlug = `draft-${slugBase}-${timestamp}`;

        // Create blog record
        const blog = await prisma.blog.create({
            data: {
                title: `Draft: ${topic}`,
                slug: draftSlug,
                content: '',
                status: 'GENERATING',
                userId: dbUser.id,
                writingStyleId: writingStyle.id,
                graphicsStyleId: graphicsStyle?.id,
            },
        });

        // Create generation tracker
        await prisma.blogGeneration.create({
            data: {
                blogId: blog.id,
                status: 'PENDING',
                currentStep: 'Initializing...',
                writingStyleId: writingStyle.id,
            },
        });

        // Start workflow asynchronously (don't await)
        runGenerationWorkflow(blog.id, topic, writingStyle.id, graphicsStyle?.id).catch(error => {
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
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
