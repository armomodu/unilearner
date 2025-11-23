import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { searchAgent } from '@/lib/agents/search-agent';
import { researchAgent } from '@/lib/agents/research-agent';
import { writerAgent } from '@/lib/agents/writer-agent';

/**
 * Main blog generation workflow
 * Runs asynchronously in background, updates database at each step
 * 
 * @param blogId - The blog ID to generate content for
 * @param topic - The blog topic
 */
export async function runGenerationWorkflow(
    blogId: string,
    topic: string
): Promise<void> {
    try {
        // ===================================
        // STEP 1: SEARCH
        // ===================================
        await updateGenerationStatus(blogId, {
            status: 'SEARCHING',
            currentStep: 'Searching web sources...',
        });

        const searchResults = await searchAgent(topic);

        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                searchComplete: true,
                searchData: searchResults as unknown as Prisma.InputJsonValue,
                updatedAt: new Date(),
            },
        });

        // ===================================
        // STEP 2: RESEARCH
        // ===================================
        await updateGenerationStatus(blogId, {
            status: 'RESEARCHING',
            currentStep: 'Analyzing sources and extracting insights...',
        });

        const research = await researchAgent(topic, searchResults);

        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                researchComplete: true,
                researchData: research as unknown as Prisma.InputJsonValue,
                updatedAt: new Date(),
            },
        });

        // ===================================
        // STEP 3: WRITE
        // ===================================
        await updateGenerationStatus(blogId, {
            status: 'WRITING',
            currentStep: 'Generating blog content...',
        });

        const content = await writerAgent(topic, searchResults, research);

        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                writerComplete: true,
                updatedAt: new Date(),
            },
        });

        // ===================================
        // STEP 4: FINALIZE
        // ===================================

        // Update blog record with final content
        await prisma.blog.update({
            where: { id: blogId },
            data: {
                title: content.title,
                slug: generateSlug(content.title, blogId),
                content: content.content,
                excerpt: content.excerpt,
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

        // Mark generation as completed
        await prisma.blogGeneration.update({
            where: { blogId },
            data: {
                status: 'COMPLETED',
                currentStep: 'Blog generation complete',
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
        status: 'PENDING' | 'SEARCHING' | 'RESEARCHING' | 'WRITING' | 'COMPLETED' | 'FAILED';
        currentStep: string;
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
