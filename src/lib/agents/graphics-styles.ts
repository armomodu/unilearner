import { prisma } from '@/lib/prisma';
import { WritingStyle } from '@prisma/client';

export type GraphicsStyleRecord = WritingStyle;

const DEFAULT_GRAPHICS_STYLE_SLUG = 'executive-infographic-16-9';

const DEFAULT_GRAPHICS_STYLE_DATA = {
    name: 'Executive Infographic (AI-Powered)',
    description: 'AI-powered executive infographics with consulting-grade design (BCG/McKinsey quality). Automatically analyzes content to select optimal layout archetype and theme.',
    styleType: 'GRAPHICS' as const,
    microPrompt: 'Executive-grade infographic using AI-powered content analysis for theme detection and archetype selection.',
    systemPrompt: `Create a consulting-grade executive infographic summarizing the blog content.

VISUAL STYLE REQUIREMENTS:
- Use minimalistic business-style visuals suitable for executive audiences
- Aspect ratio: 16:9 (landscape format, 1920x1080px minimum)
- Color palette: Professional blues and grays with accent colors for emphasis
- Typography: Clean sans-serif fonts (Helvetica, Arial, or similar), hierarchical text sizing
- Icons: Simple, flat design icons matching each key point
- Layout: Balanced composition with clear visual flow from top to bottom or left to right
- Whitespace: Generous spacing to avoid clutter

CONTENT REQUIREMENTS:
- Title: Large, prominent heading at top (48-72px font size)
- Subtitle: Brief context or tagline (24-32px font size)
- 3-5 Key Points: Each with icon, heading, and brief description
- Data Visualization: Include at least one chart/graph if numerical data is present
- Source Attribution: Small footer with blog URL or branding
- Text Accuracy: Ensure all text is clean, readable, and professionally formatted
- Contrast: Maintain high contrast between text and background

TECHNICAL SPECIFICATIONS:
- Resolution: 1920x1080px minimum
- File format: PNG with transparency support where appropriate
- Text contrast: Meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Consistent spacing: Use 8px or 16px grid system
- Alignment: Maintain consistent alignment throughout

CONTENT EXTRACTION:
- Extract the most important 3-5 insights from the blog content
- If statistics or data points are present, visualize them as charts
- Use icons that metaphorically represent each key concept
- Keep text concise - use short phrases rather than full sentences
- Prioritize clarity and scannability over detail

STYLE GUIDELINES:
- Professional and polished appearance
- Suitable for LinkedIn, business presentations, or corporate blogs
- Avoid playful or casual design elements
- Maintain brand consistency with neutral, business-appropriate colors
- Focus on information hierarchy and readability`,
    graphicsConfig: {
        aspectRatio: '16:9',
        width: 1920,
        height: 1080,
        audience: 'executive',
        visualStyle: 'minimalist',
        colorScheme: 'professional',
        includeCharts: true,
        includeIcons: true,
        // Executive mode configuration (NEW)
        executiveMode: true,
        layoutArchetype: 'auto', // 'auto' = AI selects best archetype
        themePreference: 'auto', // 'auto' = AI detects dark vs light
        consultingGrade: true,
        zoneCount: { min: 4, max: 6 },
    },
};

