'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SignupPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/api/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }

            toast.success('Account created', {
                description: 'Please check your email to verify your account.',
            });

            // Optional: Redirect to login or a verification pending page
            // router.push('/login');
        } catch (error) {
            toast.error('Signup failed', {
                description: error instanceof Error ? error.message : 'Could not create account',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Enter your email below to create your account
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
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            disabled={loading}
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            disabled={loading}
                            className="bg-background/50"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
