'use client';

import { DoseVarianceAnalytics } from '@/types/database';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DoseVarianceChartProps {
  data: DoseVarianceAnalytics[];
}

export function DoseVarianceChart({ data }: DoseVarianceChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <h3 className="text-h4 font-heading text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Dose Variance Analysis
        </h3>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray/50 mx-auto mb-2" />
          <p className="text-gray">No dose variance data available</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: 'stable' | 'increasing' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-error" />;
      default:
        return <Minus className="w-4 h-4 text-gray" />;
    }
  };

  const getTrendColor = (trend: 'stable' | 'increasing' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return 'text-success';
      case 'decreasing':
        return 'text-error';
      default:
        return 'text-gray';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 75) return 'text-warning';
    return 'text-error';
  };

  const getAccuracyBarColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-success';
    if (accuracy >= 75) return 'bg-warning';
    return 'bg-error';
  };

  const averageAccuracy = data.reduce((sum, item) => sum + item.accuracyPercentage, 0) / data.length;

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 font-heading text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Dose Variance Analysis
        </h3>
        <div className="text-right">
          <div className={`text-lg font-bold ${getAccuracyColor(averageAccuracy)}`}>
            {averageAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-gray">Avg Accuracy</div>
        </div>
      </div>

      <div className="space-y-6">
        {data.map((variance, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {getTrendIcon(variance.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(variance.trend)}`}>
                    {variance.trend.charAt(0).toUpperCase() + variance.trend.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getAccuracyColor(variance.accuracyPercentage)}`}>
                  {variance.accuracyPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray">Accuracy</div>
              </div>
            </div>

            {/* Accuracy Bar */}
            <div className="w-full bg-gray/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getAccuracyBarColor(variance.accuracyPercentage)}`}
                style={{ width: `${Math.min(variance.accuracyPercentage, 100)}%` }}
              />
            </div>

            {/* Dose Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray/10 rounded-lg p-3">
                <div className="text-gray">Target Dose</div>
                <div className="text-white font-bold">{variance.targetDose.toFixed(2)} mg</div>
              </div>
              <div className="bg-gray/10 rounded-lg p-3">
                <div className="text-gray">Average Dose</div>
                <div className="text-white font-bold">{variance.averageDose.toFixed(2)} mg</div>
              </div>
              <div className="bg-gray/10 rounded-lg p-3">
                <div className="text-gray">Std Deviation</div>
                <div className="text-white font-bold">{variance.standardDeviation.toFixed(2)} mg</div>
              </div>
              <div className="bg-gray/10 rounded-lg p-3">
                <div className="text-gray">Variance</div>
                <div className="text-white font-bold">{variance.variance.toFixed(2)}</div>
              </div>
            </div>

            {/* Dose Difference Indicator */}
            {Math.abs(variance.averageDose - variance.targetDose) > 0.1 && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`px-2 py-1 rounded text-xs ${
                  variance.averageDose > variance.targetDose
                    ? 'bg-warning/20 text-warning'
                    : 'bg-primary/20 text-primary'
                }`}>
                  {variance.averageDose > variance.targetDose
                    ? `+${(variance.averageDose - variance.targetDose).toFixed(2)} mg above target`
                    : `${(variance.averageDose - variance.targetDose).toFixed(2)} mg below target`
                  }
                </div>
              </div>
            )}

            {/* High Variance Days Alert */}
            {variance.highVarianceDates.length > 0 && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-warning" />
                  <span className="text-warning font-medium text-sm">High Variance Days</span>
                </div>
                <p className="text-xs text-gray">
                  {variance.highVarianceDates.length} doses significantly differed from your average.
                  {variance.highVarianceDates.length <= 3 && (
                    <>
                      {' '}Recent: {variance.highVarianceDates
                        .slice(-3)
                        .map(date => date.toLocaleDateString())
                        .join(', ')}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="border-t border-gray/20 pt-4 mt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-success">
              {data.filter(d => d.accuracyPercentage >= 90).length}
            </div>
            <div className="text-xs text-gray">High Accuracy (≥90%)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">
              {data.filter(d => d.accuracyPercentage >= 75 && d.accuracyPercentage < 90).length}
            </div>
            <div className="text-xs text-gray">Moderate (75-89%)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-error">
              {data.filter(d => d.accuracyPercentage < 75).length}
            </div>
            <div className="text-xs text-gray">Variable (&lt;75%)</div>
          </div>
        </div>
      </div>

      {/* Variance Insights */}
      <div className="border-t border-gray/20 pt-4 mt-4">
        <div className="text-sm">
          {averageAccuracy >= 90 ? (
            <div className="text-success">
              ✓ Excellent dose consistency! Your precise dosing supports optimal protocol effectiveness.
            </div>
          ) : averageAccuracy >= 75 ? (
            <div className="text-warning">
              ⚠ Good dose consistency. Consider using a more precise measurement method for better accuracy.
            </div>
          ) : (
            <div className="text-error">
              ! High dose variability detected. Consider using measurement tools or pre-filled syringes for consistency.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}