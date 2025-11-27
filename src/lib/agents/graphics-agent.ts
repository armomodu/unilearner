import { GoogleGenAI } from '@google/genai';
import type { ResearchOutput } from './research-agent';
import type { WriterOutput } from './writer-agent';
import { resolveGraphicsStyle, type GraphicsStyleRecord } from './graphics-styles';
import { uploadGeneratedGraphic } from '@/lib/graphics-storage';

export interface GraphicsAgentInput {
    topic: string;
    research: ResearchOutput;
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
 * Build the image generation prompt using the graphics style template
 */
function buildGraphicsPrompt(input: GraphicsAgentInput, style: GraphicsStyleRecord): string {
    const { topic, research, content } = input;

    // Extract key insights from research and content
    const keyInsights = research.insights.slice(0, 5);
    const keyPoints = research.keyPoints.slice(0, 5);
    const themes = research.themes.slice(0, 3);

    // Get graphics config from style
    const config = (style.graphicsConfig as Record<string, any>) || {};
    const microPrompt = style.microPrompt || '';

    return `${style.systemPrompt}

BLOG CONTENT TO VISUALIZE:
Title: ${content.title}
Topic: ${topic}

KEY INSIGHTS:
${keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

KEY POINTS/STATISTICS:
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

MAIN THEMES:
${themes.map((theme, i) => `${i + 1}. ${theme}`).join('\n')}

EXCERPT:
${content.excerpt}

STYLE GUIDANCE:
${microPrompt}

TECHNICAL SPECIFICATIONS:
- Aspect Ratio: ${config.aspectRatio || '16:9'}
- Audience: ${config.audience || 'general'}
- Visual Style: ${config.visualStyle || 'professional'}
- Color Scheme: ${config.colorScheme || 'balanced'}

INSTRUCTIONS:
Create a professional infographic that summarizes the key insights and themes from the blog content above.
Focus on visual clarity, professional design, and information hierarchy.
Ensure all text is accurate, readable, and properly formatted.
Include visual elements (icons, charts, or diagrams) that support the content.`;
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
    const config = (style.graphicsConfig as Record<string, any>) || {};
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
                // Additional Imagen config options
                safetyFilterLevel: 'block_some', // Moderate safety filtering
                personGeneration: 'dont_allow', // Avoid generating people
            },
        });

        // Extract image data from response
        // The response contains an array of GeneratedImage objects
        if (!response.images || response.images.length === 0) {
            throw new Error('No images returned from Gemini Imagen');
        }

        const generatedImage = response.images[0];

        // Check if image was filtered
        if (generatedImage.raiFilteredReason) {
            throw new Error(`Image generation filtered: ${generatedImage.raiFilteredReason}`);
        }

        // Extract base64 image data
        const imageData = generatedImage.imageBytes;

        if (!imageData) {
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
export function generateFallbackGraphic(input: GraphicsAgentInput): GraphicsOutput {
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
