import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getOrCreateUser } from '@/lib/db-user';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;

    const user = await getOrCreateUser(session);

    if (!user) return <div>User not found. Please try logging out and back in.</div>;

    // Fetch stats
    const totalBlogs = await prisma.blog.count({
        where: { userId: user.id },
    });

    const publishedBlogs = await prisma.blog.count({
        where: { userId: user.id, status: 'PUBLISHED' },
    });

    const draftBlogs = await prisma.blog.count({
        where: { userId: user.id, status: 'DRAFT' },
    });

    // Fetch recent blogs
    const recentBlogs = await prisma.blog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBlogs}</div>
                        <p className="text-xs text-muted-foreground">
                            All time generated content
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedBlogs}</div>
                        <p className="text-xs text-muted-foreground">
                            Live on your public page
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{draftBlogs}</div>
                        <p className="text-xs text-muted-foreground">
                            Work in progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold tracking-tight">Recent Activity</h3>
                    <Link href="/dashboard/blogs/new">
                        <Button size="sm" className="gap-1">
                            <Plus className="w-4 h-4" /> New Blog
                        </Button>
                    </Link>
                </div>

                {recentBlogs.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <h3 className="mt-2 text-lg font-semibold">No blogs created yet</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Start by creating your first AI-generated blog post.
                        </p>
                        <Link href="/dashboard/blogs/new">
                            <Button>Create Blog</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {recentBlogs.map((blog) => (
                            <Link key={blog.id} href={`/dashboard/blogs/${blog.id}`}>
                                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold">{blog.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                                            blog.status === 'GENERATING' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {blog.status}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
