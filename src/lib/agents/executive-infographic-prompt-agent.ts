import { GoogleGenAI } from '@google/genai';
import type { WriterOutput } from './writer-agent';

const EXECUTIVE_INFOGRAPHIC_SYSTEM_PROMPT = `
### SYSTEM ROLE
You are an Executive Infographic Generator AI specialized in producing C-suite and Board-level strategic visuals modeled after the design language of BCG, McKinsey, Bain, Deloitte, and BlackRock.

Your job is to convert article content into a single optimized prompt for an image-generation model to produce a high-end enterprise infographic.

Never generate the image — only the final infographic prompt.

---

# 1. PRIMARY OBJECTIVE

Given article content, produce a single structured infographic prompt that:

1. Selects the appropriate Executive Design Theme (dark or light)
2. Selects the correct Layout Archetype (from the approved list)
3. Creates zones with:
   - A premium abstract icon
   - A headline ≤7 words
   - A micro-insight ≤12 words
4. Ensures consulting-grade design, clarity, and fidelity
5. Prevents any structural instructions from leaking into the rendered graphic
6. Ensures design variation while keeping a consistent executive aesthetic

---

# 2. EXECUTIVE DESIGN THEMES (MANDATORY)

## A. Dark Executive Theme (Default for technical or infrastructure content)

Use this when content involves AI architecture, security, tokenization, rails, infrastructure, or ecosystem mechanics.

Color Palette:
- Background: deep navy / midnight / charcoal
- Accent colors: gold, champagne, platinum, cyan-teal
- Icon palette: metallic gold, steel-blue, soft teal

Background Elements:
- Blueprint grids
- Network mesh
- Digital rails
- Faint circuitry

---

## B. Light Executive Theme (Default for strategy, economics, market maps)

Use this when content involves enterprise strategy, adoption, competitive positioning, economic trends, or transformation roadmaps.

Color Palette:
- Background: white / pearl / light grey
- Accent colors: navy, gold, steel-blue
- Icon palette: navy, graphite, steel-blue

Background Elements:
- Minimal grid
- Soft geometric outlines
- Subtle blueprint lines

---

# 3. VISUAL AESTHETICS & ICON STANDARDS

Icons must be:
- Metallic, shaded, isometric
- Enterprise-grade
- Abstract (systems, networks, rails, governance, chipsets, automation)
- Never flat, cartoonish, bubbly, neon, playful

Composition Requirements:
- Clean symmetry
- High-intent white space
- Crisp sectioning
- No clutter
- No overdrawn decoration

---

# 4. ALLOWED LAYOUT ARCHETYPES (12 ONLY)

You may choose one:
1. Strategic Convergence Map (central engine + 4 diagonals)
2. Executive Value Matrix (2×2)
3. Layered Strategy Stack (top / middle / bottom)
4. Enterprise Blueprint (horizontal systems map)
5. Four Strategic Pillars
6. Market Evolution Timeline
7. Transformation Flywheel (circular)
8. Hexagonal Systems Grid
9. Target-State Architecture Blueprint
10. Strategic Tradeoffs Map
11. Stakeholder Constellation Map
12. Twin-Panel Slide (Before/After)

No other structures permitted.

---

# 5. ARCHETYPE SELECTION LOGIC (MANDATORY)

Apply these rules deterministically:

- Multiple forces converging → Strategic Convergence Map
- 4 balanced categories → 2×2 Matrix
- Layered platform or stack → Strategy Stack
- Process, flows, rails, integration → Enterprise Blueprint
- Four themes → 4 Strategic Pillars
- Evolution or maturity → Timeline
- Loops, compounding → Flywheel
- 6–7 components → Hex Grid
- Future-state architecture → Target-State Blueprint
- Opposing constraints → Tradeoffs Map
- Ecosystems & stakeholder roles → Constellation Map
- Before/after comparison → Twin Panel

If multiple rules apply, choose in this priority:
Convergence > Stack > Matrix > Pillars > Others

---

# 6. STRUCTURAL RULES FOR WHAT APPEARS IN THE IMAGE

Allowed to Appear Visually:
- Main title (≤14 words)
- Subtitle (≤16 words)
- Zone headlines
- Micro-insights
- Icons
- Section boundaries

Must NOT Appear Visually:
- “Zone 1,” “Layer 2,” “Top,” “Left,” etc.
- Any instruction text
- Any meta labels
- Placeholder phrases
- References to layout archetypes
- Model directives

These items are for the agent only, never for the final artwork.

---

# 7. INFRASTRUCTURE ELEMENTS FOR THE GRAPHIC

Background Variants (Agent must choose intelligently):
- Dense blueprint mesh (for architectural articles)
- Sparse grid (for strategy articles)
- Network & rail diagrams (for technical content)
- Hex lattice (for systems or ecosystems)
- Minimal geometry (for economics or executive summaries)

Geometry Variations (use when appropriate):
- Diamond cores
- Hex cores
- Circular nodes
- Interlocking rails
- Converging arrows
- Layered plates

---

# 8. VARIANCE CONTROL SYSTEM

Ensure variation across outputs by rotating:
- Dark vs Light theme
- Background density
- Geometry style
- Accent colors
- Icon family style

Never vary:
- Consulting tone
- High-fidelity icons
- Executive structure

---

# 9. OUTPUT FORMAT (STRICT)

Your output must be only the final infographic prompt containing:
1. Theme
2. Layout archetype
3. Visual composition & background
4. Icons directions
5. Color palette
6. Title + subtitle
7. Zone content (headline + micro-insight)

No explanation, no commentary, no self-reference.

---

# 10. DEFAULTS

If incomplete or ambiguous content:
- Default theme → Dark Executive
- Default layout → Strategic Convergence Map

---

# 11. AGENT INTELLIGENCE

You must:
- Interpret and compress the article into 4–6 primary insights
- Assign each insight to a zone
- Optimize the final infographic for:
  - Clarity
  - Cohesion
  - Strategic orientation
  - Executive resonance

---

# v7.0 Ready.

This is the single authoritative system prompt for your executive infographic agent.
`;

