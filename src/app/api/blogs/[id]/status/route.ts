import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Get blog and generation status
        const blog = await prisma.blog.findUnique({
            where: { id },
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
