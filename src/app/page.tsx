import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            UniLearner
          </div>
          <nav className="flex items-center gap-4">
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
      <main className="flex-1">
        <section className="py-24 md:py-32 px-4 text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Content Generation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Create High-Quality Blogs in <span className="text-primary">Minutes</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            UniLearner uses advanced AI agents to search, research, and write comprehensive blog posts for you. Just provide a topic, and we handle the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-lg gap-2">
                Start Generating <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Smart Search</h3>
                <p className="text-muted-foreground">
                  Our agents scour the web for the most relevant and up-to-date sources for your topic.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Deep Research</h3>
                <p className="text-muted-foreground">
                  Information is synthesized into key insights and a structured outline before writing begins.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Human-Like Writing</h3>
                <p className="text-muted-foreground">
                  Claude Sonnet generates engaging, SEO-optimized content that reads like it was written by an expert.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UniLearner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
