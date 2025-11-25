'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteBlogButtonProps {
    blogId: string;
    blogTitle: string;
    variant?: 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DeleteBlogButton({ 
    blogId, 
    blogTitle, 
    variant = 'ghost', 
    size = 'icon' 
}: DeleteBlogButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/blogs/${blogId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Blog deleted successfully');
                setIsOpen(false);
                // Refresh the page to update the blog list
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to delete blog');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete blog');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>Are you sure you want to delete this blog post?</p>
                        <p className="font-medium text-foreground">&quot;{blogTitle}&quot;</p>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone. The blog post and all its associated data will be permanently removed.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
