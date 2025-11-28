/**
 * Executive Infographic Generator
 * Produces C-suite, board-level visuals with consulting-grade clarity
 * Implements BCG/McKinsey/Bain design quality standards
 */

import { WriterOutput } from './writer-agent';
import {
    parseMarkdownContent,
    extractMainConcepts,
    type ParsedContent,
} from './content-parser';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type LayoutArchetype =
    | 'Strategic Convergence Map'
    | 'Executive Value Matrix'
    | 'Layered Strategy Stack'
    | 'Enterprise Blueprint'
    | 'Four Strategic Pillars'
    | 'Market Evolution Timeline'
    | 'Transformation Flywheel'
    | 'Hexagonal Systems Grid'
    | 'Target-State Architecture Blueprint'
    | 'Strategic Tradeoffs Map'
    | 'Stakeholder Constellation Map'
    | 'Twin-Panel Executive Slide';

export type ThemeType = 'dark' | 'light';

export interface InfographicZone {
    iconDescription: string; // Abstract executive icon description
    headline: string; // ≤7 words
    microInsight: string; // ≤12 words
}

export interface ColorPalette {
    background: string;
    accents: string[];
    iconColor: string;
    textPrimary: string;
    textSecondary: string;
}

export interface ExecutiveInfographicConfig {
    theme: ThemeType;
    archetype: LayoutArchetype;
    zones: InfographicZone[];
    mainTitle: string; // ≤14 words
    subtitle: string; // ≤16 words
    palette: ColorPalette;
}

export interface ExecutivePromptOutput {
    analysisMetadata: {
        detectedTheme: ThemeType;
        selectedArchetype: LayoutArchetype;
        zoneCount: number;
        confidenceScore: number;
        extractedConcepts: string[];
    };
    prompt: string;
}

// ============================================================================
// THEME DETECTION
// ============================================================================

const DARK_THEME_SIGNALS = [
    'technical',
    'security',
    'blockchain',
    'infrastructure',
    'rails',
    'architecture',
    'API',
    'backend',
    'database',
    'encryption',
    'protocol',
    'system design',
    'DevOps',
    'network',
    'microservices',
    'distributed',
    'cryptography',
    'authentication',
    'authorization',
    'middleware',
    'framework',
    'engineering',
];

const LIGHT_THEME_SIGNALS = [
    'strategy',
    'market',
    'trends',
    'transformation',
    'regulatory',
    'economic',
    'roadmap',
    'growth',
    'leadership',
    'innovation',
    'customer',
    'experience',
    'brand',
    'engagement',
    'business model',
    'competitive',
    'opportunity',
    'vision',
    'future',
    'stakeholder',
];

export function analyzeContentTheme(content: string): ThemeType {
    const lowerContent = content.toLowerCase();

    let darkScore = 0;
    let lightScore = 0;

    // Count dark theme signals
    for (const signal of DARK_THEME_SIGNALS) {
        const regex = new RegExp(`\\b${signal}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
            darkScore += matches.length;
        }
    }

    // Count light theme signals
    for (const signal of LIGHT_THEME_SIGNALS) {
        const regex = new RegExp(`\\b${signal}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
            lightScore += matches.length;
        }
    }

    // Default to dark if tie or no strong signals
    return lightScore > darkScore ? 'light' : 'dark';
}

// ============================================================================
// ARCHETYPE SELECTION
// ============================================================================

