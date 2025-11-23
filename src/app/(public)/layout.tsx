import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        UniLearner
                    </Link>

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

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t border-border py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} UniLearner. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
