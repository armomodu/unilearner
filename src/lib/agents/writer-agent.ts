import Anthropic from '@anthropic-ai/sdk';
import { SearchResult } from './search-agent';
import { ResearchOutput } from './research-agent';

export interface WriterOutput {
    title: string;
    content: string;
    excerpt: string;
    citations: {
        title: string;
        url: string;
    }[];
}

/**
 * Writer Agent - Generates blog content using Claude Sonnet 4.5
 * 
 * @param topic - The blog topic
 * @param searchResults - Original search results for citations
 * @param research - Synthesized research from research agent
 * @returns Complete blog post with citations
 * @throws Error if Claude API fails
 */
export async function writerAgent(
    topic: string,
    searchResults: SearchResult[],
    research: ResearchOutput
): Promise<WriterOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const anthropic = new Anthropic({
        apiKey,
    });

    const prompt = buildWriterPrompt(topic, searchResults, research);

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-5', // Latest Claude Sonnet 4.5 model
            max_tokens: 8000,
            temperature: 1,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = message.content[0];
        if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude');
        }

        // Extract JSON from response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse JSON from Claude response');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Writer agent error:', error);
        throw new Error(`Writer agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function buildWriterPrompt(
    topic: string,
    searchResults: SearchResult[],
    research: ResearchOutput
): string {
    return `Write a comprehensive, engaging blog post about "${topic}".

RESEARCH INSIGHTS:
${JSON.stringify(research, null, 2)}

AVAILABLE SOURCES FOR CITATIONS:
${searchResults.map((r, i) => `[${i + 1}] ${r.title} - ${r.url}`).join('\n')}

REQUIREMENTS:
1. Write in an engaging, conversational yet professional style
2. Follow the provided outline structure from research
3. Incorporate specific facts, statistics, and insights
4. Use natural inline citations in format: [Source Title](url)
5. Create an attention-grabbing introduction
6. Provide actionable takeaways in the conclusion
7. Target length: 1200-1500 words
8. Use Markdown formatting:
   - # for title (H1)
   - ## for section headers (H2)
   - ### for subsections (H3)
   - **bold** for emphasis
   - *italic* for subtle emphasis
   - > for blockquotes
   - - for bullet lists
   - 1. for numbered lists
9. Optimize for SEO with natural keyword usage
10. Ensure content is original synthesis, not just summarization

OUTPUT FORMAT (JSON only, no markdown code blocks or other text):
{
  "title": "Compelling, SEO-optimized blog title",
  "content": "Full markdown content with inline citations using [Source Title](url) format",
  "excerpt": "Engaging 2-3 sentence summary for preview and SEO meta description",
  "citations": [
    {"title": "Source 1 Title", "url": "https://..."},
    {"title": "Source 2 Title", "url": "https://..."}
  ]
}

CRITICAL: Return ONLY the JSON object. Do not include any text before or after the JSON.`;
}
