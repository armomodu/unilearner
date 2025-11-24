'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface TogglePublishButtonProps {
    blogId: string;
    blogTitle: string;
    isPublished: boolean;
}

export function TogglePublishButton({ 
    blogId, 
    blogTitle, 
    isPublished 
}: TogglePublishButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleTogglePublish = async () => {
        setIsLoading(true);
        try {
            const endpoint = isPublished ? 'unpublish' : 'publish';
            const response = await fetch(`/api/blogs/${blogId}/${endpoint}`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                const action = isPublished ? 'unpublished' : 'published';
                toast.success(`"${blogTitle}" ${action} successfully`);
                router.refresh();
            } else {
                toast.error(data.error || `Failed to ${isPublished ? 'unpublish' : 'publish'} blog`);
            }
        } catch (error) {
            console.error('Toggle publish failed:', error);
            toast.error(`Failed to ${isPublished ? 'unpublish' : 'publish'} blog`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePublish}
            disabled={isLoading}
            title={isPublished ? 'Unpublish blog' : 'Publish blog'}
            className={isPublished ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950' : 'text-muted-foreground hover:text-foreground'}
        >
            {isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
    );
}