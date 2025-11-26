import Anthropic from '@anthropic-ai/sdk';
import { SearchResult } from './search-agent';
import { ResearchOutput } from './research-agent';
import { resolveWritingStyle, WritingStyleRecord } from './writer-styles';

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
    research: ResearchOutput,
    styleId?: string
): Promise<WriterOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const anthropic = new Anthropic({
        apiKey,
    });

    const style = await resolveWritingStyle(styleId);
    const prompt = buildWriterPrompt(topic, searchResults, research, style);

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-5', // Latest Claude Sonnet 4.5 model
            max_tokens: 8000,
            temperature: 0.6,
            system: style.systemPrompt,
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
    research: ResearchOutput,
    style: WritingStyleRecord
): string {
    return `You must strictly adhere to the provided style instructions and never deviate from them.

STYLE SNAPSHOT:
${style.microPrompt || 'Follow the master style guidance verbatim.'}

TOPIC:
${topic}

RESEARCH INSIGHTS:
${JSON.stringify(research, null, 2)}

AVAILABLE SOURCES FOR CITATIONS:
${searchResults.map((r, i) => `[${i + 1}] ${r.title} - ${r.url}`).join('\n')}

REQUIREMENTS:
1. Follow the style snapshot above: connected paragraphs, strategic tone, and absolutely no usage of the m dash.
2. Keep bullets and numbered lists to a minimum. Only use them when clarity demands it; otherwise rely on paragraphs.
3. Use the outline, insights, and data from RESEARCH INSIGHTS to shape the narrative arc (introduction, analysis, implications, conclusion).
4. Incorporate specific facts, statistics, and insights from the research and cite them inline using [Source Title](url).
5. Craft an executive-level introduction that frames the topic, then analyze key forces, and end with forward-looking implications or recommendations.
6. Maintain a 5-8 minute read length with disciplined paragraphing, rich transitions, and zero fluff.
7. Markdown formatting is mandatory: insert a blank line between every paragraph, use **bold** for key emphasis, *italic* for nuance, > for the occasional pull quote, and [Anchor Text](https://source) for links. Use # for the title, ## for major sections, and only introduce lists when compressing data-driven insights.
8. Optimize for SEO with natural keyword usage while keeping the tone human and analytical.
9. Ensure content is original synthesis, not mere summarization, and never invent citations.

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
