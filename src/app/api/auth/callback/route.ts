import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createServerClient();

        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && session?.user) {
            // Sync user to Prisma
            const { user } = session;

            try {
                await prisma.user.upsert({
                    where: { supabaseId: user.id },
                    update: {
                        email: user.email!,
                        // Update other fields if needed
                    },
                    create: {
                        supabaseId: user.id,
                        email: user.email!,
                        name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
                    },
                });
            } catch (dbError) {
                console.error('Error syncing user to database:', dbError);
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
