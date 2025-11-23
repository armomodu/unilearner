import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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

        const { topic } = validation.data;

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
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
