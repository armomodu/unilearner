'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GenerationProgressProps {
    blogId: string;
    initialStatus?: string;
}

interface GenerationState {
    status: 'PENDING' | 'SEARCHING' | 'RESEARCHING' | 'WRITING' | 'COMPLETED' | 'FAILED';
    currentStep: string;
    searchComplete: boolean;
    researchComplete: boolean;
    writerComplete: boolean;
    error?: string;
}

export function GenerationProgress({ blogId }: GenerationProgressProps) {
    const router = useRouter();
    const [state, setState] = useState<GenerationState | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/blogs/${blogId}/status`);
                if (!res.ok) return;

                const data = await res.json();
                if (data.generation) {
                    setState(data.generation);

                    // Calculate progress
                    let newProgress = 0;
                    if (data.generation.searchComplete) newProgress += 33;
                    if (data.generation.researchComplete) newProgress += 33;
                    if (data.generation.writerComplete) newProgress += 34;

                    setProgress(newProgress);

                    // Stop polling if completed or failed
                    if (data.generation.status === 'COMPLETED' || data.generation.status === 'FAILED') {
                        clearInterval(intervalId);
                        if (data.generation.status === 'COMPLETED') {
                            router.refresh();
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };

        // Initial fetch
        fetchStatus();

        // Poll every 2 seconds
        const intervalId = setInterval(fetchStatus, 2000);

        return () => clearInterval(intervalId);
    }, [blogId, router]);

    if (!state) return null;

    if (state.status === 'COMPLETED') {
        return (
            <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="pt-6 flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <div>
                        <h3 className="font-semibold text-green-500">Generation Complete</h3>
                        <p className="text-sm text-muted-foreground">Your blog post is ready for review.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (state.status === 'FAILED') {
        return (
            <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="pt-6 flex items-center gap-4">
                    <XCircle className="w-8 h-8 text-destructive" />
                    <div>
                        <h3 className="font-semibold text-destructive">Generation Failed</h3>
                        <p className="text-sm text-muted-foreground">{state.error || 'An unknown error occurred.'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    Generating Blog Post...
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>{state.currentStep}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StepStatus
                        label="Search"
                        active={state.status === 'SEARCHING'}
                        completed={state.searchComplete}
                    />
                    <StepStatus
                        label="Research"
                        active={state.status === 'RESEARCHING'}
                        completed={state.researchComplete}
                    />
                    <StepStatus
                        label="Writing"
                        active={state.status === 'WRITING'}
                        completed={state.writerComplete}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function StepStatus({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
    return (
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${completed ? 'bg-green-500/10 border-green-500/20 text-green-500' :
            active ? 'bg-primary/10 border-primary/20 text-primary' :
                'bg-muted border-border text-muted-foreground'
            }`}>
            {completed ? (
                <CheckCircle2 className="w-4 h-4" />
            ) : active ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current" />
            )}
            <span className="font-medium text-sm">{label}</span>
        </div>
    );
}
