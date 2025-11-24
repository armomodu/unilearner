'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, ArrowLeft, FileText, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { BlogTemplates, BlogTemplate } from '@/components/blog-templates';

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [templateLoading, setTemplateLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const topic = formData.get('topic') as string;

        try {
            const res = await fetch('/api/blogs/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to start generation');
            }

            toast.success('Generation started', {
                description: 'Redirecting to progress view...',
            });

            router.push(`/dashboard/blogs/${data.blogId}`);
        } catch (error) {
            toast.error('Error', {
                description: error instanceof Error ? error.message : 'Something went wrong',
            });
            setLoading(false);
        }
    }

    async function handleTemplateSelect(template: BlogTemplate) {
        setTemplateLoading(true);

        try {
            const response = await fetch('/api/blogs/create-from-template', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: template.title,
                    content: template.content,
                    templateId: template.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create blog from template');
            }

            toast.success('Blog created from template', {
                description: 'Redirecting to editor...',
            });

            router.push(`/dashboard/blogs/${data.blogId}`);
        } catch (error) {
            toast.error('Error', {
                description: error instanceof Error ? error.message : 'Something went wrong',
            });
            setTemplateLoading(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <Link href="/dashboard/blogs" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blogs
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create New Blog</h2>
                <p className="text-muted-foreground">
                    Choose how you'd like to create your blog post - let AI research and write for you, or start with a template.
                </p>
            </div>

            <Tabs defaultValue="ai-generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai-generate" className="gap-2">
                        <Wand2 className="w-4 h-4" />
                        AI Generate
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Use Template
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-generate" className="mt-6">
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Blog Generation</CardTitle>
                                <CardDescription>
                                    Enter a topic and our AI agents will research and write a comprehensive post for you.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="topic">Topic or Title</Label>
                                        <Input
                                            id="topic"
                                            name="topic"
                                            placeholder="e.g., The Future of Quantum Computing in Healthcare"
                                            required
                                            minLength={5}
                                            disabled={loading}
                                            className="text-lg py-6"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Be specific for better results. The AI will research this topic thoroughly.
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full py-6 text-lg gap-2" disabled={loading}>
                                        {loading ? (
                                            'Starting Agents...'
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Generate Blog Post
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </form>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Blog Templates</CardTitle>
                            <CardDescription>
                                Start with a proven template structure and customize it with your content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {templateLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center space-y-2">
                                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                                        <p className="text-sm text-muted-foreground">Creating blog from template...</p>
                                    </div>
                                </div>
                            ) : (
                                <BlogTemplates onSelectTemplate={handleTemplateSelect} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
