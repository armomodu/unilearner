'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublicBlogSearchProps {
    initialQuery?: string;
    initialSort?: string;
    totalBlogs: number;
    className?: string;
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export function PublicBlogSearch({ 
    initialQuery = '', 
    initialSort = 'newest',
    totalBlogs,
    className 
}: PublicBlogSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [sortBy, setSortBy] = useState<SortOption>(initialSort as SortOption);
    const [showFilters, setShowFilters] = useState(false);

    // Update URL with search parameters
    const updateURL = (query: string, sort: string) => {
        const params = new URLSearchParams();
        if (query.trim()) params.set('search', query.trim());
        if (sort !== 'newest') params.set('sort', sort);
        
        const newURL = params.toString() 
            ? `/blog?${params.toString()}`
            : '/blog';
        
        router.replace(newURL);
    };

    // Handle search input
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        updateURL(query, sortBy);
    };

    // Handle sort change
    const handleSortChange = (sort: SortOption) => {
        setSortBy(sort);
        updateURL(searchQuery, sort);
    };

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('');
        setSortBy('newest');
        router.replace('/blog');
    };

    const hasActiveFilters = searchQuery.trim() || sortBy !== 'newest';

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== initialQuery) {
                updateURL(searchQuery, sortBy);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, sortBy, initialQuery]);

    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* Main Search Bar */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search blog posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-24 py-3 text-base bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-sm focus-visible:shadow-md transition-shadow"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "gap-1 h-8",
                                showFilters && "bg-muted"
                            )}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Filters</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Sort Options */}
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Sort by</label>
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest first</SelectItem>
                                    <SelectItem value="oldest">Oldest first</SelectItem>
                                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                                    <SelectItem value="title-desc">Title Z-A</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Search Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span>
                        {totalBlogs} blog{totalBlogs !== 1 ? 's' : ''} available
                        {hasActiveFilters && ' (filtered)'}
                    </span>
                    {hasActiveFilters && (
                        <div className="flex gap-1">
                            {searchQuery.trim() && (
                                <Badge variant="secondary" className="text-xs px-2 py-1">
                                    &ldquo;{searchQuery}&rdquo;
                                </Badge>
                            )}
                            {sortBy !== 'newest' && (
                                <Badge variant="secondary" className="text-xs px-2 py-1">
                                    {sortBy.replace('-', ' ')}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Search Tips */}
                <div className="hidden md:block text-xs text-muted-foreground/70">
                    <span>💡 Try searching for topics, keywords, or technologies</span>
                </div>
            </div>

            {/* Popular Searches */}
            {!hasActiveFilters && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Popular topics:</div>
                    <div className="flex flex-wrap gap-2">
                        {['AI', 'React', 'JavaScript', 'Python', 'Web Development', 'Machine Learning'].map((topic) => (
                            <Badge
                                key={topic}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-colors"
                                onClick={() => handleSearch(topic)}
                            >
                                {topic}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}