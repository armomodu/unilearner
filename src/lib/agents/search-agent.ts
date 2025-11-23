import { tavily } from '@tavily/core';

export interface SearchResult {
    url: string;
    title: string;
    content: string;
    score: number;
}

/**
 * Search Agent - Uses Tavily API to find relevant web sources
 * 
 * @param topic - The blog topic to search for
 * @returns Array of search results with content
 * @throws Error if Tavily API fails
 */
export async function searchAgent(topic: string): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        throw new Error('TAVILY_API_KEY is not set');
    }

    const tvly = tavily({ apiKey });

    try {
        const response = await tvly.search(topic, {
            searchDepth: 'advanced',
            maxResults: 10,
            includeAnswer: false,
            includeRawContent: 'markdown',
        });

        return response.results.map(result => ({
            url: result.url,
            title: result.title,
            content: result.rawContent || result.content,
            score: result.score,
        }));
    } catch (error) {
        console.error('Search agent error:', error);
        throw new Error(`Search agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
