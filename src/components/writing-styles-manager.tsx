'use client';

import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PlusCircle, RefreshCcw, Trash2 } from 'lucide-react';
import type { WritingStyleDTO } from '@/types/writing-style';

interface WritingStylesManagerProps {
    initialStyles: WritingStyleDTO[];
}

const emptyForm = {
    name: '',
    description: '',
    microPrompt: '',
    systemPrompt: '',
};

export function WritingStylesManager({ initialStyles }: WritingStylesManagerProps) {
    const [styles, setStyles] = useState<WritingStyleDTO[]>(initialStyles);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const defaultStyle = useMemo(() => styles.find(style => style.isDefault), [styles]);

    const refreshStyles = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/writing-styles');
            if (!res.ok) {
                throw new Error('Failed to load styles');
            }
            const data = await res.json();
            setStyles(data.styles ?? []);
        } catch (error) {
            console.error(error);
            toast.error('Unable to refresh styles');
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/writing-styles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create style');
            }

            toast.success('Style added', { description: `${data.style.name} is now available during generation.` });
            setForm(emptyForm);
            await refreshStyles();
        } catch (error) {
            toast.error('Unable to create style', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const style = styles.find(s => s.id === id);
        if (!style) return;

        const confirmed = window.confirm(`Delete style "${style.name}"? This cannot be undone.`);
        if (!confirmed) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/writing-styles/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete style');
            }
            toast.success('Style deleted', { description: `"${style.name}" removed.` });
            await refreshStyles();
        } catch (error) {
            toast.error('Unable to delete style', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Create a New Style</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Combine a short reminder with a detailed system prompt to guide the writer agent.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={refreshStyles}
                        disabled={refreshing}
                    >
                        <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleCreate}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Style Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., Conversational Analyst Brief"
                                    value={form.name}
                                    onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="Short summary of how this style should feel"
                                    value={form.description}
                                    onChange={(event) => setForm(prev => ({ ...prev, description: event.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="microPrompt">Micro Prompt</Label>
                            <Textarea
                                id="microPrompt"
                                name="microPrompt"
                                placeholder="One or two sentences reminding the agent of the tone, pacing, and constraints."
                                value={form.microPrompt}
                                onChange={(event) => setForm(prev => ({ ...prev, microPrompt: event.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="systemPrompt">System Prompt</Label>
                            <Textarea
                                id="systemPrompt"
                                name="systemPrompt"
                                placeholder="Full set of structural, stylistic, and formatting rules."
                                value={form.systemPrompt}
                                onChange={(event) => setForm(prev => ({ ...prev, systemPrompt: event.target.value }))}
                                rows={8}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Tip: Include structural requirements, tone guidance, formatting expectations, and any absolute rules (e.g., avoid the m dash).
                            </p>
                        </div>
                        <Button type="submit" className="gap-2" disabled={loading}>
                            <PlusCircle className="w-4 h-4" />
                            {loading ? 'Creating style...' : 'Create Style'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Available Styles</h3>
                    {defaultStyle && (
                        <p className="text-sm text-muted-foreground">
                            Default style: <span className="font-medium">{defaultStyle.name}</span>
                        </p>
                    )}
                </div>

                {styles.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No styles available yet. Create one to get started.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {styles.map((style) => (
                            <Card key={style.id}>
                                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>{style.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {style.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {style.isDefault && (
                                            <Badge>Default</Badge>
                                        )}
                                        <Badge variant={style.userId ? 'secondary' : 'outline'}>
                                            {style.userId ? 'Custom' : 'Global'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Micro Prompt</p>
                                        <p className="text-sm whitespace-pre-line">
                                            {style.microPrompt || 'Not provided.'}
                                        </p>
                                    </div>
                                    <details className="text-sm">
                                        <summary className="cursor-pointer text-primary font-medium">
                                            View system prompt
                                        </summary>
                                        <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                                            {style.systemPrompt}
                                        </pre>
                                    </details>
                                    {style.userId && !style.isDefault && (
                                        <div className="flex justify-end">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => handleDelete(style.id)}
                                                disabled={deletingId === style.id}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {deletingId === style.id ? 'Removing...' : 'Delete style'}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

