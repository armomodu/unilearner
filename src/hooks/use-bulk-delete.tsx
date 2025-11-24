'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useBulkDelete() {
    const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const onBlogSelect = (blogId: string, checked: boolean) => {
        if (checked) {
            setSelectedBlogs(prev => [...prev, blogId]);
        } else {
            setSelectedBlogs(prev => prev.filter(id => id !== blogId));
        }
    };

    const onSelectAll = (checked: boolean, allBlogIds: string[]) => {
        if (checked) {
            setSelectedBlogs(allBlogIds);
        } else {
            setSelectedBlogs([]);
        }
    };

    const clearSelection = () => {
        setSelectedBlogs([]);
    };

    const bulkDelete = async () => {
        setIsDeleting(true);
        try {
            const deletePromises = selectedBlogs.map(blogId =>
                fetch(`/api/blogs/${blogId}`, { method: 'DELETE' })
            );

            const responses = await Promise.all(deletePromises);
            const failedDeletes = responses.filter(response => !response.ok);

            if (failedDeletes.length === 0) {
                toast.success(`Successfully deleted ${selectedBlogs.length} blog${selectedBlogs.length > 1 ? 's' : ''}`);
                setSelectedBlogs([]);
                router.refresh();
            } else {
                toast.error(`Failed to delete ${failedDeletes.length} blog${failedDeletes.length > 1 ? 's' : ''}`);
            }
        } catch (error) {
            console.error('Bulk delete failed:', error);
            toast.error('Failed to delete blogs');
        } finally {
            setIsDeleting(false);
        }
    };

    const isAllSelected = (totalCount: number) => selectedBlogs.length === totalCount && totalCount > 0;
    const isSomeSelected = () => selectedBlogs.length > 0;

    return {
        selectedBlogs,
        isDeleting,
        onBlogSelect,
        onSelectAll,
        clearSelection,
        bulkDelete,
        isAllSelected,
        isSomeSelected,
    };
}