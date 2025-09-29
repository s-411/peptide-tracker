'use client';

import type { WeeklyProgressTrend } from '@/types/database';

interface ProgressChartProps {
  trends: WeeklyProgressTrend[];
}

export function ProgressChart({ trends }: ProgressChartProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray text-small">No historical data available</p>
      </div>
    );
  }

  const maxProgress = Math.max(...trends.map(t => t.totalProgress), 100);
  const chartHeight = 60;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-white font-medium text-small">Progress Trends (Last 6 Weeks)</h4>

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between gap-1" style={{ height: `${chartHeight}px` }}>
        {trends.map((trend, index) => {
          const barHeight = (trend.totalProgress / maxProgress) * chartHeight;
          const isLast = index === trends.length - 1;

          return (
            <div key={trend.weekStart.toISOString()} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isLast ? 'bg-primary' : 'bg-gray/50'
                }`}
                style={{ height: `${Math.max(barHeight, 2)}px` }}
                title={`Week of ${formatDate(trend.weekStart)}: ${trend.totalProgress}%`}
              />
              <div className="mt-1 text-xs text-gray text-center">
                {formatDate(trend.weekStart)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Indicators */}
      <div className="flex justify-between text-xs text-gray">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}