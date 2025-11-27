'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, ExternalLink, Trash2, X } from 'lucide-react';
import { DeleteBlogButton } from '@/components/delete-blog-button';
import { Checkbox } from '@/components/ui/checkbox';
import { TogglePublishButton } from '@/components/toggle-publish-button';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useState } from 'react';
import { DashboardSearch } from '@/components/dashboard-search';
import { InlinePerformanceMetrics } from '@/components/performance-metrics';
import type { BlogGenerationSummary } from '@/types/blog';

interface Blog {
    id: string;
    title: string;
    slug: string | null;
    status: string;
    createdAt: string;
    _count: {
        sources: number;
    };
    generation: BlogGenerationSummary | null;
}

interface BlogsTableProps {
    blogs: Blog[];
}

export function BlogsTable({ blogs }: BlogsTableProps) {
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>(blogs);
    const {
        selectedBlogs,
        isDeleting,
        onBlogSelect,
        onSelectAll,
        clearSelection,
        bulkDelete,
        isAllSelected,
        isSomeSelected,
    } = useBulkDelete();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const allBlogIds = filteredBlogs.map(blog => blog.id);
    const isAllBlogsSelected = isAllSelected(filteredBlogs.length);
    const areSomeBlogsSelected = isSomeSelected();

    const handleBulkDelete = async () => {
        await bulkDelete();
        setShowDeleteDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <DashboardSearch 
                blogs={blogs}
                onFilteredResults={setFilteredBlogs}
            />

            {/* Bulk Actions Bar */}
            {areSomeBlogsSelected && (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                            {selectedBlogs.length} blog{selectedBlogs.length > 1 ? 's' : ''} selected
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSelection}
                            className="gap-2"
                        >
                            <X className="w-3 h-3" />
                            Clear Selection
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="gap-2"
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected ({selectedBlogs.length})
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={isAllBlogsSelected}
                                    onCheckedChange={(checked) => onSelectAll(checked as boolean, allBlogIds)}
                                    aria-label="Select all blogs"
                                />
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sources</TableHead>
                            <TableHead>Performance</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBlogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {blogs.length === 0 ? 'No blogs found.' : 'No blogs match your search criteria.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedBlogs.includes(blog.id)}
                                            onCheckedChange={(checked) => onBlogSelect(blog.id, checked as boolean)}
                                            aria-label={`Select ${blog.title}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{blog.title}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                                            blog.status === 'GENERATING' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {blog.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{blog._count.sources}</TableCell>
                                    <TableCell>
                                        {blog.generation && blog.generation.totalDurationMs ? (
                                            <InlinePerformanceMetrics 
                                                metrics={{
                                                    totalDurationMs: blog.generation.totalDurationMs,
                                                    searchDurationMs: blog.generation.searchDurationMs,
                                                    researchDurationMs: blog.generation.researchDurationMs,
                                                    writerDurationMs: blog.generation.writerDurationMs,
                                                    completedAt: blog.generation.completedAt ? new Date(blog.generation.completedAt) : null,
                                                    createdAt: new Date(blog.createdAt),
                                                }} 
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">--</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/dashboard/blogs/${blog.id}`}>
                                                <Button variant="ghost" size="icon" title="Edit blog">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            {blog.status === 'PUBLISHED' && blog.slug && (
                                                <Link href={`/blog/${blog.slug}`} target="_blank">
                                                    <Button variant="ghost" size="icon" title="View published blog">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            )}
                                            {(blog.status === 'DRAFT' || blog.status === 'PUBLISHED') && (
                                                <TogglePublishButton
                                                    blogId={blog.id}
                                                    blogTitle={blog.title}
                                                    isPublished={blog.status === 'PUBLISHED'}
                                                />
                                            )}
                                            <DeleteBlogButton 
                                                blogId={blog.id}
                                                blogTitle={blog.title}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Blogs</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <div>Are you sure you want to delete these {selectedBlogs.length} blog posts?</div>
                            <div className="max-h-32 overflow-y-auto bg-muted/50 p-2 rounded text-sm">
                                {selectedBlogs.map(blogId => {
                                    const blog = filteredBlogs.find(b => b.id === blogId);
                                    return (
                                        <div key={blogId} className="font-medium">
                                            • {blog?.title || 'Unknown Blog'}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                This action cannot be undone. All selected blog posts and their associated data will be permanently removed.
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? 'Deleting...' : `Delete ${selectedBlogs.length} Blog${selectedBlogs.length > 1 ? 's' : ''}`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
