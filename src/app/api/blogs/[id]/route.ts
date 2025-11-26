import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateRichHtml } from '@/lib/tiptap/html';
import type { JSONContent } from '@tiptap/core';

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

        // Get blog
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: {
                generation: true,
                sources: true,
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

        return NextResponse.json({ blog });

    } catch (error) {
        console.error('Get blog API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
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

        // Get blog to check ownership
        const blog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        if (blog.userId !== dbUser.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const {
            title,
            content,
            richContent,
            contentType = 'markdown',
        }: {
            title?: string;
            content?: string;
            richContent?: JSONContent;
            contentType?: 'markdown' | 'rich' | string;
        } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        const normalizedContentType =
            contentType === 'rich' ? 'rich' : 'markdown';

        if (normalizedContentType === 'markdown' && (!content || !content.trim())) {
            return NextResponse.json(
                { error: 'Content is required for Markdown blogs' },
                { status: 400 }
            );
        }

        if (normalizedContentType === 'rich' && !richContent) {
            return NextResponse.json(
                { error: 'Rich content payload is required' },
                { status: 400 }
            );
        }

        const trimmedContent = content?.trim() ?? '';
        const htmlCache =
            normalizedContentType === 'rich' && richContent
                ? generateRichHtml(richContent)
                : null;

        // Update blog
        const updateData: any = {
            title: title.trim(),
            content:
                normalizedContentType === 'markdown'
                    ? trimmedContent
                    : trimmedContent || blog.content || '',
            contentType: normalizedContentType,
            richContent:
                normalizedContentType === 'rich' ? richContent : null,
            htmlCache,
            updatedAt: new Date(),
        };

        const updatedBlog = await prisma.blog.update({
            where: { id },
            data: updateData,
            include: {
                generation: true,
                sources: true,
            },
        });

        return NextResponse.json({ 
            blog: updatedBlog,
            message: 'Blog saved successfully' 
        });

    } catch (error) {
        console.error('Update blog API error:', error);
        return NextResponse.json(
            { error: 'Failed to save blog' },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Get blog to check ownership
        const blog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        if (blog.userId !== dbUser.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Delete blog
        await prisma.blog.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Blog deleted successfully' });

    } catch (error) {
        console.error('Delete blog API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