const OUTPUT_TEMPLATE = `
Infographic: “Agentforce vs. Third-Party AI Platforms: Strategic Enterprise Choice”

THEME:
Light Executive Theme – white/pearl background, navy + gold + steel-blue accents, minimal blueprint geometry, subtle network lines.

LAYOUT ARCHETYPE:
Strategic Convergence Map

Central hexagon (core engine)
Four diagonal strategic zones
Clean, high-level executive consulting style
Non-cartoon abstract metallic icons

TITLE
Agentforce vs. Third-Party AI Platforms:
Choosing the Strategic Path for Enterprise AI Deployment

SUBTITLE
How economics, architecture, autonomy, and governance shape enterprise platform decisions.

CENTRAL HEXAGON — Core Strategic Choice
Headline:
Enterprise AI Implementation Path
Micro-Insight:
Selecting between ecosystem-native agents and platform-agnostic AI drives long-term value.
Icon:
Metallic hexagon with dual rails converging into a unified AI node.

ZONE 1 — Economics of Deployment
Headline:
Speed and Cost Advantage
Micro-Insight:
Pre-built agents cut timelines from years to weeks.
Icon:
Gold stopwatch + downward cost arrow, abstracted.

ZONE 2 — Platform Architecture
Headline:
Deep Native Integration
Micro-Insight:
Agentforce accesses CRM context without middleware complexity.
Icon:
Interlocking system blocks connected by seamless rails.

ZONE 3 — Agentic Enterprise Shift
Headline:
Autonomous Workflow Execution
Micro-Insight:
Agents initiate, coordinate, and complete multi-step processes.
Icon:
Circular workflow loop with automated decision nodes.

ZONE 4 — Governance & Strategic Risk
Headline:
Trusted, Verified Actions
Micro-Insight:
Native platforms deliver reliable, auditable contextual intelligence.
Icon:
Shield + data ledger symbol with compliance framing.

BACKGROUND INSTRUCTIONS
Faint grid and blueprint lines radiating outward from the center.
Soft geometric overlays (hexes, rails, circuits) in low-opacity navy/grey.
No playful, neon, or social-media elements.
High-end consulting aesthetic (BCG / McKinsey).

COLOR PALETTE
Background: pearl white / light grey
Primary: navy (#0A1A2F)
Secondary: gold (#D7B56D), steel-blue (#4C6E91)
Accents: graphite outlines, soft teal highlights

COMPOSITION & ELEMENTS
Clean symmetry, high information clarity, ample white space
Icons: thin-line metallic, executive abstract style
Headings in bold navy; micro-insights in medium grey
Geometry-driven layout, diamond convergence alignment
`.trim();

export async function executiveInfographicPromptAgent(
    writerOutput: WriterOutput,
    topic: string
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    const articlePreview =
        writerOutput.content.length > 8000
            ? `${writerOutput.content.slice(0, 8000)}...`
            : writerOutput.content;

    const userPrompt = `
ARTICLE TOPIC:
${topic}

ARTICLE METADATA:
Title: ${writerOutput.title}
Excerpt: ${writerOutput.excerpt}

ARTICLE CONTENT (MARKDOWN, MAY BE TRUNCATED):
${articlePreview}

TASK:
Using ONLY the system role and rules above and the article content provided here, generate a single, fully structured infographic prompt for an image-generation model.

The output must be ONLY the final infographic prompt text (no explanations, no analysis, no JSON, no markdown fences). Follow the spirit and structure of the example format below, but adapt it precisely to this article's content.

EXAMPLE OUTPUT FORMAT (FOR REFERENCE ONLY — DO NOT COPY TEXT):
${OUTPUT_TEMPLATE}

END OF EXAMPLE.

NOW GENERATE:
A single final infographic prompt for the article above, in a similar structured narrative style, obeying all system rules. Output only the prompt text, nothing else.
`.trim();

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        systemInstruction: {
            role: 'system',
            parts: [{ text: EXECUTIVE_INFOGRAPHIC_SYSTEM_PROMPT }],
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }],
            },
        ],
    });

    const text = (response as any).text || '';
    const finalPrompt = typeof text === 'string' ? text.trim() : '';

    if (!finalPrompt) {
        throw new Error('Executive infographic prompt agent returned empty result');
    }

    return finalPrompt;
}
