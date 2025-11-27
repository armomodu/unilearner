'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WritingStyleDTO } from '@/types/writing-style';

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [writingStyles, setWritingStyles] = useState<WritingStyleDTO[]>([]);
    const [graphicsStyles, setGraphicsStyles] = useState<WritingStyleDTO[]>([]);
    const [stylesLoading, setStylesLoading] = useState(true);
    const [selectedWritingStyleId, setSelectedWritingStyleId] = useState<string>('');
    const [selectedGraphicsStyleId, setSelectedGraphicsStyleId] = useState<string>('');
    const [enableGraphics, setEnableGraphics] = useState(false);
    const [stylesError, setStylesError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStyles = async () => {
            try {
                const res = await fetch('/api/writing-styles');
                if (!res.ok) {
                    throw new Error('Failed to load styles');
                }
                const data = await res.json();
                const allStyles: WritingStyleDTO[] = data.styles ?? [];

                // Separate writing and graphics styles
                const writing = allStyles.filter(s => s.styleType === 'WRITING');
                const graphics = allStyles.filter(s => s.styleType === 'GRAPHICS');

                setWritingStyles(writing);
                setGraphicsStyles(graphics);

                // Auto-select default styles
                const defaultWriting = writing.find(s => s.isDefault) ?? writing[0];
                const defaultGraphics = graphics.find(s => s.isDefault) ?? graphics[0];

                setSelectedWritingStyleId(defaultWriting?.id || '');
                setSelectedGraphicsStyleId(defaultGraphics?.id || '');
                setStylesError(null);
            } catch (error) {
                console.error(error);
                setStylesError('Unable to load styles. Default styles will be used.');
            } finally {
                setStylesLoading(false);
            }
        };

        fetchStyles();
    }, []);

    const selectedWritingStyle = useMemo(
        () => writingStyles.find(style => style.id === selectedWritingStyleId),
        [writingStyles, selectedWritingStyleId]
    );

    const selectedGraphicsStyle = useMemo(
        () => graphicsStyles.find(style => style.id === selectedGraphicsStyleId),
        [graphicsStyles, selectedGraphicsStyleId]
    );

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
                body: JSON.stringify({
                    topic,
                    styleId: selectedWritingStyleId || undefined,
                    graphicsStyleId: enableGraphics ? (selectedGraphicsStyleId || undefined) : undefined,
                }),
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
                    Choose how you&apos;d like to create your blog post - let AI research and write for you, or start with a template.
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
                                    {/* Writing Style Selection */}
                                    <div className="space-y-2">
                                        <Label>Writing Style</Label>
                                        {stylesError ? (
                                            <p className="text-sm text-destructive">{stylesError}</p>
                                        ) : (
                                            <>
                                                <Select
                                                    value={selectedWritingStyleId}
                                                    onValueChange={setSelectedWritingStyleId}
                                                    disabled={stylesLoading || loading || writingStyles.length === 0}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={stylesLoading ? 'Loading styles...' : 'Select a writing style'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {writingStyles.map((style) => (
                                                            <SelectItem key={style.id} value={style.id}>
                                                                {style.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedWritingStyle?.description || 'Default McKinsey-style tone will be used.'}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Graphics Generation Toggle */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="enableGraphics"
                                                checked={enableGraphics}
                                                onChange={(e) => setEnableGraphics(e.target.checked)}
                                                disabled={loading}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="enableGraphics" className="cursor-pointer font-normal">
                                                Generate AI Infographic
                                            </Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground ml-6">
                                            AI will create a professional visual summary of your blog content
                                        </p>
                                    </div>

                                    {/* Graphics Style Selection (shown when enabled) */}
                                    {enableGraphics && (
                                        <div className="space-y-2 ml-6 p-4 border rounded-lg bg-muted/30">
                                            <Label>Graphics Style</Label>
                                            <Select
                                                value={selectedGraphicsStyleId}
                                                onValueChange={setSelectedGraphicsStyleId}
                                                disabled={stylesLoading || loading || graphicsStyles.length === 0}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={stylesLoading ? 'Loading graphics styles...' : 'Select a graphics style'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {graphicsStyles.map((style) => (
                                                        <SelectItem key={style.id} value={style.id}>
                                                            {style.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedGraphicsStyle?.description || 'Select a graphics style for the infographic.'}
                                            </p>
                                        </div>
                                    )}

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
