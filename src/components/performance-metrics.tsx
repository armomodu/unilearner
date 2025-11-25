'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Search, 
  Brain, 
  PenTool, 
  Zap,
  TrendingUp,
  Timer
} from 'lucide-react';
import { 
  PerformanceMetrics,
  getPerformanceSummary,
  getPerformanceRating,
  getWritingSpeed
} from '@/lib/utils/performance';

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
  contentWordCount?: number;
  compact?: boolean;
}

export function PerformanceMetricsCard({ 
  metrics, 
  contentWordCount = 0,
  compact = false 
}: PerformanceMetricsProps) {
  const summary = getPerformanceSummary(metrics);
  const rating = getPerformanceRating(metrics.totalDurationMs);
  const writingSpeed = getWritingSpeed(contentWordCount, metrics.writerDurationMs);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{summary.totalTime}</span>
        </div>
        <Badge variant="secondary" className={rating.color}>
          {rating.label}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Performance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Total Time:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{summary.totalTime}</span>
            <Badge variant="outline" className={rating.color}>
              {rating.label}
            </Badge>
          </div>
        </div>

        {/* Phase Breakdown */}
        {metrics.totalDurationMs && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Phase Breakdown
            </h4>
            
            {/* Search Phase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span>Web Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{summary.searchTime}</span>
                  <span className="text-muted-foreground">({summary.percentages.search}%)</span>
                </div>
              </div>
              <Progress value={summary.percentages.search} className="h-2" />
            </div>

            {/* Research Phase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span>Research Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{summary.researchTime}</span>
                  <span className="text-muted-foreground">({summary.percentages.research}%)</span>
                </div>
              </div>
              <Progress value={summary.percentages.research} className="h-2" />
            </div>

            {/* Writing Phase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-green-500" />
                  <span>Content Writing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{summary.writerTime}</span>
                  <span className="text-muted-foreground">({summary.percentages.writer}%)</span>
                </div>
              </div>
              <Progress value={summary.percentages.writer} className="h-2" />
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        {(writingSpeed !== '--' || summary.completedAt !== '--') && (
          <div className="pt-4 border-t space-y-2">
            {writingSpeed !== '--' && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span>Writing Speed:</span>
                </div>
                <span className="font-medium">{writingSpeed}</span>
              </div>
            )}
            
            {summary.completedAt !== '--' && (
              <div className="flex items-center justify-between text-sm">
                <span>Completed:</span>
                <span className="text-muted-foreground">{summary.completedAt}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InlinePerformanceMetrics({ 
  metrics, 
  contentWordCount = 0 
}: PerformanceMetricsProps) {
  const summary = getPerformanceSummary(metrics);
  const rating = getPerformanceRating(metrics.totalDurationMs);

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Timer className="w-3 h-3" />
        <span>{summary.totalTime}</span>
      </div>
      <Badge variant="outline" className={`${rating.color} text-xs`}>
        {rating.label}
      </Badge>
    </div>
  );
}