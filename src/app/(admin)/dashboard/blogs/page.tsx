import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getOrCreateUser } from '@/lib/db-user';
import { BlogsTable } from '@/components/blogs-table';

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;

    const user = await getOrCreateUser(session);

    if (!user) return <div>User not found</div>;

    const blogs = await prisma.blog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { sources: true } },
        },
    });

    // Convert dates to strings for client component
    const blogsForClient = blogs.map(blog => ({
        ...blog,
        createdAt: blog.createdAt.toISOString(),
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">All Blogs</h2>
                <Link href="/dashboard/blogs/new">
                    <Button className="gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Create New Blog
                    </Button>
                </Link>
            </div>

            <BlogsTable blogs={blogsForClient} />
        </div>
    );
}
