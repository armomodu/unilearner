/**
 * Database fallback utilities for graceful degradation
 * when database schema is incomplete or unavailable
 */

interface GenerationLike {
  id?: string;
  status?: string;
  currentStep?: string | null;
  searchComplete?: boolean;
  researchComplete?: boolean;
  writerComplete?: boolean;
  error?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  totalDurationMs?: number | null;
  searchDurationMs?: number | null;
  researchDurationMs?: number | null;
  writerDurationMs?: number | null;
  completedAt?: Date | null;
}

/**
 * Safe blog generation data with fallback values
 */
export function sanitizeGenerationData(generation: GenerationLike | null | undefined): {
  id?: string;
  status: string;
  currentStep?: string | null;
  searchComplete: boolean;
  researchComplete: boolean;
  writerComplete: boolean;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalDurationMs: number | null;
  searchDurationMs: number | null;
  researchDurationMs: number | null;
  writerDurationMs: number | null;
  completedAt: Date | null;
} | null {
  if (!generation) return null;
  
  return {
    id: generation.id,
    status: generation.status || 'PENDING',
    currentStep: generation.currentStep ?? null,
    searchComplete: generation.searchComplete ?? false,
    researchComplete: generation.researchComplete ?? false,
    writerComplete: generation.writerComplete ?? false,
    error: generation.error ?? null,
    createdAt: generation.createdAt ?? new Date(),
    updatedAt: generation.updatedAt ?? new Date(),
    // Performance metrics with fallback to null
    totalDurationMs: generation.totalDurationMs ?? null,
    searchDurationMs: generation.searchDurationMs ?? null,
    researchDurationMs: generation.researchDurationMs ?? null,
    writerDurationMs: generation.writerDurationMs ?? null,
    completedAt: generation.completedAt ?? null,
  };
}

/**
 * Check if performance metrics are available in the database
 */
export function hasPerformanceMetrics(generation: GenerationLike | null | undefined): boolean {
  return !!generation && (
    generation.totalDurationMs !== undefined ||
    generation.searchDurationMs !== undefined ||
    generation.researchDurationMs !== undefined ||
    generation.writerDurationMs !== undefined
  );
}

/**
 * Get display-ready generation status
 */
export function getGenerationStatusDisplay(generation: GenerationLike | null | undefined): {
  status: string;
  isComplete: boolean;
  hasError: boolean;
  progress: number;
} {
  if (!generation) {
    return {
      status: 'Unknown',
      isComplete: false,
      hasError: false,
      progress: 0,
    };
  }

  const isComplete = generation.status === 'COMPLETED';
  const hasError = !!generation.error;
  
  let progress = 0;
  if (generation.searchComplete) progress += 33;
  if (generation.researchComplete) progress += 33;
  if (generation.writerComplete) progress += 34;
  
  return {
    status: generation.status || 'PENDING',
    isComplete,
    hasError,
    progress: Math.min(progress, 100),
  };
}
