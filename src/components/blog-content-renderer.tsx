import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface BlogContentRendererProps {
    contentType?: 'markdown' | 'rich' | string | null;
    content?: string | null;
    richContent?: unknown | null;
    htmlCache?: string | null;
    className?: string;
}

/**
 * Renders blog content based on the stored format.
 * - Markdown -> ReactMarkdown (current behavior)
 * - Rich content -> pre-rendered HTML (will later delegate to a TipTap renderer)
 */
export function BlogContentRenderer({
    contentType,
    content,
    htmlCache,
    className,
}: BlogContentRendererProps) {
    if (contentType === 'rich') {
        if (htmlCache) {
            return (
                <div
                    className={cn('prose prose-lg mx-auto text-foreground', className)}
                    dangerouslySetInnerHTML={{ __html: htmlCache }}
                />
            );
        }

        return (
            <div className={cn('text-sm text-muted-foreground italic', className)}>
                Rich content is not yet available. Please check back shortly.
            </div>
        );
    }

    return (
        <div className={cn('prose prose-lg mx-auto text-foreground', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content ?? ''}
            </ReactMarkdown>
        </div>
    );
}
