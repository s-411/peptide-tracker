'use client';

import { TimingPatternAnalytics } from '@/types/database';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

interface TimingChartProps {
  data: TimingPatternAnalytics;
}

export function TimingChart({ data }: TimingChartProps) {
  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getConsistencyBarColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 font-heading text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Timing Patterns
        </h3>
        <div className="text-right">
          <div className={`text-lg font-bold ${getConsistencyColor(data.consistencyScore)}`}>
            {data.consistencyScore.toFixed(0)}%
          </div>
          <div className="text-xs text-gray">Consistency</div>
        </div>
      </div>

      {/* Consistency Score Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray text-sm">Timing Consistency</span>
          <span className="text-white text-sm">{data.consistencyScore.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray/20 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getConsistencyBarColor(data.consistencyScore)}`}
            style={{ width: `${Math.min(data.consistencyScore, 100)}%` }}
          />
        </div>
      </div>

      {/* Optimal Time Window */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">Optimal Injection Window</span>
        </div>
        <div className="text-white text-lg font-bold">
          {data.optimalTimeWindow.start} - {data.optimalTimeWindow.end}
        </div>
        <div className="text-gray text-sm">
          Your most consistent injection time: {data.averageTime}
        </div>
      </div>

      {/* Most Common Times */}
      {data.mostCommonTimes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Most Common Injection Times</h4>
          <div className="space-y-2">
            {data.mostCommonTimes.slice(0, 5).map((timeData, index) => (
              <div key={timeData.time} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-primary text-dark' : 'bg-gray/20 text-gray'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-white">{timeData.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray/20 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(timeData.count / Math.max(...data.mostCommonTimes.map(t => t.count))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-gray text-sm w-8 text-right">{timeData.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day of Week Patterns */}
      {data.dayOfWeekPatterns.length > 0 && (
        <div className="border-t border-gray/20 pt-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Weekly Patterns
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {data.dayOfWeekPatterns.map((dayData) => (
              <div key={dayData.day} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm w-20">{dayData.day.slice(0, 3)}</span>
                  <span className="text-gray text-sm">{dayData.averageTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getConsistencyBarColor(dayData.consistency)}`}
                      style={{ width: `${Math.min(dayData.consistency, 100)}%` }}
                    />
                  </div>
                  <span className="text-gray text-xs w-8 text-right">
                    {dayData.consistency.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timing Insights */}
      <div className="border-t border-gray/20 pt-4 mt-4">
        <div className="text-sm">
          {data.consistencyScore >= 80 ? (
            <div className="text-success">
              ✓ Excellent timing consistency! Your regular schedule supports optimal peptide effectiveness.
            </div>
          ) : data.consistencyScore >= 60 ? (
            <div className="text-warning">
              ⚠ Good timing consistency. Consider setting reminders to maintain regular intervals.
            </div>
          ) : (
            <div className="text-error">
              ! Inconsistent timing may affect protocol effectiveness. Try to inject at the same time each day.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}