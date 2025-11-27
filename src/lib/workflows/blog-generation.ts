import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { searchAgent } from '@/lib/agents/search-agent';
import { researchAgent } from '@/lib/agents/research-agent';
import { writerAgent } from '@/lib/agents/writer-agent';
import { graphicsAgent } from '@/lib/agents/graphics-agent';
import type { GraphicsOutput } from '@/lib/agents/graphics-agent';
import { markdownToTiptapJson } from '@/lib/tiptap/markdown-converter';
import { generateRichHtml } from '@/lib/tiptap/html';
import { stripNullsDeep } from '@/lib/sanitize';

/**
 * Main blog generation workflow
 * Runs asynchronously in background, updates database at each step
 *
 * @param blogId - The blog ID to generate content for
 * @param topic - The blog topic
 * @param writingStyleId - Optional writing style selection
 * @param graphicsStyleId - Optional graphics style selection
 */
export async function runGenerationWorkflow(
    blogId: string,
    topic: string,
    writingStyleId?: string,
    graphicsStyleId?: string
): Promise<void> {
    const workflowStartTime = Date.now();
    
    try {
        // ===================================
        // STEP 1: SEARCH
        // ===================================
        const searchStartTime = Date.now();
        
        await updateGenerationStatus(blogId, {
            status: 'SEARCHING',
            currentStep: 'Searching web sources...',
            searchStartedAt: new Date(searchStartTime),
        });

        const rawSearchResults = await searchAgent(topic);
        const searchResults = stripNullsDeep(rawSearchResults);
        
        const searchEndTime = Date.now();
        const searchDurationMs = searchEndTime - searchStartTime;

        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                searchComplete: true,
                searchData: searchResults as unknown as Prisma.InputJsonValue,
                searchStartedAt: new Date(searchStartTime),
                searchCompletedAt: new Date(searchEndTime),
                searchDurationMs,
                updatedAt: new Date(),
            },
        });

        // ===================================
        // STEP 2: RESEARCH
        // ===================================
        const researchStartTime = Date.now();
        
        await updateGenerationStatus(blogId, {
            status: 'RESEARCHING',
            currentStep: 'Analyzing sources and extracting insights...',
            researchStartedAt: new Date(researchStartTime),
        });

        const rawResearch = await researchAgent(topic, searchResults);
        const research = stripNullsDeep(rawResearch);
        
        const researchEndTime = Date.now();
        const researchDurationMs = researchEndTime - researchStartTime;

        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                researchComplete: true,
                researchData: research as unknown as Prisma.InputJsonValue,
                researchStartedAt: new Date(researchStartTime),
                researchCompletedAt: new Date(researchEndTime),
                researchDurationMs,
                updatedAt: new Date(),
            },
        });

        // ===================================
        // STEP 3: WRITE
        // ===================================
        const writerStartTime = Date.now();
        
        await updateGenerationStatus(blogId, {
            status: 'WRITING',
            currentStep: 'Generating blog content...',
            writerStartedAt: new Date(writerStartTime),
        });

        const rawContent = await writerAgent(topic, searchResults, research, writingStyleId);
        const content = stripNullsDeep(rawContent);
        
        const writerEndTime = Date.now();
        const writerDurationMs = writerEndTime - writerStartTime;

        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                writerComplete: true,
                writerStartedAt: new Date(writerStartTime),
                writerCompletedAt: new Date(writerEndTime),
                writerDurationMs,
                updatedAt: new Date(),
            },
        });

        // ===================================
        // STEP 4: GRAPHICS (OPTIONAL)
        // ===================================
        let graphics: GraphicsOutput | null = null;

        if (graphicsStyleId) {
            const graphicsStartTime = Date.now();

            await updateGenerationStatus(blogId, {
                status: 'GENERATING_GRAPHICS',
                currentStep: 'Creating visual assets...',
                graphicsStartedAt: new Date(graphicsStartTime),
            });

            try {
                const rawGraphics = await graphicsAgent({
                    topic,
                    research,
                    content,
                    blogId,
                    styleId: graphicsStyleId,
                });
                graphics = stripNullsDeep(rawGraphics);

                const graphicsEndTime = Date.now();
                const graphicsDurationMs = graphicsEndTime - graphicsStartTime;

                await prisma.blogGeneration.update({
                    where: { blogId },
                    data: {
                        graphicsComplete: true,
                        graphicsData: graphics as unknown as Prisma.InputJsonValue,
                        graphicsStartedAt: new Date(graphicsStartTime),
                        graphicsCompletedAt: new Date(graphicsEndTime),
                        graphicsDurationMs,
                        updatedAt: new Date(),
                    },
                });

                console.log('Graphics generation completed successfully');
            } catch (graphicsError) {
                // Log graphics error but don't fail entire workflow
                console.error('Graphics generation failed (non-fatal):', graphicsError);

                await prisma.blogGeneration.update({
                    where: { blogId },
                    data: {
                        graphicsComplete: false,
                        graphicsData: {
                            error: graphicsError instanceof Error ? graphicsError.message : 'Graphics generation failed',
                        } as unknown as Prisma.InputJsonValue,
                        updatedAt: new Date(),
                    },
                });
            }
        }

        // ===================================
        // STEP 5: FINALIZE
        // ===================================

        // Inject generated graphic into the rich editor content (but keep writer markdown unchanged)
        let markdownForRich = content.content;
        if (graphics && graphics.assets.length > 0) {
            const primaryAsset = graphics.assets[0];
            if (primaryAsset?.url) {
                const altText = primaryAsset.alt || `Infographic summarizing ${topic}`;
                markdownForRich = `![${altText}](${primaryAsset.url})\n\n${content.content}`;
            }
        }

        // Convert markdown to TipTap JSON for rich text display
        const richContent = markdownToTiptapJson(markdownForRich);
        const htmlCache = generateRichHtml(richContent);

        // Update blog record with final content and graphics
        await prisma.blog.update({
            where: { id: blogId },
            data: {
                title: content.title,
                slug: generateSlug(content.title, blogId),
                content: content.content, // Keep original markdown for reference
                contentType: 'rich', // Always use rich format for generated content
                richContent: richContent as unknown as Prisma.JsonValue,
                htmlCache: htmlCache,
                excerpt: content.excerpt,
                graphics: graphics ? (graphics as unknown as Prisma.InputJsonValue) : null,
                status: 'DRAFT',
                updatedAt: new Date(),
            },
        });

        // Create source records
        if (content.citations.length > 0) {
            await prisma.source.createMany({
                data: content.citations.map(citation => ({
                    blogId,
                    url: citation.url,
                    title: citation.title,
                })),
            });
        }

        // Calculate total duration
        const workflowEndTime = Date.now();
        const totalDurationMs = workflowEndTime - workflowStartTime;

        // Mark generation as completed
        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                status: 'COMPLETED',
                currentStep: 'Blog generation complete',
                totalDurationMs,
                completedAt: new Date(workflowEndTime),
                updatedAt: new Date(),
            },
        });

    } catch (error) {
        console.error('Generation workflow failed:', error);

        // Log error to database
        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
                currentStep: 'Generation failed',
                retryCount: { increment: 1 },
                updatedAt: new Date(),
            },
        });

        throw error;
    }
}

/**
 * Helper to update generation status
 */
async function updateGenerationStatus(
    blogId: string,
    data: {
        status: 'PENDING' | 'SEARCHING' | 'RESEARCHING' | 'WRITING' | 'GENERATING_GRAPHICS' | 'COMPLETED' | 'FAILED';
        currentStep: string;
        searchStartedAt?: Date;
        researchStartedAt?: Date;
        writerStartedAt?: Date;
        graphicsStartedAt?: Date;
    }
): Promise<void> {
    await prisma.blogGeneration.update({
        where: { blogId },
        data: {
            ...data,
            updatedAt: new Date(),
        },
    });
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string, blogId: string): string {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Add short ID suffix to ensure uniqueness
    const suffix = blogId.substring(0, 8);
    return `${baseSlug}-${suffix}`;
}
