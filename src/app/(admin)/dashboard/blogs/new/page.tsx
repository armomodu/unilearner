'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Link href="/dashboard/blogs" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blogs
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create New Blog</h2>
                <p className="text-muted-foreground">
                    Enter a topic and let our AI agents research and write a comprehensive post for you.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Blog Details</CardTitle>
                    <CardDescription>
                        What would you like to write about today?
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
    );
}
