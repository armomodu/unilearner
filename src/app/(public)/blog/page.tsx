import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { PublicBlogSearch } from '@/components/public-blog-search';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | UniLearner - AI-Powered Content Creation',
    description: 'Discover insights, tutorials, and stories powered by AI-driven research and expert writing. Explore our latest blog posts.',
    keywords: ['AI blog', 'content creation', 'tutorials', 'insights', 'machine learning', 'artificial intelligence'],
    openGraph: {
        title: 'Blog | UniLearner',
        description: 'Discover AI-powered content and insights',
        type: 'website',
    },
};

interface BlogWithStats {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    publishedAt: Date | null;
    createdAt: Date;
    user: {
        name: string | null;
    };
    _count: {
        sources: number;
    };
}

async function getPublishedBlogs(search?: string, sort: string = 'newest'): Promise<BlogWithStats[]> {
    // Build where clause for search
    const whereClause: Prisma.BlogWhereInput = {
        status: 'PUBLISHED',
    };

    if (search && search.trim()) {
        whereClause.OR = [
            {
                title: {
                    contains: search.trim(),
                    mode: 'insensitive'
                }
            },
            {
                content: {
                    contains: search.trim(),
                    mode: 'insensitive'
                }
            },
            {
                excerpt: {
                    contains: search.trim(),
                    mode: 'insensitive'
                }
            }
        ];
    }

    // Build order clause
    let orderBy: Prisma.BlogOrderByWithRelationInput = { publishedAt: 'desc' }; // default newest
    switch (sort) {
        case 'oldest':
            orderBy = { publishedAt: 'asc' };
            break;
        case 'title-asc':
            orderBy = { title: 'asc' };
            break;
        case 'title-desc':
            orderBy = { title: 'desc' };
            break;
        case 'newest':
        default:
            orderBy = { publishedAt: 'desc' };
            break;
    }

    const blogs = await prisma.blog.findMany({
        where: whereClause,
        include: {
            user: {
                select: { name: true },
            },
            _count: {
                select: { sources: true },
            },
        },
        orderBy,
    });

    return blogs;
}

function generateExcerpt(content: string, maxLength: number = 200): string {
    // Remove markdown formatting for excerpt
    const plainText = content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*{1,2}(.+?)\*{1,2}/g, '$1') // Remove bold/italic
        .replace(/`(.+?)`/g, '$1') // Remove code
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function calculateReadTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
}

export default async function PublicBlogsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; sort?: string }>;
}) {
    const { search, sort } = await searchParams;
    const blogs = await getPublishedBlogs(search, sort || 'newest');
    
    // Filter by search on the server side is already done, but we need to handle the count
    const filteredBlogs = blogs;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Latest Blog Posts
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover insights, tutorials, and stories powered by AI-driven research and expert writing.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-12">
                    <PublicBlogSearch 
                        initialQuery={search || ''}
                        initialSort={sort || 'newest'}
                        totalBlogs={filteredBlogs.length}
                    />
                </div>

                {/* Blog Grid */}
                {filteredBlogs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-semibold mb-2">No blogs published yet</h2>
                        <p className="text-muted-foreground">
                            Check back soon for the latest content!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                        {filteredBlogs.map((blog) => (
                            <Card key={blog.id} className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border-0 shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {blog._count.sources} sources
                                        </Badge>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {calculateReadTime(blog.content)} min
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                        {blog.title}
                                    </h2>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                        {blog.excerpt || generateExcerpt(blog.content)}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        
                                        <Link
                                            href={`/blog/${blog.slug}`}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Read more
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* CTA Section */}
                <div className="mt-20 text-center">
                    <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                        <h3 className="text-2xl font-semibold mb-4">Want AI-powered content?</h3>
                        <p className="text-muted-foreground mb-6">
                            Our three-agent system researches topics deeply and creates comprehensive, 
                            well-sourced articles in minutes.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            Start Creating
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
