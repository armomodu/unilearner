import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const blog = await prisma.blog.findUnique({
        where: { slug },
        select: {
            title: true,
            excerpt: true,
            content: true,
        },
    });

    if (!blog) {
        return {
            title: 'Blog Not Found',
        };
    }

    const description = blog.excerpt || blog.content.substring(0, 160) + '...';

    return {
        title: `${blog.title} | UniLearner Blog`,
        description,
        openGraph: {
            title: blog.title,
            description,
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: blog.title,
            description,
        },
    };
}

export default async function PublicBlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = await prisma.blog.findUnique({
        where: { slug },
        include: {
            user: {
                select: { name: true },
            },
        },
    });

    if (!blog || blog.status !== 'PUBLISHED') {
        notFound();
    }

    // Calculate read time (rough estimate)
    const wordCount = blog.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    return (
        <article className="container mx-auto px-4 py-12 max-w-3xl">
            <header className="mb-12 text-center space-y-4">
                <Badge variant="secondary" className="mb-4">
                    Blog Post
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    {blog.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {readTime} min read
                    </div>
                </div>
            </header>

            <div className="prose prose-lg prose-invert mx-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {blog.content}
                </ReactMarkdown>
            </div>
        </article>
    );
}
