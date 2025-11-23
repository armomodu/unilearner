import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { PlusCircle, Edit, ExternalLink } from 'lucide-react';
import { getOrCreateUser } from '@/lib/db-user';

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

            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sources</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {blogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No blogs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            blogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">{blog.title}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                                            blog.status === 'GENERATING' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {blog.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{blog._count.sources}</TableCell>
                                    <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/blogs/${blog.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            {blog.status === 'PUBLISHED' && (
                                                <Link href={`/blog/${blog.slug}`} target="_blank">
                                                    <Button variant="ghost" size="icon">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