// Additional default templates
const SOCIAL_MEDIA_STYLE_DATA = {
    name: 'Social Media Post (1:1)',
    description: 'Vibrant, eye-catching graphics optimized for social media platforms like Instagram and LinkedIn.',
    styleType: 'GRAPHICS' as const,
    microPrompt: 'Social media square format, vibrant colors, mobile-optimized, attention-grabbing design.',
    systemPrompt: `Create a social media-optimized infographic.

VISUAL STYLE REQUIREMENTS:
- Aspect ratio: 1:1 (square format, 1080x1080px)
- Color palette: Vibrant, high-contrast colors that stand out in feeds
- Typography: Bold, large fonts optimized for mobile viewing (minimum 32px for body text)
- Icons: Large, recognizable icons with strong visual impact
- Layout: Centered, balanced design that works on small screens
- Background: Eye-catching gradient or solid color with strong contrast

CONTENT REQUIREMENTS:
- Title: Large, bold headline (60-80px font size)
- 3-4 Key Takeaways: Each with large icon and brief text
- Minimal text: Short phrases that can be read in 3-5 seconds
- Visual hierarchy: Clear priority given to most important message
- Branding: Small logo or handle placement
- Call-to-action: Optional engagement prompt ("Swipe for more", "Read full article")

TECHNICAL SPECIFICATIONS:
- Resolution: 1080x1080px
- File format: PNG or JPEG optimized for web
- Color: RGB color mode, vibrant saturation
- Text readability: Ensure legibility on mobile devices (5-6 inches)
- File size: Optimize to under 1MB for fast loading

SOCIAL MEDIA OPTIMIZATION:
- Design for thumb-stopping impact
- Use negative space effectively
- Ensure text is readable without zooming
- Consider how it appears in thumbnail view
- Make key message visible even when cropped (Instagram feed preview)

STYLE GUIDELINES:
- Modern, trendy design elements
- Bold typography choices
- High visual energy
- Optimized for engagement and shares`,
    graphicsConfig: {
        aspectRatio: '1:1',
        width: 1080,
        height: 1080,
        audience: 'general',
        visualStyle: 'vibrant',
        colorScheme: 'bold',
        includeCharts: false,
        includeIcons: true,
        executiveMode: false, // Use legacy mode for social media
    },
};

const TECHNICAL_DIAGRAM_STYLE_DATA = {
    name: 'Technical Diagram (4:3)',
    description: 'Detailed technical diagrams and flowcharts for developer and engineering audiences.',
    styleType: 'GRAPHICS' as const,
    microPrompt: 'Technical diagram, 4:3 format, developer-focused, precise and detailed with clear relationships.',
    systemPrompt: `Create a technical diagram or flowchart.

VISUAL STYLE REQUIREMENTS:
- Aspect ratio: 4:3 (1600x1200px)
- Color palette: Muted colors with high contrast (grays, blues, greens)
- Typography: Monospace or technical sans-serif fonts
- Icons: Precise, technical symbols (boxes, arrows, connectors)
- Layout: Logical flow (top-to-bottom or left-to-right)
- Line style: Clear, crisp lines with consistent stroke width

CONTENT REQUIREMENTS:
- Title: Clear, descriptive heading
- Components: Labeled boxes/nodes representing system components
- Connections: Arrows showing data flow, relationships, or process steps
- Annotations: Brief technical notes explaining key connections
- Legend: If using symbols or color coding, provide a legend
- Technical accuracy: Ensure all technical terms and relationships are correct

TECHNICAL SPECIFICATIONS:
- Resolution: 1600x1200px minimum
- File format: PNG or SVG for scalability
- Line thickness: Consistent (2-3px for main elements, 1px for details)
- Font size: Minimum 14px for labels, 18px for headings
- Spacing: Adequate padding between elements for clarity

DIAGRAM TYPES:
- System architecture diagrams
- Process flowcharts
- Data flow diagrams
- Network topology diagrams
- Component relationship diagrams
- API interaction flows

STYLE GUIDELINES:
- Precision over decoration
- Clear hierarchy of information
- Logical grouping of related components
- Consistent use of shapes and symbols
- Professional engineering aesthetics
- Focus on clarity and technical communication`,
    graphicsConfig: {
        aspectRatio: '4:3',
        width: 1600,
        height: 1200,
        audience: 'technical',
        visualStyle: 'diagram',
        colorScheme: 'muted',
        includeCharts: false,
        includeIcons: true,
        executiveMode: false, // Use legacy mode for technical diagrams
    },
};

export function generateGraphicsSlug(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 40);

    const suffix = Math.random().toString(36).substring(2, 6);
    return base ? `${base}-${suffix}` : `graphics-${suffix}`;
}

async function findDefaultGraphicsStyle(): Promise<WritingStyle | null> {
    return prisma.writingStyle.findFirst({
        where: {
            styleType: 'GRAPHICS',
            isDefault: true,
        },
        orderBy: { createdAt: 'asc' },
    });
}

