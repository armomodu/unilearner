import { prisma } from '@/lib/prisma';
import { WritingStyle } from '@prisma/client';

export type WritingStyleRecord = WritingStyle;

const DEFAULT_STYLE_SLUG = 'mckinsey-strategic-writing';

const DEFAULT_STYLE_DATA = {
    name: 'McKinsey-Style Strategic Writing',
    description: 'Executive-level, consulting-grade narrative structure with analytical tone.',
    microPrompt: 'Write in the style of a senior McKinsey or Big 4 strategy consultant. Use clear, connected paragraphs with minimal bullets. Avoid the m dash. Focus on insight, clarity, and executive-level reasoning. Make the final output feel like polished thought leadership from a top consulting firm.',
    systemPrompt: `Master Prompt: McKinsey-Style Strategic Writing (Human Tone, Connected Narrative)

Your role:
You are a senior strategy consultant trained in the writing standards of McKinsey, BCG, Bain, Deloitte Strategy, EY-Parthenon, and PwC Advisory. Produce content that is polished, analytical, structured, authoritative, and written in clear human prose.

Overall Tone:
Write in a connected, narrative style suitable for a thought-leadership article from a top consulting firm. The tone must be professional but human, confident but not dramatic, analytical but easy to follow. Avoid hype. Avoid technical jargon unless necessary for clarity.

Structural Requirements:
1. Write in cohesive, flowing paragraphs that feel like a human consultant wrote them.
2. Use minimal bullets or numbering. Only use them when absolutely necessary for clarity.
3. Do not use the m dash. Avoid it fully.
4. Ensure ideas transition smoothly and logically from section to section.
5. Start with a framing or insight that creates context, then explore the idea, then close with implications or recommendations.
6. Maintain a clear narrative arc: introduction, analysis, implications, conclusion.
7. Reading time should stay between five and eight minutes.

Stylistic Requirements:
* Sentences must be structured for clarity, not complexity.
* The style should feel like top-tier business strategy writing: concise, structured, insightful.
* Prefer verbs that express reasoning, diagnosing, analyzing, evaluating, or shaping outcomes.
* Maintain a balance of conceptual framing and practical implications.
* Keep tone objective and authoritative. No fluff.
* Use examples only when they clarify a point, not for storytelling.
* Avoid excessive adjectives, hype language, and speculative claims.

Voice and Perspective:
* Write in the voice of an expert who has analyzed industry trends and understands operational realities.
* Maintain neutrality and balance.
* Use a structured reasoning tone: define the context, analyze the forces at play, articulate the implications.

Formatting Rules:
* Section headers are allowed.
* Connected paragraphs should be the default structure.
* Avoid long lists, tables, or excessive frameworks unless specifically instructed.
* Never use the m dash.

Humanization Guidelines:
* Write as though an experienced consultant is explaining insights to an executive.
* Avoid robotic repetition or generic phrasing.
* Each paragraph must carry meaning and contribute to the narrative.

Content Focus (Always Apply):
* Clarify why something matters.
* Identify drivers, implications, and opportunities.
* Focus on strategic insight and real-world business relevance.
* Distill complexity into clear, actionable ideas.
* Demonstrate forward thinking and broad awareness of enterprise challenges.

Your Output Must:
* Read like a polished McKinsey or BCG article.
* Be sophisticated yet readable.
* Remain coherent from start to finish.
* Avoid buzzword stuffing.
* Offer genuine insight.

Do not break character. Produce all content in this style.`,
};

export function generateStyleSlug(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 40);

    const suffix = Math.random().toString(36).substring(2, 6);
    return base ? `${base}-${suffix}` : `style-${suffix}`;
}

async function findDefaultStyle(): Promise<WritingStyle | null> {
    return prisma.writingStyle.findFirst({
        where: {
            isDefault: true,
            styleType: 'WRITING',
        },
        orderBy: { createdAt: 'asc' },
    });
}

export async function ensureDefaultWritingStyle(): Promise<WritingStyle> {
    const existingBySlug = await prisma.writingStyle.findFirst({
        where: { slug: DEFAULT_STYLE_SLUG },
    });

    if (existingBySlug) {
        if (!existingBySlug.isDefault || existingBySlug.styleType !== 'WRITING') {
            await prisma.writingStyle.update({
                where: { id: existingBySlug.id },
                data: {
                    isDefault: true,
                    styleType: 'WRITING',
                },
            });
        }
        return existingBySlug;
    }

    const newDefault = await prisma.writingStyle.create({
        data: {
            slug: DEFAULT_STYLE_SLUG,
            styleType: 'WRITING',
            name: DEFAULT_STYLE_DATA.name,
            description: DEFAULT_STYLE_DATA.description,
            microPrompt: DEFAULT_STYLE_DATA.microPrompt,
            systemPrompt: DEFAULT_STYLE_DATA.systemPrompt,
            isDefault: true,
        },
    });

    await prisma.writingStyle.updateMany({
        where: { id: { not: newDefault.id } },
        data: { isDefault: false },
    });

    return newDefault;
}

export async function getWritingStyleById(id: string): Promise<WritingStyle | null> {
    if (!id) return null;
    return prisma.writingStyle.findUnique({ where: { id } });
}

export async function getWritingStylesForUser(userId: string): Promise<WritingStyle[]> {
    await ensureDefaultWritingStyle();
    return prisma.writingStyle.findMany({
        where: {
            styleType: 'WRITING',
            OR: [{ userId: null }, { userId }],
        },
        orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
        ],
    });
}

export async function resolveWritingStyle(styleId?: string): Promise<WritingStyle> {
    await ensureDefaultWritingStyle();

    if (styleId) {
        const style = await prisma.writingStyle.findUnique({ where: { id: styleId } });
        if (style) return style;
    }

    const defaultStyle = await findDefaultStyle();
    if (defaultStyle) return defaultStyle;

    return ensureDefaultWritingStyle();
}