const ARCHETYPE_SIGNALS: Record<LayoutArchetype, string[]> = {
    'Strategic Convergence Map': [
        'converging',
        'convergence',
        'multiple forces',
        'coming together',
        'intersection',
        'central',
        'unified',
    ],
    'Executive Value Matrix': [
        'four',
        'quadrant',
        'compare',
        'versus',
        'vs',
        '2x2',
        'matrix',
        'dimensions',
    ],
    'Layered Strategy Stack': [
        'layers',
        'architecture',
        'stack',
        'levels',
        'tier',
        'foundation',
        'hierarchy',
        'build on',
    ],
    'Enterprise Blueprint': [
        'system',
        'flow',
        'rails',
        'pipeline',
        'process',
        'workflow',
        'horizontal',
        'end-to-end',
    ],
    'Four Strategic Pillars': [
        'four pillars',
        'four key',
        'four main',
        'four areas',
        'four categories',
        'foundation',
    ],
    'Market Evolution Timeline': [
        'evolution',
        'phases',
        'adoption',
        'over time',
        'history',
        'timeline',
        'stages',
        'progression',
    ],
    'Transformation Flywheel': [
        'cycle',
        'compound',
        'reinforce',
        'loop',
        'momentum',
        'circular',
        'continuous',
        'iterative',
    ],
    'Hexagonal Systems Grid': [
        'six',
        'multiple components',
        'interconnected',
        'ecosystem',
        'network',
        'integrated',
    ],
    'Target-State Architecture Blueprint': [
        'future state',
        'target',
        'vision',
        'end goal',
        'architecture',
        'design',
        'blueprint',
    ],
    'Strategic Tradeoffs Map': [
        'tradeoff',
        'trade-off',
        'balance',
        'opposing',
        'tension',
        'versus',
        'compromise',
    ],
    'Stakeholder Constellation Map': [
        'stakeholder',
        'ecosystem',
        'roles',
        'participants',
        'actors',
        'network',
        'relationships',
    ],
    'Twin-Panel Executive Slide': [
        'before and after',
        'traditional vs',
        'old vs new',
        'contrast',
        'comparison',
        'transformation from',
    ],
};

export function selectLayoutArchetype(
    content: string,
    parsedContent: ParsedContent
): LayoutArchetype {
    const lowerContent = content.toLowerCase();
    const archetypeScores: Record<LayoutArchetype, number> = {} as Record<
        LayoutArchetype,
        number
    >;

    // Score each archetype based on signal presence
    for (const [archetype, signals] of Object.entries(ARCHETYPE_SIGNALS)) {
        let score = 0;
        for (const signal of signals) {
            const regex = new RegExp(`\\b${signal}\\b`, 'gi');
            const matches = lowerContent.match(regex);
            if (matches) {
                score += matches.length;
            }
        }
        archetypeScores[archetype as LayoutArchetype] = score;
    }

    // Find archetype with highest score
    let maxScore = 0;
    let selectedArchetype: LayoutArchetype = 'Strategic Convergence Map';

    for (const [archetype, score] of Object.entries(archetypeScores)) {
        if (score > maxScore) {
            maxScore = score;
            selectedArchetype = archetype as LayoutArchetype;
        }
    }

    // If no strong signal match, use heuristics based on section count
    if (maxScore === 0) {
        const sectionCount = parsedContent.sectionCount;

        if (sectionCount === 4) {
            return 'Four Strategic Pillars';
        } else if (sectionCount >= 6) {
            return 'Hexagonal Systems Grid';
        } else if (sectionCount === 3) {
            return 'Layered Strategy Stack';
        }
    }

    return selectedArchetype;
}

// ============================================================================
// ICON GENERATION
// ============================================================================

const ICON_MAPPING: Record<string, string> = {
    growth: 'ascending geometric bars with subtle gradient',
    security: 'interlocking shield layers, blueprint style',
    data: 'connected node network, circuit-like',
    strategy: 'chess piece silhouette with strategic grid',
    innovation: 'lightbulb formed by connected dots',
    automation: 'gear system with flowing connections',
    efficiency: 'streamlined arrow path with optimization nodes',
    scale: 'expanding concentric hexagons',
    integration: 'puzzle pieces forming unified shape',
    platform: 'layered foundation with connecting bridges',
    ecosystem: 'interconnected orbital system',
    analytics: 'bar chart abstracted into geometric form',
    intelligence: 'neural network pattern',
    optimization: 'curved arrow finding shortest path',
    collaboration: 'overlapping circles forming venn diagram',
    governance: 'balanced scales with geometric weights',
    compliance: 'checkmark within structured grid',
    risk: 'warning triangle with internal matrices',
    performance: 'ascending line graph abstracted',
    customer: 'centered human silhouette with radiating connections',
    market: 'supply-demand curve abstracted',
    revenue: 'ascending staircase with dollar symbol',
    investment: 'growth arrow emerging from foundation',
    digital: 'binary code forming abstract shape',
    cloud: 'layered server stack with connectivity',
    AI: 'neural network node constellation',
    'machine learning': 'learning curve with data points',
    blockchain: 'linked chain blocks with cryptographic pattern',
    transformation: 'metamorphosis arrow with stages',
};

