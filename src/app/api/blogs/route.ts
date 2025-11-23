import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build query
        const where: Prisma.BlogWhereInput = {
            userId: dbUser.id,
        };

        if (status) {
            where.status = status as 'DRAFT' | 'GENERATING' | 'PUBLISHED';
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
