export interface WritingStyleDTO {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    systemPrompt: string;
    microPrompt?: string | null;
    isDefault: boolean;
    userId?: string | null;
    createdAt: string;
    updatedAt: string;
}

