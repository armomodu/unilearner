import { GoogleGenAI } from '@google/genai';
import type { WriterOutput } from './writer-agent';
import { resolveGraphicsStyle, type GraphicsStyleRecord } from './graphics-styles';
import { uploadGeneratedGraphic } from '@/lib/graphics-storage';
import { executiveInfographicPromptAgent } from './executive-infographic-prompt-agent';

type GraphicsStyleConfig = {
    aspectRatio?: string;
    width?: number;
    height?: number;
    audience?: string;
    visualStyle?: string;
    colorScheme?: string;
    includeCharts?: boolean;
    includeIcons?: boolean;
    // Executive mode configuration
    executiveMode?: boolean;
    layoutArchetype?: string; // 'auto' or specific archetype name
    themePreference?: 'auto' | 'dark' | 'light';
    consultingGrade?: boolean;
    zoneCount?: { min: number; max: number };
    [key: string]: unknown;
};

function extractGraphicsConfig(style: GraphicsStyleRecord): GraphicsStyleConfig {
    const raw = style.graphicsConfig;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return {};
    }
    return raw as GraphicsStyleConfig;
}

export interface GraphicsAgentInput {
    topic: string;
    content: WriterOutput;
    blogId: string;
    styleId?: string;
}

export interface GraphicsAsset {
    id: string;
    type: 'infographic' | 'chart' | 'diagram' | 'illustration';
    url: string;
    alt: string;
    caption?: string;
    placement: string;
    generatedWith: string;
}

export interface GraphicsOutput {
    assets: GraphicsAsset[];
    metadata: {
        totalAssets: number;
        generationMethod: string;
        styleUsed: string;
    };
}

/**
 * Graphics Agent - Generates visual assets using Gemini Imagen
 *
 * @param input - Topic, research, content, and style information
 * @returns Generated graphics with metadata
 * @throws Error if Gemini API fails or graphics generation fails
 */
export async function graphicsAgent(input: GraphicsAgentInput): Promise<GraphicsOutput> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    try {
        console.log('Graphics Agent: Starting graphics generation...');

        // Resolve graphics style (get specific style or default)
        const style = await resolveGraphicsStyle(input.styleId);
        console.log(`Graphics Agent: Using style "${style.name}"`);

        // Build image generation prompt
        const prompt = await buildGraphicsPrompt(input, style);

        // Generate infographic using Gemini Imagen
        const imageData = await generateInfographic(prompt, style);

        // Upload to Supabase storage
        const filename = `infographic-${Date.now()}.png`;
        const uploadResult = await uploadGeneratedGraphic(imageData, input.blogId, filename);

        if (!uploadResult.success || !uploadResult.publicUrl) {
            throw new Error(uploadResult.error || 'Failed to upload generated graphic');
        }

        console.log('Graphics Agent: Graphics generation completed successfully');

        // Return structured output
        const asset: GraphicsAsset = {
            id: `graphic-${Date.now()}`,
            type: 'infographic',
            url: uploadResult.publicUrl,
            alt: `Infographic summarizing ${input.topic}`,
            caption: `Key insights from "${input.content.title}"`,
            placement: 'header',
            generatedWith: 'gemini-3-pro-image-preview',
        };

        return {
            assets: [asset],
            metadata: {
                totalAssets: 1,
                generationMethod: 'gemini-3-pro-image-preview',
                styleUsed: style.name,
            },
        };
    } catch (error) {
        console.error('Graphics Agent error:', error);
        throw new Error(`Graphics agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Build the image generation prompt.
 *
 * In executive mode, this now uses an LLM "prompt engineering" step that
 * applies the meta-prompt + writer content to produce the final Imagen prompt.
 */
async function buildGraphicsPrompt(input: GraphicsAgentInput, style: GraphicsStyleRecord): Promise<string> {
    const { topic, content } = input;

    // Check if executive mode is enabled (new feature)
    const config = extractGraphicsConfig(style);
    const useExecutiveMode = config.executiveMode !== false; // Default to true

    if (useExecutiveMode) {
        console.log('Graphics Agent: Using executive infographic prompt agent');

        const imagenPrompt = await executiveInfographicPromptAgent(content, topic);

        const finalPrompt = `${imagenPrompt}

TECHNICAL SPECIFICATIONS (FINAL):
- Aspect Ratio: ${config.aspectRatio || '16:9'}
- Resolution: ${config.width || 1920}x${config.height || 1080}px minimum
- Format: PNG, high quality
- Output: Professional, consulting-grade infographic`;

        return finalPrompt;
    }

    // Legacy mode (fallback to simple prompt if executive mode disabled)
    console.log('Graphics Agent: Using legacy mode (executive mode disabled)');

    return `${style.systemPrompt}

BLOG CONTENT TO VISUALIZE:
Title: ${content.title}
Topic: ${topic}
Excerpt: ${content.excerpt}

CONTENT PREVIEW:
${content.content.substring(0, 500)}...

STYLE GUIDANCE:
${style.microPrompt || 'Create a professional infographic'}

TECHNICAL SPECIFICATIONS:
- Aspect Ratio: ${config.aspectRatio || '16:9'}
- Resolution: ${config.width || 1920}x${config.height || 1080}px
- Audience: ${config.audience || 'general'}
- Visual Style: ${config.visualStyle || 'professional'}
- Color Scheme: ${config.colorScheme || 'balanced'}

Create a professional infographic that summarizes the blog content above.`;
}


/**
 * Generate an infographic using Gemini 3 Pro Image Preview
 *
 * @param prompt - The image generation prompt
 * @param style - Graphics style configuration
 * @returns Base64-encoded PNG image data
 */
async function generateInfographic(
    prompt: string,
    style: GraphicsStyleRecord
): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // Extract graphics config
    const config = extractGraphicsConfig(style);
    const aspectRatio = config.aspectRatio || '16:9';
    const imageSize = config.width && config.height ? undefined : '2K';

    try {
        console.log('Graphics Agent: Calling Gemini 3 Pro Image Preview...');

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: prompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
                imageConfig: {
                    aspectRatio,
                    ...(imageSize ? { imageSize } : {}),
                },
            },
        });

        const candidates = (response as any).candidates ?? [];
        const parts = candidates[0]?.content?.parts ?? [];

        let imageData: string | undefined;
        for (const part of parts) {
            if (part.inlineData?.data) {
                imageData = part.inlineData.data as string;
                break;
            }
        }

        if (!imageData) {
            console.error('Graphics Agent: No image data in Gemini response:', response);
            throw new Error('No image data in Gemini 3 Pro image response');
        }

        console.log('Graphics Agent: Image generated successfully via Gemini 3 Pro Image Preview');

        return imageData;
    } catch (error) {
        console.error('Gemini 3 Pro Image Preview error:', error);
        throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Fallback: Generate a simple text-based description if image generation fails
 * This can be enhanced to use programmatic chart generation libraries
 */
export function generateFallbackGraphic(_input: GraphicsAgentInput): GraphicsOutput {
    console.warn('Graphics Agent: Using fallback (no actual graphic generated)');

    return {
        assets: [],
        metadata: {
            totalAssets: 0,
            generationMethod: 'fallback',
            styleUsed: 'none',
        },
    };
}
