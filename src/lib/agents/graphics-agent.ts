import { GoogleGenAI, PersonGeneration, SafetyFilterLevel } from '@google/genai';
import type { WriterOutput } from './writer-agent';
import { resolveGraphicsStyle, type GraphicsStyleRecord } from './graphics-styles';
import { uploadGeneratedGraphic } from '@/lib/graphics-storage';
import { generateExecutiveInfographicPrompt } from './executive-infographic-generator';

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
        const prompt = buildGraphicsPrompt(input, style);

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
            generatedWith: 'gemini-imagen-4',
        };

        return {
            assets: [asset],
            metadata: {
                totalAssets: 1,
                generationMethod: 'gemini-imagen-4',
                styleUsed: style.name,
            },
        };
    } catch (error) {
        console.error('Graphics Agent error:', error);
        throw new Error(`Graphics agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Build the image generation prompt using the Executive Infographic Generator
 */
function buildGraphicsPrompt(input: GraphicsAgentInput, style: GraphicsStyleRecord): string {
    const { topic, content } = input;

    // Check if executive mode is enabled (new feature)
    const config = extractGraphicsConfig(style);
    const useExecutiveMode = config.executiveMode !== false; // Default to true

    if (useExecutiveMode) {
        // Use new Executive Infographic Generator
        console.log('Graphics Agent: Using Executive Infographic Generator mode');

        const executiveOutput = generateExecutiveInfographicPrompt(content, topic);

        console.log('Graphics Agent: Executive analysis:', {
            theme: executiveOutput.analysisMetadata.detectedTheme,
            archetype: executiveOutput.analysisMetadata.selectedArchetype,
            zoneCount: executiveOutput.analysisMetadata.zoneCount,
            confidence: executiveOutput.analysisMetadata.confidenceScore,
        });

        // Combine executive prompt with any style-specific overrides
        const styleOverride = style.microPrompt
            ? `\n\nSTYLE OVERRIDE:\n${style.microPrompt}`
            : '';

        return `${executiveOutput.prompt}${styleOverride}

TECHNICAL SPECIFICATIONS (FINAL):
- Aspect Ratio: ${config.aspectRatio || '16:9'}
- Resolution: ${config.width || 1920}x${config.height || 1080}px minimum
- Format: PNG, high quality
- Output: Professional, consulting-grade infographic`;
    } else {
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
}

/**
 * Generate an infographic using Gemini Imagen API
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

    try {
        console.log('Graphics Agent: Calling Gemini Imagen API...');

        // Generate image using Gemini Imagen
        // Note: Using the generateImages method from @google/genai SDK
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio,
                imageSize: '2K',
                outputMimeType: 'image/png',
                safetyFilterLevel: SafetyFilterLevel.BLOCK_LOW_AND_ABOVE,
                personGeneration: PersonGeneration.DONT_ALLOW,
            },
        });

        // Extract image data from response
        // The response contains an array of GeneratedImage objects
        console.log('Graphics Agent: API Response structure:', {
            hasGeneratedImages: !!response.generatedImages,
            imageCount: response.generatedImages?.length || 0,
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            console.error('Graphics Agent: Empty response:', response);
            throw new Error('No images returned from Gemini Imagen');
        }

        const generatedImage = response.generatedImages[0];
        console.log('Graphics Agent: Generated image structure:', {
            hasImage: !!generatedImage.image,
            hasImageBytes: !!generatedImage.image?.imageBytes,
            hasRaiFilter: !!generatedImage.raiFilteredReason,
        });

        // Check if image was filtered
        if (generatedImage.raiFilteredReason) {
            throw new Error(`Image generation filtered: ${generatedImage.raiFilteredReason}`);
        }

        // Extract base64 image data
        if (!generatedImage.image) {
            console.error('Graphics Agent: No image property in response:', generatedImage);
            throw new Error('No image property in generated response');
        }

        const imageData = generatedImage.image.imageBytes;
        if (!imageData) {
            console.error('Graphics Agent: No imageBytes in response:', generatedImage.image);
            throw new Error('No image data in response');
        }

        console.log('Graphics Agent: Image generated successfully');

        // Return base64 data (may need conversion depending on SDK response format)
        return imageData;
    } catch (error) {
        console.error('Gemini Imagen API error:', error);
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
