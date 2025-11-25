import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Target, 
    Lightbulb, 
    Users, 
    Zap, 
    Search, 
    Brain, 
    PenTool, 
    ArrowRight,
    CheckCircle,
    Sparkles,
    Globe,
    Clock
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About UniLearner - AI-Powered Content Creation Platform',
    description: 'Learn about UniLearner\'s mission to revolutionize content creation through AI-powered research and writing. Discover our story, tools, and vision.',
    keywords: ['about unilearner', 'AI content creation', 'company mission', 'content automation', 'AI writing platform'],
    openGraph: {
        title: 'About UniLearner',
        description: 'Revolutionizing content creation through AI-powered research and writing',
        type: 'website',
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-24">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <Badge className="px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 text-primary mb-6">
                        <Users className="w-4 h-4 mr-2" />
                        About UniLearner
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                            Revolutionizing Content Creation
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Through AI Innovation
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        We're building the future of content creation where artificial intelligence 
                        handles research and writing, so you can focus on strategy, creativity, and growth.
                    </p>
                </div>

                {/* Mission Section */}
                <section className="mb-20">
                    <div className="max-w-4xl mx-auto">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                            <CardHeader className="text-center pb-8">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-center">
                                    <Target className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl mb-4">Our Mission</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    To democratize high-quality content creation by providing creators, marketers, 
                                    and businesses with AI-powered tools that transform any topic into comprehensive, 
                                    well-researched, and engaging blog content in minutes rather than hours.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Story Section */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <Badge className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600 mb-4">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Our Story
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6">How UniLearner Came to Life</h2>
                    </div>
                    
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
                            <p>
                                UniLearner was born from a simple observation: content creators were spending 
                                10+ hours researching and writing each blog post, with most of that time going 
                                to mundane research tasks rather than creative strategy.
                            </p>
                            
                            <p>
                                We realized that artificial intelligence had reached a point where it could 
                                handle the heavy lifting of web research, data analysis, and structured writing 
                                - freeing humans to focus on what they do best: creative direction, strategic 
                                thinking, and audience engagement.
                            </p>
                            
                            <p>
                                Our breakthrough came when we developed a <strong>three-agent system</strong> 
                                that mimics how expert content creators actually work: first researching sources, 
                                then analyzing and synthesizing information, and finally crafting engaging content 
                                that reads like it was written by a subject matter expert.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Tools & Technology */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <Badge className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-600 mb-4">
                            <Zap className="w-4 h-4 mr-2" />
                            Our Tools
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6">Powered by Industry-Leading AI</h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            We've carefully selected and integrated the most advanced AI models to create 
                            a seamless content creation pipeline.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Search Agent */}
                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                            <CardHeader className="text-center pb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Search className="w-8 h-8 text-blue-500" />
                                </div>
                                <CardTitle className="text-xl">Tavily Search Agent</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Real-time web search across billions of pages
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Source relevance scoring and ranking
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Automatic content extraction and cleaning
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Research Agent */}
                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                            <CardHeader className="text-center pb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Brain className="w-8 h-8 text-purple-500" />
                                </div>
                                <CardTitle className="text-xl">Gemini 3 Pro Research</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Deep analysis of multiple sources
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Key insight extraction and synthesis
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Structured outline and fact verification
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Writing Agent */}
                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                            <CardHeader className="text-center pb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <PenTool className="w-8 h-8 text-green-500" />
                                </div>
                                <CardTitle className="text-xl">Claude Sonnet 4.5 Writer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Human-like writing style and tone
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        SEO optimization and readability
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        Proper citations and source integration
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="mb-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-600 mb-6">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Our Vision
                        </Badge>
                        <h2 className="text-4xl font-bold mb-8">The Future of Content Creation</h2>
                        
                        <div className="grid md:grid-cols-2 gap-8 text-left">
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                                <CardContent className="p-8">
                                    <Globe className="w-12 h-12 text-primary mb-4" />
                                    <h3 className="text-xl font-semibold mb-4">Global Impact</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        We envision a world where language barriers, research skills, and time constraints 
                                        no longer limit anyone's ability to create high-quality content. Our platform will 
                                        democratize professional content creation globally.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                                <CardContent className="p-8">
                                    <Clock className="w-12 h-12 text-primary mb-4" />
                                    <h3 className="text-xl font-semibold mb-4">Time Liberation</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        By reducing content creation time from hours to minutes, we're giving creators 
                                        their most valuable resource back - time to focus on strategy, creativity, 
                                        and building meaningful connections with their audience.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center">
                    <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 border border-primary/20">
                        <h2 className="text-3xl font-bold mb-4">Join the Content Revolution</h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Ready to transform your content creation process? Join thousands of creators 
                            who are already saving 10+ hours per blog post with UniLearner.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
                                    Start Creating Free
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="lg" variant="outline" className="gap-2">
                                    Get in Touch
                                </Button>
                            </Link>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            No credit card required • 3 free blog posts • Cancel anytime
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}