export async function ensureDefaultGraphicsStyle(): Promise<WritingStyle> {
    const existingBySlug = await prisma.writingStyle.findFirst({
        where: { slug: DEFAULT_GRAPHICS_STYLE_SLUG },
    });

    if (existingBySlug) {
        if (!existingBySlug.isDefault || existingBySlug.styleType !== 'GRAPHICS') {
            await prisma.writingStyle.update({
                where: { id: existingBySlug.id },
                data: {
                    isDefault: true,
                    styleType: 'GRAPHICS',
                },
            });
        }
        return existingBySlug;
    }

    // Create default graphics style
    const newDefault = await prisma.writingStyle.create({
        data: {
            slug: DEFAULT_GRAPHICS_STYLE_SLUG,
            styleType: 'GRAPHICS',
            name: DEFAULT_GRAPHICS_STYLE_DATA.name,
            description: DEFAULT_GRAPHICS_STYLE_DATA.description,
            microPrompt: DEFAULT_GRAPHICS_STYLE_DATA.microPrompt,
            systemPrompt: DEFAULT_GRAPHICS_STYLE_DATA.systemPrompt,
            graphicsConfig: DEFAULT_GRAPHICS_STYLE_DATA.graphicsConfig,
            isDefault: true,
        },
    });

    // Unset isDefault for any other graphics styles
    await prisma.writingStyle.updateMany({
        where: {
            id: { not: newDefault.id },
            styleType: 'GRAPHICS',
        },
        data: { isDefault: false },
    });

    return newDefault;
}

export async function ensureAdditionalGraphicsStyles(): Promise<void> {
    // Check if additional styles exist
    const socialExists = await prisma.writingStyle.findFirst({
        where: { name: SOCIAL_MEDIA_STYLE_DATA.name },
    });

    const technicalExists = await prisma.writingStyle.findFirst({
        where: { name: TECHNICAL_DIAGRAM_STYLE_DATA.name },
    });

    // Create social media style if it doesn't exist
    if (!socialExists) {
        await prisma.writingStyle.create({
            data: {
                slug: generateGraphicsSlug(SOCIAL_MEDIA_STYLE_DATA.name),
                styleType: 'GRAPHICS',
                name: SOCIAL_MEDIA_STYLE_DATA.name,
                description: SOCIAL_MEDIA_STYLE_DATA.description,
                microPrompt: SOCIAL_MEDIA_STYLE_DATA.microPrompt,
                systemPrompt: SOCIAL_MEDIA_STYLE_DATA.systemPrompt,
                graphicsConfig: SOCIAL_MEDIA_STYLE_DATA.graphicsConfig,
                isDefault: false,
            },
        });
    }

    // Create technical diagram style if it doesn't exist
    if (!technicalExists) {
        await prisma.writingStyle.create({
            data: {
                slug: generateGraphicsSlug(TECHNICAL_DIAGRAM_STYLE_DATA.name),
                styleType: 'GRAPHICS',
                name: TECHNICAL_DIAGRAM_STYLE_DATA.name,
                description: TECHNICAL_DIAGRAM_STYLE_DATA.description,
                microPrompt: TECHNICAL_DIAGRAM_STYLE_DATA.microPrompt,
                systemPrompt: TECHNICAL_DIAGRAM_STYLE_DATA.systemPrompt,
                graphicsConfig: TECHNICAL_DIAGRAM_STYLE_DATA.graphicsConfig,
                isDefault: false,
            },
        });
    }
}

export async function getGraphicsStyleById(id: string): Promise<WritingStyle | null> {
    if (!id) return null;
    return prisma.writingStyle.findUnique({
        where: {
            id,
            styleType: 'GRAPHICS',
        },
    });
}

export async function getGraphicsStylesForUser(userId: string): Promise<WritingStyle[]> {
    await ensureDefaultGraphicsStyle();
    await ensureAdditionalGraphicsStyles();

    return prisma.writingStyle.findMany({
        where: {
            styleType: 'GRAPHICS',
            OR: [{ userId: null }, { userId }],
        },
        orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
        ],
    });
}

export async function resolveGraphicsStyle(styleId?: string): Promise<WritingStyle> {
    await ensureDefaultGraphicsStyle();

    if (styleId) {
        const style = await prisma.writingStyle.findUnique({
            where: {
                id: styleId,
                styleType: 'GRAPHICS',
            },
        });
        if (style) return style;
    }

    const defaultStyle = await findDefaultGraphicsStyle();
    if (defaultStyle) return defaultStyle;

    return ensureDefaultGraphicsStyle();
}
