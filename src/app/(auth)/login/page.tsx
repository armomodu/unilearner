'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            toast.error('Login failed', {
                description: error instanceof Error ? error.message : 'Invalid credentials',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            disabled={loading}
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/reset-password"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            disabled={loading}
                            className="bg-background/50"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