export function generateIconDescription(
    concept: string,
    theme: ThemeType
): string {
    const iconStyle =
        theme === 'dark'
            ? 'metallic gold outline, geometric, blueprint aesthetic'
            : 'navy steel-blue line, minimal, clean aesthetic';

    const baseIcon =
        ICON_MAPPING[concept.toLowerCase()] || 'abstract geometric form with strategic symbolism';

    return `${baseIcon}, rendered in ${iconStyle}`;
}

// ============================================================================
// STRATEGIC INSIGHT EXTRACTION
// ============================================================================

export function extractStrategicInsights(
    writerContent: WriterOutput,
    parsedContent: ParsedContent
): string[] {
    const insights: string[] = [];

    // Priority 1: Use emphasized text (bold) as these are key points
    for (const emphasis of parsedContent.emphasisedTexts.slice(0, 3)) {
        if (emphasis.length > 20 && emphasis.length < 150) {
            insights.push(emphasis);
        }
    }

    // Priority 2: Use section titles (## headers) as insights
    for (const section of parsedContent.sections) {
        if (section.level === 2 && insights.length < 6) {
            insights.push(section.title);
        }
    }

    // Priority 3: Use key statements from sections
    for (const section of parsedContent.sections) {
        if (insights.length < 6) {
            for (const statement of section.keyStatements.slice(0, 1)) {
                if (insights.length < 6) {
                    insights.push(statement);
                }
            }
        }
    }

    return insights.slice(0, 6);
}

// ============================================================================
// ZONE GENERATION
// ============================================================================

export function enforceHeadlineLimit(text: string, maxWords: number = 7): string {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length <= maxWords) return text;

    // Intelligently truncate - try to end at natural break
    let truncated = words.slice(0, maxWords).join(' ');

    // Remove trailing punctuation/incomplete words
    truncated = truncated.replace(/[,;:]$/, '').trim();

    return truncated;
}

export function enforceMicroInsightLimit(text: string, maxWords: number = 12): string {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length <= maxWords) return text;

    // Intelligently truncate maintaining sentence structure
    let truncated = words.slice(0, maxWords).join(' ');

    // Try to end at a natural break (period, comma, semicolon)
    const lastPunctuation = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf(','),
        truncated.lastIndexOf(';')
    );

    if (lastPunctuation > truncated.length * 0.6) {
        truncated = truncated.substring(0, lastPunctuation);
    }

    return truncated.trim();
}

export function generateZones(
    insights: string[],
    concepts: string[],
    theme: ThemeType
): InfographicZone[] {
    const zones: InfographicZone[] = [];

    // Generate a zone for each insight
    for (let i = 0; i < insights.length && i < 6; i++) {
        const insight = insights[i];
        const concept = concepts[i] || concepts[0] || 'strategy';

        zones.push({
            iconDescription: generateIconDescription(concept, theme),
            headline: enforceHeadlineLimit(insight),
            microInsight: enforceMicroInsightLimit(insight),
        });
    }

    // Ensure minimum of 4 zones
    while (zones.length < 4 && insights.length > 0) {
        const fallbackInsight = insights[zones.length % insights.length];
        const fallbackConcept = concepts[zones.length % concepts.length] || 'innovation';

        zones.push({
            iconDescription: generateIconDescription(fallbackConcept, theme),
            headline: enforceHeadlineLimit(fallbackInsight),
            microInsight: enforceMicroInsightLimit(fallbackInsight),
        });
    }

    return zones.slice(0, 6); // Maximum 6 zones
}

