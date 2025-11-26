import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

const sharedExtensions = [
    StarterKit.configure({
        heading: {
            levels: [1, 2, 3, 4],
        },
        codeBlock: {
            languageClassPrefix: 'language-',
        },
    }),
    Image.configure({
        allowBase64: true,
    }),
    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            class: 'rich-editor-link',
        },
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Table.configure({
        resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
];

export const baseExtensions = [
    ...sharedExtensions,
    Placeholder.configure({
        placeholder: 'Start writing...',
    }),
    CharacterCount,
    Underline,
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
];

export const htmlExtensions = sharedExtensions;
