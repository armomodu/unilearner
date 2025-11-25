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
            generation: {
                select: {
                    id: true,
                    status: true,
                    currentStep: true,
                    searchComplete: true,
                    researchComplete: true,
                    writerComplete: true,
                    error: true,
                    createdAt: true,
                    updatedAt: true,
                    retryCount: true,
                    // Performance metrics
                    totalDurationMs: true,
                    searchDurationMs: true,
                    researchDurationMs: true,
                    writerDurationMs: true,
                    searchStartedAt: true,
                    searchCompletedAt: true,
                    researchStartedAt: true,
                    researchCompletedAt: true,
                    writerStartedAt: true,
                    writerCompletedAt: true,
                    completedAt: true,
                },
            },
        },
    });

    // Convert dates to strings for client component
    const blogsForClient = blogs.map(blog => ({
        ...blog,
        createdAt: blog.createdAt.toISOString(),
        generation: blog.generation ? {
            ...blog.generation,
            updatedAt: blog.generation.updatedAt.toISOString(),
            createdAt: blog.generation.createdAt.toISOString(),
            searchStartedAt: blog.generation.searchStartedAt?.toISOString() || null,
            searchCompletedAt: blog.generation.searchCompletedAt?.toISOString() || null,
            researchStartedAt: blog.generation.researchStartedAt?.toISOString() || null,
            researchCompletedAt: blog.generation.researchCompletedAt?.toISOString() || null,
            writerStartedAt: blog.generation.writerStartedAt?.toISOString() || null,
            writerCompletedAt: blog.generation.writerCompletedAt?.toISOString() || null,
            completedAt: blog.generation.completedAt?.toISOString() || null,
        } : null,
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
