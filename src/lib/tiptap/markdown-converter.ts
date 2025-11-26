import { marked } from 'marked';
import { generateJSON } from '@tiptap/html';
import type { JSONContent } from '@tiptap/core';
import { htmlExtensions } from '@/lib/tiptap/extensions';

marked.setOptions({
    gfm: true,
    breaks: false,
});

/**
 * Converts markdown text to TipTap JSON format using a reliable markdown parser.
 */
export function markdownToTiptapJson(markdown: string): JSONContent {
    try {
        const html = typeof markdown === 'string'
            ? (marked.parse(markdown) as string)
            : '';

        return generateJSON(html, htmlExtensions);
    } catch (error) {
        console.error('Failed to convert markdown to TipTap JSON:', error);
        return {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: markdown,
                        },
                    ],
                },
            ],
        };
    }
}
