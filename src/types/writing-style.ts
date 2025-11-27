export interface WritingStyleDTO {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    styleType: 'WRITING' | 'GRAPHICS';
    systemPrompt: string;
    microPrompt?: string | null;
    graphicsConfig?: Record<string, any> | null;
    isDefault: boolean;
    userId?: string | null;
    createdAt: string;
    updatedAt: string;
}

