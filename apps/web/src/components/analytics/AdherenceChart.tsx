'use client';

import { ProtocolAdherenceData } from '@/types/database';
import { Target, TrendingUp, Calendar } from 'lucide-react';

interface AdherenceChartProps {
  data: ProtocolAdherenceData[];
}

export function AdherenceChart({ data }: AdherenceChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <h3 className="text-h4 font-heading text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Protocol Adherence
        </h3>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray/50 mx-auto mb-2" />
          <p className="text-gray">No protocol data available</p>
        </div>
      </div>
    );
  }

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 75) return 'text-warning';
    return 'text-error';
  };

  const getAdherenceBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-error';
  };

  const averageAdherence = data.reduce((sum, item) => sum + item.adherencePercentage, 0) / data.length;

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 font-heading text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Protocol Adherence
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray">Average:</span>
          <span className={`font-bold ${getAdherenceColor(averageAdherence)}`}>
            {averageAdherence.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((protocol) => (
          <div key={protocol.protocolId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium">{protocol.protocolName}</h4>
                <p className="text-gray text-sm">{protocol.peptideName}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getAdherenceColor(protocol.adherencePercentage)}`}>
                  {protocol.adherencePercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray">
                  {protocol.actualDoses}/{protocol.totalPlannedDoses} doses
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getAdherenceBarColor(protocol.adherencePercentage)}`}
                style={{ width: `${Math.min(protocol.adherencePercentage, 100)}%` }}
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-gray">Current Streak</div>
                <div className="text-white font-medium">{protocol.streakDays} days</div>
              </div>
              <div>
                <div className="text-gray">Longest Streak</div>
                <div className="text-white font-medium">{protocol.longestStreak} days</div>
              </div>
              <div>
                <div className="text-gray">Consistency</div>
                <div className="text-white font-medium">{protocol.doseConsistencyScore.toFixed(0)}%</div>
              </div>
            </div>

            {protocol.missedDoses > 0 && (
              <div className="flex items-center gap-2 text-xs text-warning">
                <TrendingUp className="w-3 h-3" />
                <span>{protocol.missedDoses} missed doses</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-success">
              {data.filter(p => p.adherencePercentage >= 90).length}
            </div>
            <div className="text-xs text-gray">Excellent (≥90%)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">
              {data.filter(p => p.adherencePercentage >= 75 && p.adherencePercentage < 90).length}
            </div>
            <div className="text-xs text-gray">Good (75-89%)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-error">
              {data.filter(p => p.adherencePercentage < 75).length}
            </div>
            <div className="text-xs text-gray">Needs Work (&lt;75%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}