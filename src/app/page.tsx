import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Zap, Globe, Play, CheckCircle, Search, Brain, PenTool } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            UniLearner
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <section className="relative py-24 md:py-32 px-4 text-center space-y-12 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Badge className="px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 text-primary hover:from-primary/20 hover:to-purple-500/20 transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Content Operating System
              <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-slate-100 dark:via-purple-300 dark:to-slate-100 bg-clip-text text-transparent">
                Research,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Write,
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent">
                Publish
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform any topic into comprehensive, well-researched blog content using our 
              <span className="text-primary font-medium"> three-agent AI system</span>. 
              From web search to expert writing in minutes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="h-14 px-10 text-lg gap-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Start Creating Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-10 text-lg gap-3 border-2 hover:bg-muted/50 transition-all duration-300 group"
              >
                <Play className="w-5 h-5" />
                See Examples
              </Button>
            </Link>
          </div>

          {/* Process Flow */}
          <div className="pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-800">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
              {/* Search */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Search Web</h3>
                  <p className="text-sm text-muted-foreground">Tavily finds sources</p>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />

              {/* Research */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Analyze Content</h3>
                  <p className="text-sm text-muted-foreground">Gemini 3 Pro research</p>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />

              {/* Write */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Expert Writing</h3>
                  <p className="text-sm text-muted-foreground">Claude Sonnet 4.5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1000">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
                <span className="mx-2">•</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Start with 3 free blogs</span>
                <span className="mx-2">•</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 bg-gradient-to-b from-muted/30 to-background border-t border-border">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16 space-y-4">
              <Badge className="px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 text-primary">
                <Zap className="w-4 h-4 mr-2" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Everything you need to create
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  professional content
                </span>
              </h2>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Intelligent Web Search</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tavily AI searches the entire web to find the most current and relevant sources, 
                  ensuring your content is based on up-to-date information.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Deep Analysis & Research</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gemini 3 Pro analyzes sources, extracts key insights, and creates a comprehensive 
                  research foundation before any writing begins.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Expert-Level Writing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Claude Sonnet 4.5 transforms research into engaging, well-structured content 
                  that reads like it was written by a subject matter expert.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Rich Content Editor</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built-in editor with image upload, markdown support, live preview, and 
                  drag-and-drop functionality for seamless content creation.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Publishing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  One-click publishing to your public blog with SEO optimization, 
                  automatic social media previews, and search engine friendly URLs.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Source Citations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every blog post includes properly formatted citations and source links, 
                  building trust and credibility with your readers.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                <div className="text-left">
                  <h3 className="font-semibold text-lg mb-1">Ready to transform your content creation?</h3>
                  <p className="text-sm text-muted-foreground">Join creators who save 10+ hours per blog post</p>
                </div>
                <Link href="/signup">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                UniLearner
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered content creation platform that transforms topics into comprehensive, well-researched blog posts.
              </p>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="/signup" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Get Started
                </Link>
                <Link href="/login" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm">
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
                <a href="mailto:help@unilearner.com" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
                <a href="mailto:support@unilearner.com" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Technical Support
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} UniLearner. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for content creators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
