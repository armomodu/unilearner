'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

interface BlogEditorProps {
    blogId: string;
    initialTitle: string;
    initialContent: string;
}

export function BlogEditor({ blogId, initialTitle, initialContent }: BlogEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Track changes
    useEffect(() => {
        const hasContentChanged = content !== initialContent;
        const hasTitleChanged = title !== initialTitle;
        setHasChanges(hasContentChanged || hasTitleChanged);
    }, [content, title, initialContent, initialTitle]);

    // Manual save function
    const handleSave = useCallback(async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Title and content are required');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/blogs/${blogId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setLastSaved(new Date());
                setHasChanges(false);
                toast.success('Blog saved successfully');
            } else {
                toast.error(data.error || 'Failed to save blog');
            }
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save blog');
        } finally {
            setIsSaving(false);
        }
    }, [blogId, title, content, hasChanges]);

    // Keyboard shortcut for save (Ctrl+S / Cmd+S)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                if (!isSaving && hasChanges) {
                    handleSave();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSaving, hasChanges, handleSave]);

    return (
        <>
            {/* Save Button and Status */}
            <div className="flex items-center justify-between mb-6 p-4 bg-card/20 rounded-lg border border-border/20">
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || !hasChanges}
                        className="gap-2 shadow-sm"
                        size="sm"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    
                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                                <Clock className="w-3 h-3" />
                                Saved {lastSaved.toLocaleTimeString()}
                            </div>
                        )}
                        
                        {hasChanges && !isSaving && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    Unsaved changes
                                </span>
                            </div>
                        )}
                        
                        {!hasChanges && !isSaving && lastSaved && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    All changes saved
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-xs text-muted-foreground/70">
                    Press Ctrl+S to save quickly
                </div>
            </div>

            {/* Editor Tabs */}
            <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="edit" className="gap-2">
                        ✏️ Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                        👁️ Preview
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="mt-4 space-y-4">
                    {/* Title Editor */}
                    <Card className="border-0 shadow-sm bg-card/30">
                        <CardContent className="p-6">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-2xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/70 leading-tight tracking-tight"
                                placeholder="Enter your blog title..."
                            />
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card className="border-0 shadow-sm bg-card/30">
                        <CardContent className="p-0">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[600px] border-0 focus-visible:ring-0 resize-none p-6 text-sm leading-relaxed bg-transparent placeholder:text-muted-foreground/70"
                                placeholder="Start writing your blog post here. Use Markdown for formatting:

# Headings
## Subheadings
**Bold text**
*Italic text*
`Code snippets`

> Blockquotes

- Bullet points
1. Numbered lists

[Links](https://example.com)
"
                                style={{
                                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                    lineHeight: '1.6',
                                    fontSize: '14px'
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                    <Card className="border-0 shadow-sm bg-card/30">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div className="border-b border-border/30 pb-4">
                                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                                        {title || 'Untitled Blog Post'}
                                    </h1>
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        Preview • {content.length} characters
                                    </div>
                                </div>
                                <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-pre:bg-muted/50 prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-primary/50">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || '*Start writing to see your content preview...*'}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}