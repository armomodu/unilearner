'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Blog {
    id: string;
    title: string;
    slug: string | null;
    status: string;
    createdAt: string;
    _count: {
        sources: number;
    };
}

interface DashboardSearchProps {
    blogs: Blog[];
    onFilteredResults: (filteredBlogs: Blog[]) => void;
    className?: string;
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'sources-desc' | 'sources-asc';
type StatusFilter = 'all' | 'PUBLISHED' | 'DRAFT' | 'GENERATING';

export function DashboardSearch({ blogs, onFilteredResults, className }: DashboardSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showFilters, setShowFilters] = useState(false);

    // Calculate counts for status badges
    const statusCounts = useMemo(() => {
        const counts = {
            all: blogs.length,
            PUBLISHED: blogs.filter(blog => blog.status === 'PUBLISHED').length,
            DRAFT: blogs.filter(blog => blog.status === 'DRAFT').length,
            GENERATING: blogs.filter(blog => blog.status === 'GENERATING').length,
        };
        return counts;
    }, [blogs]);

    // Filter and sort blogs
    const filteredAndSortedBlogs = useMemo(() => {
        let filtered = blogs;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(blog => 
                blog.title.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(blog => blog.status === statusFilter);
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'sources-desc':
                    return b._count.sources - a._count.sources;
                case 'sources-asc':
                    return a._count.sources - b._count.sources;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [blogs, searchQuery, statusFilter, sortBy]);

    // Update parent component when filters change
    useEffect(() => {
        onFilteredResults(filteredAndSortedBlogs);
    }, [filteredAndSortedBlogs, onFilteredResults]);

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setSortBy('newest');
    };

    const hasActiveFilters = searchQuery.trim() || statusFilter !== 'all' || sortBy !== 'newest';

    return (
        <div className={cn("space-y-4", className)}>
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search blogs by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "gap-2",
                        showFilters && "bg-muted"
                    )}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            {/* Filter Controls */}
            {showFilters && (
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                    <div className="flex flex-wrap gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All ({statusCounts.all})
                                    </SelectItem>
                                    <SelectItem value="PUBLISHED">
                                        Published ({statusCounts.PUBLISHED})
                                    </SelectItem>
                                    <SelectItem value="DRAFT">
                                        Draft ({statusCounts.DRAFT})
                                    </SelectItem>
                                    <SelectItem value="GENERATING">
                                        Generating ({statusCounts.GENERATING})
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort by</label>
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest first</SelectItem>
                                    <SelectItem value="oldest">Oldest first</SelectItem>
                                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                                    <SelectItem value="title-desc">Title Z-A</SelectItem>
                                    <SelectItem value="sources-desc">Most sources</SelectItem>
                                    <SelectItem value="sources-asc">Fewest sources</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="gap-1"
                            >
                                <X className="w-3 h-3" />
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span>
                        {filteredAndSortedBlogs.length} of {blogs.length} blogs
                        {hasActiveFilters && ' (filtered)'}
                    </span>
                    {hasActiveFilters && (
                        <div className="flex gap-1">
                            {searchQuery.trim() && (
                                <Badge variant="secondary" className="text-xs">
                                    "{searchQuery}"
                                </Badge>
                            )}
                            {statusFilter !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                    {statusFilter}
                                </Badge>
                            )}
                            {sortBy !== 'newest' && (
                                <Badge variant="secondary" className="text-xs">
                                    {sortBy.replace('-', ' ')}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
                
                {filteredAndSortedBlogs.length === 0 && blogs.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                        No matching results
                    </span>
                )}
            </div>
        </div>
    );
}