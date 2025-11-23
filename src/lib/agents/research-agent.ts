import { GoogleGenAI } from '@google/genai';
import { SearchResult } from './search-agent';

export interface ResearchOutput {
    insights: string[];
    keyPoints: string[];
    outline: {
        section: string;
        points: string[];
    }[];
    themes: string[];
}

/**
 * Research Agent - Analyzes search results using Gemini 3 Pro
 * 
 * @param topic - The blog topic
 * @param searchResults - Results from search agent
 * @returns Structured research output with insights and outline
 * @throws Error if Gemini API fails
 */
export async function researchAgent(
    topic: string,
    searchResults: SearchResult[]
): Promise<ResearchOutput> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildResearchPrompt(topic, searchResults);
    
    try {
        console.log('Using Gemini 3 Pro for research analysis');
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinking_level: 'high',
                response_mime_type: 'application/json'
            }
        });

        const text = response.text;
        console.log('Gemini 3 Pro research completed successfully');
        
        // Parse JSON response
        try {
            return JSON.parse(text);
        } catch (parseError) {
            // Fallback: try to extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse JSON from Gemini 3 response');
            }
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('Gemini 3 research agent error:', error);
        throw new Error(`Research agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function buildResearchPrompt(topic: string, results: SearchResult[]): string {
    return `Analyze the following search results about "${topic}" and provide structured research output.

SEARCH RESULTS:
${results.map((r, i) => `
Source ${i + 1}: ${r.title}
URL: ${r.url}
Relevance Score: ${r.score}
Content: ${r.content.substring(0, 1000)}...
---
`).join('\n')}

TASK:
Extract and synthesize information to create:
1. Key insights (3-5 unique angles or perspectives)
2. Important facts and statistics
3. Main themes across sources
4. Detailed content outline with sections and key points

OUTPUT FORMAT (JSON only, no other text):
{
  "insights": [
    "Unique insight or angle 1",
    "Unique insight or angle 2",
    "Unique insight or angle 3"
  ],
  "keyPoints": [
    "Important fact or statistic 1",
    "Important fact or statistic 2"
  ],
  "themes": [
    "Main theme 1",
    "Main theme 2"
  ],
  "outline": [
    {
      "section": "Introduction",
      "points": ["Hook point", "Context point"]
    },
    {
      "section": "Main Section 1 Title",
      "points": ["Key point 1", "Key point 2"]
    },
    {
      "section": "Conclusion",
      "points": ["Summary point", "Call to action"]
    }
  ]
}`;
}
