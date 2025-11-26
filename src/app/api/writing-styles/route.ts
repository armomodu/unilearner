import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/db-user';
import { ensureDefaultWritingStyle, generateStyleSlug, getWritingStylesForUser } from '@/lib/agents/writer-styles';
import { WritingStyle } from '@prisma/client';
import { z } from 'zod';

const createStyleSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(120, 'Name cannot exceed 120 characters'),
    description: z.string().max(240, 'Description cannot exceed 240 characters').optional(),
    systemPrompt: z.string().min(80, 'System prompt must provide detailed guidance').max(20000, 'System prompt is too long'),
    microPrompt: z.string().min(40, 'Micro prompt should summarize the style').max(1000, 'Micro prompt is too long').optional(),
});

function serializeStyle(style: WritingStyle) {
    return {
        ...style,
        createdAt: style.createdAt.toISOString(),
        updatedAt: style.updatedAt.toISOString(),
    };
}

async function authenticate() {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return { user: null };
    }

    const user = await getOrCreateUser(session);
    return { user };
}

export async function GET() {
    const { user } = await authenticate();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDefaultWritingStyle();
    const styles = await getWritingStylesForUser(user.id);

    return NextResponse.json({
        styles: styles.map(serializeStyle),
    });
}

export async function POST(request: NextRequest) {
    const { user } = await authenticate();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = createStyleSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
                { status: 400 }
            );
        }

        const { name, description, systemPrompt, microPrompt } = parsed.data;
        await ensureDefaultWritingStyle();

        const style = await prisma.writingStyle.create({
            data: {
                slug: generateStyleSlug(name),
                name,
                description,
                systemPrompt,
                microPrompt,
                isDefault: false,
                userId: user.id,
            },
        });

        return NextResponse.json({ style: serializeStyle(style) }, { status: 201 });
    } catch (error) {
        console.error('Create writing style error:', error);
        return NextResponse.json({ error: 'Failed to create writing style' }, { status: 500 });
    }
}

