'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { baseExtensions } from '@/lib/tiptap/extensions';
import { cn } from '@/lib/utils';
import { RichEditorToolbar } from './toolbar/toolbar';

interface RichBlogEditorProps {
    initialContent?: JSONContent | null;
    initialMarkdown?: string | null;
    onChange?: (payload: { json: JSONContent; html: string }) => void;
    readOnly?: boolean;
    className?: string;
}

function createDocFromText(text?: string | null): JSONContent | null {
    if (!text || !text.trim()) return null;
    const paragraphs = text.split(/\n{2,}/).map(paragraph => ({
        type: 'paragraph',
        content: [{ type: 'text', text: paragraph }],
    }));
    return {
        type: 'doc',
        content: paragraphs.length > 0 ? paragraphs : undefined,
    };
}

export function RichBlogEditor({
    initialContent,
    initialMarkdown,
    onChange,
    readOnly = false,
    className,
}: RichBlogEditorProps) {
    const fallbackDoc = initialContent ?? createDocFromText(initialMarkdown) ?? {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [{ type: 'text', text: '' }],
            },
        ],
    };

    const editor = useEditor({
        immediatelyRender: false,
        extensions: baseExtensions,
        content: fallbackDoc,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange?.({
                json: editor.getJSON(),
                html: editor.getHTML(),
            });
        },
    });

    useEffect(() => {
        if (!editor || !initialContent) return;
        editor.commands.setContent(initialContent);
    }, [editor, initialContent]);

    if (!editor) {
        return (
            <div className="rounded border border-dashed border-muted p-4 text-sm text-muted-foreground">
                Initializing rich editor...
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div className="rounded-lg border bg-white shadow-sm">
                {!readOnly && (
                    <div className="border-b bg-slate-50/60 px-3 py-2">
                        <RichEditorToolbar editor={editor} />
                    </div>
                )}
                <EditorContent
                    editor={editor}
                    className="prose prose-neutral dark:prose-invert max-w-none px-6 py-8 focus:outline-none"
                />
            </div>
        </div>
    );
}
