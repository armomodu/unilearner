/**
 * Content Parser - Utilities for parsing markdown content from WriterOutput
 * Extracts structured information for executive infographic generation
 */

export interface ParsedSection {
    level: number; // 1 for #, 2 for ##, etc.
    title: string;
    content: string;
    keyStatements: string[];
    statistics: string[];
}

export interface ParsedContent {
    sections: ParsedSection[];
    emphasisedTexts: string[];
    statistics: string[];
    totalWordCount: number;
    sectionCount: number;
}

/**
 * Extract sections from markdown content
 */
export function extractSections(markdown: string): ParsedSection[] {
    const sections: ParsedSection[] = [];
    const lines = markdown.split('\n');

    let currentSection: ParsedSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
        // Match markdown headers (# Header, ## Header, etc.)
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

        if (headerMatch) {
            // Save previous section if exists
            if (currentSection) {
                currentSection.content = currentContent.join('\n').trim();
                currentSection.keyStatements = extractKeyStatements(currentSection.content);
                currentSection.statistics = extractStatistics(currentSection.content);
                sections.push(currentSection);
            }

            // Start new section
            currentSection = {
                level: headerMatch[1].length,
                title: headerMatch[2].trim(),
                content: '',
                keyStatements: [],
                statistics: [],
            };
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(line);
        }
    }

    // Add final section
    if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        currentSection.keyStatements = extractKeyStatements(currentSection.content);
        currentSection.statistics = extractStatistics(currentSection.content);
        sections.push(currentSection);
    }

    return sections;
}

/**
 * Extract key statements from content (first sentences, topic sentences)
 */
export function extractKeyStatements(content: string): string[] {
    const statements: string[] = [];

    // Split into paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

    for (const paragraph of paragraphs) {
        // Skip very short paragraphs (likely not substantive)
        if (paragraph.length < 50) continue;

        // Get first sentence (simple approach - split on . ! ?)
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);

        if (sentences.length > 0) {
            const firstSentence = sentences[0].trim();
            // Only include if it's substantive (not just a number or very short)
            if (firstSentence.length > 20 && firstSentence.split(/\s+/).length > 4) {
                statements.push(firstSentence);
            }
        }
    }

    return statements.slice(0, 5); // Limit to 5 key statements per section
}

/**
 * Extract statistics and numerical data from content
 */
export function extractStatistics(content: string): string[] {
    const statistics: string[] = [];

    // Pattern for common statistical formats:
    // - "X%"
    // - "X billion/million/thousand"
    // - "$X"
    // - "X times"
    // - "X in Y"
    const statPatterns = [
        /\b\d+(?:\.\d+)?%/g,                    // Percentages
        /\$\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:billion|million|thousand|B|M|K))?/gi, // Money
        /\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:billion|million|thousand|times)\b/gi,    // Large numbers
        /\b\d+(?:\.\d+)?\s*in\s*\d+(?:\.\d+)?/gi, // Ratios
        /\b\d+(?:,\d{3})*(?:\.\d+)?x\b/gi,      // Multipliers
    ];

    for (const pattern of statPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            statistics.push(...matches);
        }
    }

    // Get surrounding context for each statistic (10 words before and after)
    const uniqueStats = Array.from(new Set(statistics));
    const statsWithContext: string[] = [];

    for (const stat of uniqueStats) {
        const index = content.indexOf(stat);
        if (index !== -1) {
            const words = content.split(/\s+/);
            const statPosition = content.substring(0, index).split(/\s+/).length;
            const contextStart = Math.max(0, statPosition - 5);
            const contextEnd = Math.min(words.length, statPosition + 6);
            const context = words.slice(contextStart, contextEnd).join(' ');
            statsWithContext.push(context);
        }
    }

    return statsWithContext.slice(0, 10); // Limit to 10 statistics
}

/**
 * Extract emphasized text (bold, italic)
 */
export function extractEmphasis(markdown: string): string[] {
    const emphasized: string[] = [];

    // Match **bold** text
    const boldMatches = markdown.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
        emphasized.push(...boldMatches.map(m => m.replace(/\*\*/g, '').trim()));
    }

    // Match *italic* text (but not part of **bold**)
    const italicMatches = markdown.match(/(?<!\*)\*([^*]+)\*(?!\*)/g);
    if (italicMatches) {
        emphasized.push(...italicMatches.map(m => m.replace(/\*/g, '').trim()));
    }

    // Remove duplicates and filter out very short emphasis
    return Array.from(new Set(emphasized))
        .filter(text => text.length > 5)
        .slice(0, 15);
}

/**
 * Count words in markdown content (excluding markdown syntax)
 */
export function countWords(markdown: string): number {
    // Remove markdown syntax
    const cleanText = markdown
        .replace(/#+\s/g, '')           // Remove headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1')     // Remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
        .replace(/>\s/g, '')            // Remove blockquotes
        .replace(/`([^`]+)`/g, '$1')    // Remove inline code
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .trim();

    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

/**
 * Parse complete markdown content into structured data
 */
export function parseMarkdownContent(markdown: string): ParsedContent {
    const sections = extractSections(markdown);
    const emphasisedTexts = extractEmphasis(markdown);

    // Collect all statistics from all sections
    const allStatistics = sections.flatMap(s => s.statistics);

    return {
        sections,
        emphasisedTexts,
        statistics: Array.from(new Set(allStatistics)),
        totalWordCount: countWords(markdown),
        sectionCount: sections.filter(s => s.level === 2).length, // Count ## level sections
    };
}

/**
 * Extract main topic/concepts from content (for icon mapping)
 */
export function extractMainConcepts(content: string): string[] {
    const concepts: string[] = [];

    // Common business/tech concepts to look for
    const conceptKeywords = [
        'growth', 'innovation', 'security', 'data', 'strategy', 'transformation',
        'automation', 'efficiency', 'scale', 'integration', 'platform', 'ecosystem',
        'analytics', 'intelligence', 'optimization', 'collaboration', 'governance',
        'compliance', 'risk', 'performance', 'customer', 'market', 'revenue',
        'investment', 'digital', 'cloud', 'AI', 'machine learning', 'blockchain'
    ];

    const lowerContent = content.toLowerCase();

    for (const keyword of conceptKeywords) {
        // Check if concept appears multiple times (indicating importance)
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches && matches.length >= 2) {
            concepts.push(keyword);
        }
    }

    return concepts.slice(0, 8); // Return top 8 concepts
}
