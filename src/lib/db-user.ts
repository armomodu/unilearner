import { prisma } from '@/lib/prisma';
import { Session } from '@supabase/supabase-js';

export async function getOrCreateUser(session: Session) {
    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
        where: { supabaseId: session.user.id },
    });

    if (user) return user;

    // JIT Create
    try {
        const newUser = await prisma.user.create({
            data: {
                supabaseId: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            },
        });
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        // Concurrency fallback: try fetching again
        return await prisma.user.findUnique({
            where: { supabaseId: session.user.id },
        });
    }
}
