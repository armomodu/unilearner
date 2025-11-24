'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PublishBlogButtonProps {
    blogId: string;
    blogTitle: string;
    isPublished: boolean;
    slug?: string | null;
}

export function PublishBlogButton({ 
    blogId, 
    blogTitle, 
    isPublished, 
    slug 
}: PublishBlogButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleTogglePublish = async () => {
        setIsLoading(true);
        try {
            const endpoint = isPublished ? 'unpublish' : 'publish';
            const response = await fetch(`/api/blogs/${blogId}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                const action = isPublished ? 'unpublished' : 'published';
                toast.success(`Blog ${action} successfully`);
                
                // Refresh the page to update the status and get the new slug if published
                router.refresh();
            } else {
                toast.error(data.error || `Failed to ${isPublished ? 'unpublish' : 'publish'} blog`);
            }
        } catch (error) {
            console.error('Publish/unpublish failed:', error);
            toast.error(`Failed to ${isPublished ? 'unpublish' : 'publish'} blog`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleTogglePublish}
            disabled={isLoading}
            variant={isPublished ? 'destructive' : 'default'}
            className="gap-2 min-w-[140px]"
        >
            {isPublished ? (
                <>
                    <EyeOff className="w-4 h-4" />
                    {isLoading ? 'Unpublishing...' : 'Unpublish'}
                </>
            ) : (
                <>
                    <Globe className="w-4 h-4" />
                    {isLoading ? 'Publishing...' : 'Publish Now'}
                </>
            )}
        </Button>
    );
}