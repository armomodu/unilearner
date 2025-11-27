import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/db-user';
import { ensureDefaultWritingStyle } from '@/lib/agents/writer-styles';
import { WritingStylesManager } from '@/components/writing-styles-manager';
import type { WritingStyleDTO } from '@/types/writing-style';

export const dynamic = 'force-dynamic';

export default async function WritingStylesPage() {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    const user = await getOrCreateUser(session);
    if (!user) {
        return <div>User not found. Please try signing out and back in.</div>;
    }

    await ensureDefaultWritingStyle();

    const styles = await prisma.writingStyle.findMany({
        where: {
            OR: [{ userId: null }, { userId: user.id }],
        },
        orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
        ],
    });

    const serialized: WritingStyleDTO[] = styles.map(style => ({
        id: style.id,
        slug: style.slug,
        name: style.name,
        description: style.description,
        styleType: style.styleType,
        systemPrompt: style.systemPrompt,
        microPrompt: style.microPrompt,
        graphicsConfig: style.graphicsConfig as Record<string, unknown> | null,
        isDefault: style.isDefault,
        userId: style.userId,
        createdAt: style.createdAt.toISOString(),
        updatedAt: style.updatedAt.toISOString(),
    }));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Writing Styles</h2>
                <p className="text-muted-foreground">
                    Create reusable style prompts, manage custom tones, and choose which templates appear when generating new blogs.
                </p>
            </div>

            <WritingStylesManager initialStyles={serialized} />
        </div>
    );
}

