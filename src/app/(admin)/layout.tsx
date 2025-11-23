import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/signout-button';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        UniLearner
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/dashboard/blogs">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <FileText className="w-4 h-4" />
                            My Blogs
                        </Button>
                    </Link>
                    <Link href="/dashboard/blogs/new">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <PlusCircle className="w-4 h-4" />
                            New Blog
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                    <div className="px-4 py-2 text-sm text-muted-foreground truncate">
                        {session.user.email}
                    </div>
                    <SignOutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
