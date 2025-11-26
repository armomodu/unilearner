import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/core';
import { htmlExtensions } from '@/lib/tiptap/extensions';

export function generateRichHtml(content: JSONContent): string {
    try {
        return generateHTML(content, htmlExtensions);
    } catch (error) {
        console.error('Failed to generate HTML from TipTap content:', error);
        return '';
    }
}
