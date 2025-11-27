import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { GenerationProgress } from '@/components/generation-progress';
import { BlogEditor } from '@/components/blog-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';
import { getOrCreateUser } from '@/lib/db-user';
import { PublishBlogButton } from '@/components/publish-blog-button';
import { PerformanceMetricsCard } from '@/components/performance-metrics';
import type { JSONContent } from '@tiptap/core';

export const dynamic = 'force-dynamic';

export default async function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) redirect('/login');

    const user = await getOrCreateUser(session);
    if (!user) return <div>User not found</div>;

    const rawBlog = await prisma.blog.findUnique({
        where: { id },
        include: {
            generation: true,
            sources: true,
        },
    });

    const blog = rawBlog as (typeof rawBlog & {
        contentType: string;
        richContent: unknown | null;
        htmlCache: string | null;
    }) | null;

    if (!blog) notFound();

    if (blog.userId !== user.id) {
        return <div>Access Denied</div>;
    }

    const isGenerating = blog.status === 'GENERATING' || (blog.generation && blog.generation.status !== 'COMPLETED' && blog.generation.status !== 'FAILED');

    const graphicsData = blog.graphics as {
        assets?: Array<{ id: string; url: string; alt?: string | null; caption?: string | null }>;
        metadata?: { styleUsed?: string | null } | null;
    } | null;
    const primaryGraphic = Array.isArray(graphicsData?.assets) ? graphicsData?.assets[0] : null;

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
                </div>
            </div>

            {isGenerating ? (
                <GenerationProgress blogId={blog.id} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {primaryGraphic?.url && (
                            <Card className="overflow-hidden">
                                <div className="bg-muted border-b">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={primaryGraphic.url}
                                        alt={primaryGraphic.alt || 'Generated infographic'}
                                        className="w-full object-cover max-h-[420px]"
                                        loading="lazy"
                                    />
                                </div>
                                {(primaryGraphic.caption || graphicsData?.metadata?.styleUsed) && (
                                    <CardContent className="py-4 space-y-1">
                                        {primaryGraphic.caption && (
                                            <p className="text-sm text-foreground">{primaryGraphic.caption}</p>
                                        )}
                                        {graphicsData?.metadata?.styleUsed && (
                                            <p className="text-xs text-muted-foreground">
                                                Generated via {graphicsData.metadata.styleUsed}
                                            </p>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        )}
                        <BlogEditor 
                            blogId={blog.id}
                            initialTitle={blog.title}
                            initialContent={blog.content}
                            initialContentType={blog.contentType as 'markdown' | 'rich'}
                            initialRichContent={blog.richContent as JSONContent | null}
                        />
                    </div>

                    <div className="space-y-6">
                        {/* Temporarily disabled until database schema is updated */}
                        {/* <HeaderImageUpload 
                            blogId={blog.id}
                            currentImageUrl={blog.headerImageUrl}
                        /> */}

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

                        {/* Performance Metrics */}
                        {blog.generation && blog.generation.totalDurationMs && (
                            <PerformanceMetricsCard
                                metrics={{
                                    totalDurationMs: blog.generation.totalDurationMs,
                                    searchDurationMs: blog.generation.searchDurationMs,
                                    researchDurationMs: blog.generation.researchDurationMs,
                                    writerDurationMs: blog.generation.writerDurationMs,
                                    searchStartedAt: blog.generation.searchStartedAt,
                                    searchCompletedAt: blog.generation.searchCompletedAt,
                                    researchStartedAt: blog.generation.researchStartedAt,
                                    researchCompletedAt: blog.generation.researchCompletedAt,
                                    writerStartedAt: blog.generation.writerStartedAt,
                                    writerCompletedAt: blog.generation.writerCompletedAt,
                                    completedAt: blog.generation.completedAt,
                                    createdAt: blog.createdAt,
                                }}
                                contentWordCount={blog.content.split(/\s+/).length}
                            />
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Publishing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
                                        {blog.status}
                                        {blog.status === 'PUBLISHED' && blog.publishedAt && (
                                            <span className="ml-2">
                                                • {new Date(blog.publishedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">URL Slug</label>
                                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded border border-border">
                                        {blog.slug ? (
                                            <div className="break-all">
                                                {process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/blog/{blog.slug}
                                            </div>
                                        ) : (
                                            'Will be generated when published'
                                        )}
                                    </div>
                                </div>

                                <PublishBlogButton
                                    blogId={blog.id}
                                    blogTitle={blog.title}
                                    isPublished={blog.status === 'PUBLISHED'}
                                    slug={blog.slug}
                                />

                                {blog.status === 'PUBLISHED' && blog.slug && (
                                    <Link href={`/blog/${blog.slug}`} target="_blank" className="block">
                                        <Button variant="outline" className="w-full gap-2">
                                            <ExternalLink className="w-4 h-4" />
                                            View Live Post
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
