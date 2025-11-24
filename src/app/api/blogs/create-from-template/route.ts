import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/db-user';

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const supabase = await createServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await getOrCreateUser(session);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { title, content, templateId } = body;

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Generate a unique slug for the blog
        const timestamp = Date.now();
        const slug = `${title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50)}-${timestamp}`;

        // Create blog from template
        const blog = await prisma.blog.create({
            data: {
                title: title.trim(),
                slug,
                content: content.trim(),
                excerpt: generateExcerpt(content),
                status: 'DRAFT',
                userId: user.id,
            },
            include: {
                generation: true,
                sources: true,
            },
        });

        return NextResponse.json({
            blogId: blog.id,
            blog,
            message: 'Blog created from template successfully',
        });

    } catch (error) {
        console.error('Create from template API error:', error);
        return NextResponse.json(
            { error: 'Failed to create blog from template' },
            { status: 500 }
        );
    }
}

function generateExcerpt(content: string): string {
    // Remove markdown formatting and extract first paragraph
    const plainText = content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold/italic
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
        .replace(/>\s+/g, '') // Remove quotes
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    // Get first meaningful paragraph (skip very short lines)
    const paragraphs = plainText.split('. ');
    const meaningfulParagraphs = paragraphs.filter(p => p.length > 50);
    
    if (meaningfulParagraphs.length > 0) {
        return meaningfulParagraphs[0].substring(0, 200) + (meaningfulParagraphs[0].length > 200 ? '...' : '');
    }

    // Fallback to first 200 characters
    return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
}