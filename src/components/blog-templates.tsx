'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Lightbulb, 
    TrendingUp, 
    Users, 
    Code, 
    Briefcase,
    BookOpen,
    Zap
} from 'lucide-react';

export interface BlogTemplate {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: 'business' | 'tech' | 'education' | 'general';
    content: string;
}

const BLOG_TEMPLATES: BlogTemplate[] = [
    {
        id: 'how-to-guide',
        title: 'How-To Guide',
        description: 'Step-by-step tutorial format for instructional content',
        icon: <BookOpen className="w-5 h-5" />,
        category: 'education',
        content: `# How to [Your Topic Here]

## Introduction
Brief overview of what readers will learn and why it's important.

## Prerequisites
What readers need to know or have before starting:
- Requirement 1
- Requirement 2
- Requirement 3

## Step-by-Step Guide

### Step 1: [First Major Step]
Detailed explanation of the first step.

**Pro tip:** Include helpful tips along the way.

### Step 2: [Second Major Step]
Continue with clear, actionable instructions.

### Step 3: [Third Major Step]
Build on previous steps with logical progression.

## Common Issues and Solutions
- **Issue:** Problem description
  **Solution:** How to fix it

## Key Takeaways
- Main point 1
- Main point 2  
- Main point 3

## Conclusion
Summarize what was covered and encourage next steps.

---
*What's your experience with this topic? Share your thoughts in the comments below!*`
    },
    {
        id: 'thought-leadership',
        title: 'Thought Leadership',
        description: 'Share insights, opinions, and industry perspectives',
        icon: <Lightbulb className="w-5 h-5" />,
        category: 'business',
        content: `# [Your Thought-Provoking Title]

## The Current Landscape
Set the stage by describing the current state of your industry or topic.

## The Challenge We Face
Identify key problems or opportunities that need addressing.

> "Include a compelling quote or statistic that supports your argument."

## My Perspective
Share your unique viewpoint based on experience and expertise.

### Key Insight #1
Elaborate on your first main point with supporting evidence.

### Key Insight #2
Continue building your argument with real-world examples.

### Key Insight #3
Present your most compelling insight with actionable implications.

## Looking Ahead
Discuss future trends and what they mean for your audience.

## What This Means for You
Provide practical takeaways readers can apply immediately.

## Call to Action
Encourage engagement and next steps.

---
*I'd love to hear your perspective on this topic. What are your thoughts?*`
    },
    {
        id: 'case-study',
        title: 'Case Study',
        description: 'Analyze real-world examples and results',
        icon: <TrendingUp className="w-5 h-5" />,
        category: 'business',
        content: `# Case Study: [Project/Campaign Name]

## Executive Summary
Brief overview of the project, results, and key learnings.

## Background & Challenge
### The Situation
Describe the initial context and environment.

### The Challenge
Clearly define the problem that needed solving.

### Success Metrics
What would define success for this project?

## Approach & Strategy
### Our Method
Explain the strategy and reasoning behind your approach.

### Implementation Timeline
- **Phase 1:** Initial steps (timeframe)
- **Phase 2:** Main implementation (timeframe)  
- **Phase 3:** Optimization (timeframe)

## Results & Impact
### Key Metrics
- Metric 1: [X% improvement]
- Metric 2: [Specific achievement]
- Metric 3: [Quantified result]

### Unexpected Outcomes
Discuss any surprising results or learnings.

## Lessons Learned
### What Worked Well
- Success factor 1
- Success factor 2

### What We'd Do Differently
- Improvement area 1
- Improvement area 2

## Key Takeaways
Actionable insights others can apply to their own projects.

---
*Have you faced similar challenges? I'd love to hear about your experiences.*`
    },
    {
        id: 'technical-deep-dive',
        title: 'Technical Deep Dive',
        description: 'Detailed technical analysis or explanation',
        icon: <Code className="w-5 h-5" />,
        category: 'tech',
        content: `# [Technical Topic]: A Deep Dive

## Overview
High-level summary of what you'll cover and why it matters.

## Background Context
Provide necessary background information for understanding.

## Technical Architecture
### System Components
Describe the main components and their relationships.

### Key Technologies
- **Technology 1:** Purpose and benefits
- **Technology 2:** Role in the system
- **Technology 3:** Implementation details

## Implementation Details
### Core Concepts
Explain the fundamental concepts readers need to understand.

\`\`\`javascript
// Include relevant code examples
function example() {
    return "Well-commented code helps readers follow along";
}
\`\`\`

### Best Practices
Share proven approaches and common patterns.

## Performance Considerations
### Optimization Strategies
- Strategy 1 with expected impact
- Strategy 2 with implementation notes

### Monitoring & Metrics  
Key metrics to track and why they matter.

## Common Pitfalls
### Issue 1: [Problem Description]
**Solution:** How to avoid or fix this issue.

### Issue 2: [Another Common Problem]
**Solution:** Best practices for prevention.

## Future Considerations
Discuss upcoming developments and their implications.

## Conclusion
Summarize key points and provide next steps for implementation.

---
*Questions about implementation? Feel free to reach out!*`
    },
    {
        id: 'industry-analysis',
        title: 'Industry Analysis',
        description: 'Market trends, competitive analysis, and insights',
        icon: <Briefcase className="w-5 h-5" />,
        category: 'business',
        content: `# [Industry/Market] Analysis: Current State and Future Outlook

## Market Overview
Current state of the industry with key statistics and context.

## Key Market Drivers
### Driver 1: [Major Trend]
Impact and implications for industry players.

### Driver 2: [Technology/Regulation]
How this is reshaping the competitive landscape.

### Driver 3: [Consumer Behavior]
Changing expectations and their business impact.

## Competitive Landscape
### Market Leaders
Analysis of dominant players and their strategies.

### Emerging Players
New entrants disrupting traditional approaches.

### Competitive Dynamics
How companies are differentiating and competing.

## Technology Trends
### Current Innovations
Technologies currently transforming the industry.

### Emerging Technologies
Future innovations on the horizon.

### Adoption Challenges
Barriers to technology implementation.

## Opportunities & Challenges
### Market Opportunities
- Opportunity 1: Description and potential
- Opportunity 2: Market size and accessibility

### Key Challenges
- Challenge 1: Impact and mitigation strategies
- Challenge 2: Industry-wide concerns

## Future Outlook
### Short-term Predictions (6-12 months)
Expected developments and their implications.

### Long-term Vision (2-5 years)
Structural changes and strategic considerations.

## Strategic Recommendations
Actionable insights for industry participants.

---
*What trends are you seeing in your sector? Share your observations!*`
    },
    {
        id: 'quick-tips',
        title: 'Quick Tips & Best Practices',
        description: 'Concise, actionable advice in list format',
        icon: <Zap className="w-5 h-5" />,
        category: 'general',
        content: `# [Number] Essential Tips for [Your Topic]

## Why This Matters
Brief explanation of why these tips are valuable and relevant.

## The Tips

### 1. [First Tip Title]
**Quick explanation:** What this tip involves.
**Why it works:** The reasoning or benefit behind it.
**Pro tip:** Additional insight or advanced application.

### 2. [Second Tip Title]
**Quick explanation:** Clear, actionable advice.
**Why it works:** Supporting rationale.
**Pro tip:** Extra value for experienced practitioners.

### 3. [Third Tip Title]
**Quick explanation:** Specific steps or approach.
**Why it works:** Evidence or logic supporting the tip.
**Pro tip:** Advanced technique or consideration.

### 4. [Fourth Tip Title]
**Quick explanation:** Direct, implementable advice.
**Why it works:** Benefits and expected outcomes.
**Pro tip:** Ways to maximize impact.

### 5. [Fifth Tip Title]
**Quick explanation:** Clear action items.
**Why it works:** Underlying principles.
**Pro tip:** Common mistakes to avoid.

## Quick Reference Checklist
- [ ] Tip 1 summary
- [ ] Tip 2 summary  
- [ ] Tip 3 summary
- [ ] Tip 4 summary
- [ ] Tip 5 summary

## Bonus Tips
Additional quick wins or advanced strategies.

## Common Mistakes to Avoid
- **Mistake 1:** Why it's problematic and how to avoid it
- **Mistake 2:** Better alternative approach

## Next Steps
Encourage readers to implement these tips and share results.

---
*Which tip resonates most with you? Let me know in the comments!*`
    }
];

