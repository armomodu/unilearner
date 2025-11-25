export interface BlogGenerationSummary {
    id?: string;
    status?: string;
    currentStep?: string | null;
    searchComplete?: boolean;
    researchComplete?: boolean;
    writerComplete?: boolean;
    totalDurationMs?: number | null;
    searchDurationMs?: number | null;
    researchDurationMs?: number | null;
    writerDurationMs?: number | null;
    completedAt?: string | Date | null;
}
