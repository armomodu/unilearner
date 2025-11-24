import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'newest';
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause for search
        const whereClause: any = {
            status: 'PUBLISHED',
        };

        if (search && search.trim()) {
            whereClause.OR = [
                {
                    title: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                },
                {
                    content: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                },
                {
                    excerpt: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Build order clause
        let orderBy: any = { publishedAt: 'desc' }; // default newest
        switch (sort) {
            case 'oldest':
                orderBy = { publishedAt: 'asc' };
                break;
            case 'title-asc':
                orderBy = { title: 'asc' };
                break;
            case 'title-desc':
                orderBy = { title: 'desc' };
                break;
            case 'newest':
            default:
                orderBy = { publishedAt: 'desc' };
                break;
        }

        // Get blogs with pagination
        const [blogs, totalCount] = await Promise.all([
            prisma.blog.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: { name: true },
                    },
                    _count: {
                        select: { sources: true },
                    },
                },
                orderBy,
                take: limit,
                skip: offset,
            }),
            prisma.blog.count({
                where: whereClause,
            })
        ]);

        // Generate excerpt for blogs that don't have one
        const blogsWithExcerpts = blogs.map(blog => ({
            ...blog,
            excerpt: blog.excerpt || generateExcerpt(blog.content),
            readTime: calculateReadTime(blog.content),
        }));

        return NextResponse.json({
            success: true,
            data: {
                blogs: blogsWithExcerpts,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasMore: offset + limit < totalCount,
                }
            }
        });

    } catch (error) {
        console.error('Public blogs API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}

function generateExcerpt(content: string, maxLength: number = 200): string {
    // Remove markdown formatting for excerpt
    const plainText = content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*{1,2}(.+?)\*{1,2}/g, '$1') // Remove bold/italic
        .replace(/`(.+?)`/g, '$1') // Remove code
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function calculateReadTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
}