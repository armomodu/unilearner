import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/db-user';
import { ensureDefaultWritingStyle } from '@/lib/agents/writer-styles';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(session);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    try {
        const style = await prisma.writingStyle.findUnique({ where: { id } });

        if (!style) {
            return NextResponse.json({ error: 'Style not found' }, { status: 404 });
        }

        if (!style.userId || style.isDefault) {
            return NextResponse.json(
                { error: 'Default or global styles cannot be deleted' },
                { status: 400 }
            );
        }

        if (style.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.writingStyle.delete({ where: { id } });
        await ensureDefaultWritingStyle();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete writing style error:', error);
        return NextResponse.json({ error: 'Failed to delete style' }, { status: 500 });
    }
}