interface BlogTemplatesProps {
    onSelectTemplate: (template: BlogTemplate) => void;
    selectedCategory?: string;
}

export function BlogTemplates({ onSelectTemplate, selectedCategory }: BlogTemplatesProps) {
    const [activeCategory, setActiveCategory] = useState<string>(selectedCategory || 'all');

    const categories = [
        { id: 'all', label: 'All Templates', count: BLOG_TEMPLATES.length },
        { id: 'business', label: 'Business', count: BLOG_TEMPLATES.filter(t => t.category === 'business').length },
        { id: 'tech', label: 'Technology', count: BLOG_TEMPLATES.filter(t => t.category === 'tech').length },
        { id: 'education', label: 'Education', count: BLOG_TEMPLATES.filter(t => t.category === 'education').length },
        { id: 'general', label: 'General', count: BLOG_TEMPLATES.filter(t => t.category === 'general').length },
    ];

    const filteredTemplates = activeCategory === 'all' 
        ? BLOG_TEMPLATES 
        : BLOG_TEMPLATES.filter(template => template.category === activeCategory);

    return (
        <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={activeCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(category.id)}
                        className="gap-2"
                    >
                        {category.label}
                        <Badge variant="secondary" className="ml-1">
                            {category.count}
                        </Badge>
                    </Button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => (
                    <Card 
                        key={template.id} 
                        className="cursor-pointer transition-colors hover:bg-muted/50 group"
                        onClick={() => onSelectTemplate(template)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {template.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{template.title}</CardTitle>
                                        <Badge variant="outline" className="mt-1 capitalize">
                                            {template.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-sm leading-relaxed">
                                {template.description}
                            </CardDescription>
                            <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto font-medium">
                                Use This Template →
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No templates found in this category.</p>
                </div>
            )}
        </div>
    );
}