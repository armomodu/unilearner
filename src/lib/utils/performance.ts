/**
 * Performance metrics utilities for blog generation
 */

export interface PerformanceMetrics {
  totalDurationMs?: number | null;
  searchDurationMs?: number | null;
  researchDurationMs?: number | null;
  writerDurationMs?: number | null;
  searchStartedAt?: Date | null;
  searchCompletedAt?: Date | null;
  researchStartedAt?: Date | null;
  researchCompletedAt?: Date | null;
  writerStartedAt?: Date | null;
  writerCompletedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(durationMs: number | null | undefined): string {
  if (!durationMs) return '--';
  
  const seconds = Math.round(durationMs / 1000);
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Calculate percentage of total time spent on each phase
 */
export function calculatePhasePercentages(metrics: PerformanceMetrics): {
  search: number;
  research: number;
  writer: number;
} {
  const { searchDurationMs, researchDurationMs, writerDurationMs, totalDurationMs } = metrics;
  
  if (!totalDurationMs || totalDurationMs === 0) {
    return { search: 0, research: 0, writer: 0 };
  }
  
  return {
    search: searchDurationMs ? Math.round((searchDurationMs / totalDurationMs) * 100) : 0,
    research: researchDurationMs ? Math.round((researchDurationMs / totalDurationMs) * 100) : 0,
    writer: writerDurationMs ? Math.round((writerDurationMs / totalDurationMs) * 100) : 0,
  };
}

/**
 * Get performance summary for display
 */
export function getPerformanceSummary(metrics: PerformanceMetrics): {
  totalTime: string;
  searchTime: string;
  researchTime: string;
  writerTime: string;
  percentages: {
    search: number;
    research: number;
    writer: number;
  };
  completedAt: string;
} {
  const percentages = calculatePhasePercentages(metrics);
  
  return {
    totalTime: formatDuration(metrics.totalDurationMs),
    searchTime: formatDuration(metrics.searchDurationMs),
    researchTime: formatDuration(metrics.researchDurationMs),
    writerTime: formatDuration(metrics.writerDurationMs),
    percentages,
    completedAt: metrics.completedAt?.toLocaleString() || '--',
  };
}

/**
 * Get generation speed (words per minute) for writer phase
 */
export function getWritingSpeed(
  contentWordCount: number,
  writerDurationMs: number | null | undefined
): string {
  if (!writerDurationMs || writerDurationMs === 0 || contentWordCount === 0) {
    return '--';
  }
  
  const minutes = writerDurationMs / (1000 * 60);
  const wordsPerMinute = Math.round(contentWordCount / minutes);
  
  return `${wordsPerMinute} wpm`;
}

/**
 * Determine performance rating based on total generation time
 */
export function getPerformanceRating(totalDurationMs: number | null | undefined): {
  rating: 'excellent' | 'good' | 'average' | 'slow' | 'unknown';
  color: string;
  label: string;
} {
  if (!totalDurationMs) {
    return {
      rating: 'unknown',
      color: 'text-muted-foreground',
      label: 'Unknown'
    };
  }
  
  const minutes = totalDurationMs / (1000 * 60);
  
  if (minutes < 2) {
    return {
      rating: 'excellent',
      color: 'text-green-600',
      label: 'Excellent'
    };
  } else if (minutes < 5) {
    return {
      rating: 'good',
      color: 'text-blue-600',
      label: 'Good'
    };
  } else if (minutes < 10) {
    return {
      rating: 'average',
      color: 'text-yellow-600',
      label: 'Average'
    };
  } else {
    return {
      rating: 'slow',
      color: 'text-red-600',
      label: 'Slow'
    };
  }
}