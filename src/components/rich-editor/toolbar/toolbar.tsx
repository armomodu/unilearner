'use client';

import { Button } from '@/components/ui/button';
import { useState, type ElementType } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Type,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo2,
    Redo2,
    Plus,
    Code,
    Link2,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

function ToolbarIconButton({
    icon: Icon,
    label,
    isActive,
    onClick,
    disabled,
}: {
    icon: ElementType;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            className="h-9 w-9 p-0"
            onClick={onClick}
            disabled={disabled}
            title={label}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}

const blockOptions = [
    { label: 'Paragraph', value: 'paragraph', level: null },
    { label: 'Heading 1', value: 'heading-1', level: 1 },
    { label: 'Heading 2', value: 'heading-2', level: 2 },
    { label: 'Heading 3', value: 'heading-3', level: 3 },
    { label: 'Heading 4', value: 'heading-4', level: 4 },
];

const textColorOptions = [
    { label: 'Default', value: '' },
    { label: 'Gray', value: '#1F2937' },
    { label: 'Red', value: '#C0392B' },
    { label: 'Orange', value: '#D35400' },
    { label: 'Yellow', value: '#F1C40F' },
    { label: 'Green', value: '#1B8141' },
    { label: 'Blue', value: '#2563EB' },
    { label: 'Purple', value: '#7C3AED' },
];

const highlightOptions = [
    { label: 'None', value: '' },
    { label: 'Lemon', value: '#FEF3C7' },
    { label: 'Lavender', value: '#F5EEF8' },
    { label: 'Sky', value: '#E0F2FE' },
    { label: 'Mint', value: '#DCFCE7' },
    { label: 'Rose', value: '#FFE4E6' },
];

const emojiOptions = ['😀', '😁', '😊', '😎', '🤔', '🚀', '🔥', '✅', '⚠️', '💡'];

const statusOptions = [
    {
        value: 'in-progress',
        label: 'In progress',
        bg: '#FEF3C7',
        color: '#92400E',
        text: 'In progress',
    },
    {
        value: 'needs-review',
        label: 'Needs review',
        bg: '#DBEAFE',
        color: '#1D4ED8',
        text: 'Needs review',
    },
    {
        value: 'blocked',
        label: 'Blocked',
        bg: '#FEE2E2',
        color: '#B91C1C',
        text: 'Blocked',
    },
    {
        value: 'done',
        label: 'Done',
        bg: '#DCFCE7',
        color: '#15803D',
        text: 'Done',
    },
];

interface RichEditorToolbarProps {
    editor: Editor;
}

function Divider() {
    return <span className="mx-1 h-6 w-px bg-border" />;
}

export function RichEditorToolbar({ editor }: RichEditorToolbarProps) {
    const [insertSelection, setInsertSelection] = useState('');
    const [emojiSelection, setEmojiSelection] = useState('');
    const [statusSelection, setStatusSelection] = useState('');
    const [textColor, setTextColor] = useState('');
    const [highlightColor, setHighlightColor] = useState('');
    const activeBlock =
        blockOptions.find(option =>
            option.level
                ? editor.isActive('heading', { level: option.level })
                : editor.isActive('paragraph')
        )?.value ?? 'paragraph';

    const insertImage = () => {
        if (typeof window === 'undefined') return;
        const url = window.prompt('Enter image URL');
        if (!url) return;
        editor.chain().focus().setImage({ src: url }).run();
    };

    const insertLink = () => {
        if (typeof window === 'undefined') return;
        const previousUrl = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Enter URL', previousUrl ?? '');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleInsertSelection = (value: string) => {
        switch (value) {
            case 'divider':
                editor.chain().focus().setHorizontalRule().run();
                break;
            case 'table':
                editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
                break;
            case 'image':
                insertImage();
                break;
            case 'code':
                editor.chain().focus().toggleCodeBlock().run();
                break;
            case 'link':
                insertLink();
                break;
            default:
                break;
        }
        setInsertSelection('');
    };

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Type className="h-4 w-4" />
                <select
                    value={activeBlock}
                    onChange={(event) => {
                        const next = event.target.value;
                        const option = blockOptions.find(opt => opt.value === next);
                        if (!option) return;
                        const chain = editor.chain().focus();
                        if (option.level) {
                            chain.toggleHeading({ level: option.level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                        } else {
                            chain.setParagraph().run();
                        }
                    }}
                    className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                >
                    {blockOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            <Divider />

            <div className="flex items-center gap-1">
                <ToolbarIconButton
                    icon={Bold}
                    label="Bold"
                    isActive={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <ToolbarIconButton
                    icon={Italic}
                    label="Italic"
                    isActive={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <ToolbarIconButton
                    icon={Underline}
                    label="Underline"
                    isActive={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                />
                <ToolbarIconButton
                    icon={Strikethrough}
                    label="Strikethrough"
                    isActive={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                />
                <ToolbarIconButton
                    icon={Code}
                    label="Inline code"
                    isActive={editor.isActive('code')}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                />
                <ToolbarIconButton
                    icon={Link2}
                    label="Link"
                    isActive={editor.isActive('link')}
                    onClick={insertLink}
                />
            </div>

            <Divider />

            <div className="flex items-center gap-1">
                <ToolbarIconButton
                    icon={List}
                    label="Bullet list"
                    isActive={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                />
                <ToolbarIconButton
                    icon={ListOrdered}
                    label="Numbered list"
                    isActive={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                />
                <ToolbarIconButton
                    icon={ListChecks}
                    label="Task list"
                    isActive={editor.isActive('taskList')}
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                />
                <ToolbarIconButton
                    icon={Quote}
                    label="Quote"
                    isActive={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                />
            </div>

            <Divider />

            <div className="flex items-center gap-1">
                <ToolbarIconButton
                    icon={AlignLeft}
                    label="Align left"
                    isActive={editor.isActive({ textAlign: 'left' })}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                />
                <ToolbarIconButton
                    icon={AlignCenter}
                    label="Align center"
                    isActive={editor.isActive({ textAlign: 'center' })}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                />
                <ToolbarIconButton
                    icon={AlignRight}
                    label="Align right"
                    isActive={editor.isActive({ textAlign: 'right' })}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                />
                <ToolbarIconButton
                    icon={AlignJustify}
                    label="Justify"
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                />
            </div>

            <Divider />

            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Text
                <select
                    value={textColor}
                    onChange={(event) => {
                        const value = event.target.value;
                        setTextColor(value);
                        const chain = editor.chain().focus();
                        if (value) {
                            chain.setColor(value).run();
                        } else {
                            chain.unsetColor().run();
                        }
                    }}
                    className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                >
                    {textColorOptions.map(option => (
                        <option key={option.label} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Highlight
                <select
                    value={highlightColor}
                    onChange={(event) => {
                        const value = event.target.value;
                        setHighlightColor(value);
                        const chain = editor.chain().focus();
                        if (value) {
                            chain.setHighlight({ color: value }).run();
                        } else {
                            chain.unsetHighlight().run();
                        }
                    }}
                    className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                >
                    {highlightOptions.map(option => (
                        <option key={option.label} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            <Divider />

            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Plus className="h-4 w-4" />
                <select
                    value={insertSelection}
                    onChange={(event) => handleInsertSelection(event.target.value)}
                    className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                >
                    <option value="">Insert</option>
                    <option value="divider">Divider</option>
                    <option value="table">Table (3x3)</option>
                    <option value="image">Image</option>
                    <option value="code">Code block</option>
                    <option value="link">Link</option>
                </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Emoji
                <select
                    value={emojiSelection}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (!value) return;
                        editor.chain().focus().insertContent(value).run();
                        setEmojiSelection('');
                    }}
                    className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                >
                    <option value="">Pick emoji</option>
                    {emojiOptions.map(emoji => (
                        <option key={emoji} value={emoji}>
                            {emoji}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Status
                <select
                    value={statusSelection}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (!value) return;
                        const status = statusOptions.find(item => item.value === value);
                        if (status) {
                            editor
                                .chain()
                                .focus()
                                .insertContent(
                                    `<span style="display:inline-flex;align-items:center;font-size:0.85em;padding:0.1rem 0.5rem;border-radius:999px;background:${status.bg};color:${status.color};margin-right:0.25rem;">${status.text}</span>`
                                )
                                .run();
                        }
                        setStatusSelection('');
                    }}
                    className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                >
                    <option value="">Add status</option>
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            <div className="ml-auto flex items-center gap-1">
                <ToolbarIconButton
                    icon={Undo2}
                    label="Undo"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                />
                <ToolbarIconButton
                    icon={Redo2}
                    label="Redo"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                />
            </div>
        </div>
    );
}
