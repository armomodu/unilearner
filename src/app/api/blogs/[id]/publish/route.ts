import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
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

        // Get blog
        const blog = await prisma.blog.findUnique({
            where: { id },
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
            where: { id },
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