// ============================================================================
// COLOR PALETTE GENERATION
// ============================================================================

export function generateColorPalette(theme: ThemeType): ColorPalette {
    if (theme === 'dark') {
        return {
            background: 'deep navy (#0A1929) to charcoal (#1E2A3A) gradient',
            accents: ['metallic gold (#D4AF37)', 'champagne (#F7E7CE)', 'platinum (#E5E4E2)', 'teal accent (#008B8B)'],
            iconColor: 'metallic gold (#D4AF37) outline, 2px stroke',
            textPrimary: 'white (#FFFFFF)',
            textSecondary: 'light gray (#B0B8C1)',
        };
    } else {
        return {
            background: 'white (#FFFFFF) to pearl (#F8F9FA) gradient',
            accents: ['navy (#1E3A5F)', 'gold accent (#B8860B)', 'steel blue (#4682B4)'],
            iconColor: 'navy (#1E3A5F) line, 2px stroke',
            textPrimary: 'charcoal (#2C3E50)',
            textSecondary: 'medium gray (#6C757D)',
        };
    }
}

// ============================================================================
// FINAL PROMPT GENERATION
// ============================================================================

export function buildFinalPrompt(config: ExecutiveInfographicConfig): string {
    const { theme, archetype, zones, mainTitle, subtitle, palette } = config;

    // Build zone descriptions
    const zoneDescriptions = zones
        .map((zone, index) => {
            return `
ZONE ${index + 1}:
Icon: ${zone.iconDescription}
Headline: "${zone.headline}"
Micro-Insight: "${zone.microInsight}"`;
        })
        .join('\n');

    return `# EXECUTIVE INFOGRAPHIC GENERATION

## ROLE
You are an Executive Infographic Generator producing C-suite, board-level visuals with consulting-grade clarity, structure, and aesthetics matching BCG, McKinsey, Bain, Deloitte design standards.

## THEME: ${theme.toUpperCase()}
${theme === 'dark' ? 'Technical, security-focused, infrastructure content. Use blueprint geometry and network lines.' : 'Market trends, strategy design, transformation content. Use faint grids and minimal geometry.'}

## LAYOUT ARCHETYPE: ${archetype}

## VISUAL SPECIFICATIONS

### Color Palette
- Background: ${palette.background}
- Accent Colors: ${palette.accents.join(', ')}
- Icon Style: ${palette.iconColor}
- Text Primary: ${palette.textPrimary}
- Text Secondary: ${palette.textSecondary}

### Typography
- Main Title Font: 60-72px, bold, sans-serif (Helvetica/Arial)
- Subtitle Font: 28-36px, regular weight
- Zone Headlines: 24-32px, semi-bold
- Micro-Insights: 16-20px, regular weight

### Background Elements
${theme === 'dark' ? '- Subtle blueprint grid lines\n- Digital rail patterns\n- Network connection nodes (subtle, low opacity)' : '- Faint guide grid (8px system)\n- Minimal geometric accents\n- Clean whitespace'}

## CONTENT STRUCTURE

### Main Title (Top Center)
"${mainTitle}"

### Subtitle (Below Title)
"${subtitle}"

### Zones (${zones.length} total - arranged per ${archetype} layout)
${zoneDescriptions}

## COMPOSITION RULES

1. **Layout**: Follow ${archetype} archetype precisely
   ${getArchetypeLayoutGuidance(archetype)}

2. **Icons**: Abstract, executive-grade, NO cartoon or clipart styles

3. **Text Hierarchy**:
   - Title dominates (largest, boldest)
   - Subtitles provide context
   - Zone headlines are scannable
   - Micro-insights add depth

4. **Whitespace**: Generous spacing, avoid clutter, professional breathing room

5. **Alignment**: Consistent grid system, precise alignment throughout

6. **Contrast**: Meet WCAG AA standards (4.5:1 text, 3:1 large text)

## PROHIBITED ELEMENTS
- NO cartoon icons
- NO playful colors or neon
- NO social media design patterns
- NO clipart or comic forms
- NO emoji or casual language

## OUTPUT REQUIREMENTS
- Resolution: 1920x1080px minimum (16:9)
- Format: PNG with high quality
- All text must be crisp, readable, professionally formatted
- Maintain executive, consulting-grade aesthetic throughout

Generate the infographic now.`;
}

