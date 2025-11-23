import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { GenerationProgress } from '@/components/generation-progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Save, Globe } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getOrCreateUser } from '@/lib/db-user';

export const dynamic = 'force-dynamic';

export default async function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) redirect('/login');

    const user = await getOrCreateUser(session);
    if (!user) return <div>User not found</div>;

    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            generation: true,
            sources: true,
        },
    });

    if (!blog) notFound();

    if (blog.userId !== user.id) {
        return <div>Access Denied</div>;
    }

    const isGenerating = blog.status === 'GENERATING' || (blog.generation && blog.generation.status !== 'COMPLETED' && blog.generation.status !== 'FAILED');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/blogs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight truncate max-w-md">
                            {blog.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                {blog.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Last updated: {new Date(blog.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {blog.status === 'PUBLISHED' && (
                        <Link href={`/blog/${blog.slug}`} target="_blank">
                            <Button variant="outline" className="gap-2">
                                <ExternalLink className="w-4 h-4" />
                                View Live
                            </Button>
                        </Link>
                    )}
                    {/* Note: Save/Publish actions would be client components or server actions. 
              For simplicity in this MVP, we'll just show the UI structure. 
              Real implementation would need a client component wrapper for the form. */}
                    <Button className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            {isGenerating ? (
                <GenerationProgress blogId={blog.id} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="edit" className="w-full">
                            <TabsList>
                                <TabsTrigger value="edit">Editor</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>
                            <TabsContent value="edit" className="mt-4">
                                <Card>
                                    <CardContent className="p-0">
                                        <Textarea
                                            defaultValue={blog.content}
                                            className="min-h-[600px] border-0 focus-visible:ring-0 resize-y p-6 font-mono text-sm"
                                            placeholder="Write your blog post here..."
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="preview" className="mt-4">
                                <Card>
                                    <CardContent className="p-8 prose prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {blog.content}
                                        </ReactMarkdown>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Sources</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {blog.sources.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No sources cited.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {blog.sources.map((source: { id: string; url: string; title: string }) => (
                                            <li key={source.id} className="text-sm">
                                                <a
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium hover:underline flex items-start gap-2"
                                                >
                                                    <Globe className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                                                    <span className="line-clamp-2">{source.title}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Publishing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slug</label>
                                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded border border-border truncate">
                                        {blog.slug || 'Not generated yet'}
                                    </div>
                                </div>
                                <Button
                                    variant={blog.status === 'PUBLISHED' ? 'destructive' : 'default'}
                                    className="w-full"
                                >
                                    {blog.status === 'PUBLISHED' ? 'Unpublish' : 'Publish Now'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