function getArchetypeLayoutGuidance(archetype: LayoutArchetype): string {
    const guidance: Record<LayoutArchetype, string> = {
        'Strategic Convergence Map':
            '   Central engine/core in middle, 4 zones arranged diagonally around it',
        'Executive Value Matrix': '   2x2 grid layout with clear quadrants, axis labels',
        'Layered Strategy Stack': '   Horizontal layers stacked vertically (top, middle, bottom)',
        'Enterprise Blueprint':
            '   Horizontal flow from left to right showing system components',
        'Four Strategic Pillars': '   4 vertical columns of equal width, aligned baselines',
        'Market Evolution Timeline':
            '   Horizontal timeline left to right with phase markers',
        'Transformation Flywheel': '   Circular arrangement showing continuous cycle',
        'Hexagonal Systems Grid': '   6-7 hexagons in honeycomb pattern',
        'Target-State Architecture Blueprint':
            '   Blueprint-style architectural diagram showing end state',
        'Strategic Tradeoffs Map':
            '   Opposing forces on left/right with balance point in center',
        'Stakeholder Constellation Map':
            '   Central entity with stakeholders orbiting around it',
        'Twin-Panel Executive Slide': '   Left panel (before) vs right panel (after)',
    };

    return guidance[archetype] || '   Balanced, professional layout';
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export function generateExecutiveInfographicPrompt(
    writerContent: WriterOutput,
    topic: string
): ExecutivePromptOutput {
    // Parse the markdown content
    const parsedContent = parseMarkdownContent(writerContent.content);

    // Detect theme (dark vs light)
    const theme = analyzeContentTheme(writerContent.content);

    // Select layout archetype
    const archetype = selectLayoutArchetype(writerContent.content, parsedContent);

    // Extract strategic insights
    const insights = extractStrategicInsights(writerContent, parsedContent);

    // Extract main concepts for icon mapping
    const concepts = extractMainConcepts(writerContent.content);

    // Generate zones
    const zones = generateZones(insights, concepts, theme);

    // Generate color palette
    const palette = generateColorPalette(theme);

    // Prepare titles
    const mainTitle = enforceHeadlineLimit(writerContent.title, 14);
    const subtitle = enforceHeadlineLimit(writerContent.excerpt, 16);

    // Build configuration
    const config: ExecutiveInfographicConfig = {
        theme,
        archetype,
        zones,
        mainTitle,
        subtitle,
        palette,
    };

    // Build final prompt
    const prompt = buildFinalPrompt(config);

    // Calculate confidence score (0-100)
    const confidenceScore = calculateConfidenceScore(parsedContent, insights, zones);

    return {
        analysisMetadata: {
            detectedTheme: theme,
            selectedArchetype: archetype,
            zoneCount: zones.length,
            confidenceScore,
            extractedConcepts: concepts,
        },
        prompt,
    };
}

function calculateConfidenceScore(
    parsedContent: ParsedContent,
    insights: string[],
    zones: InfographicZone[]
): number {
    let score = 50; // Base score

    // Factor 1: Content quality (word count)
    if (parsedContent.totalWordCount > 1000) score += 15;
    else if (parsedContent.totalWordCount > 500) score += 10;
    else if (parsedContent.totalWordCount > 300) score += 5;

    // Factor 2: Structure quality (sections)
    if (parsedContent.sectionCount >= 4) score += 15;
    else if (parsedContent.sectionCount >= 3) score += 10;
    else score += 5;

    // Factor 3: Insights extracted
    if (insights.length >= 5) score += 10;
    else if (insights.length >= 3) score += 5;

    // Factor 4: Zones generated
    if (zones.length >= 4 && zones.length <= 6) score += 10;
    else score += 5;

    return Math.min(100, score);
}
