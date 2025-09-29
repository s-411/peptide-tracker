'use client';

import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Activity, MapPin, Pill, AlertTriangle } from 'lucide-react';
import type { WeeklySummaryData } from '@/types/database';

interface WeeklySummaryWidgetProps {
  userId: string;
}

export function WeeklySummaryWidget({ userId }: WeeklySummaryWidgetProps) {
  const [summaryData, setSummaryData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/injections/weekly-summary?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weekly summary');
        }
        const data = await response.json();
        setSummaryData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-error" />;
      default:
        return <Minus className="w-4 h-4 text-gray" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-success';
      case 'declining':
        return 'text-error';
      default:
        return 'text-gray';
    }
  };

  const getAdherenceColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-h4 font-heading text-primary">Last 7 Days</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray">Loading weekly summary...</div>
        </div>
      </div>
    );
  }

  if (error || !summaryData) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-h4 font-heading text-primary">Last 7 Days</h2>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-gray mx-auto mb-2" />
          <p className="text-gray text-small">{error || 'Unable to load summary'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-h4 font-heading text-primary">Last 7 Days</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-h3 font-bold text-white mb-1">
            {summaryData.totalInjections}
          </div>
          <div className="text-gray text-small">Total Injections</div>
        </div>

        <div className="text-center">
          <div className="text-h3 font-bold text-white mb-1">
            {summaryData.uniquePeptides.length}
          </div>
          <div className="text-gray text-small">Unique Peptides</div>
        </div>

        <div className="text-center">
          <div className={`text-h3 font-bold mb-1 ${getAdherenceColor(summaryData.adherenceScore)}`}>
            {summaryData.adherenceScore}%
          </div>
          <div className="text-gray text-small">Adherence</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className={`text-h3 font-bold ${getTrendColor(summaryData.weeklyTrend)}`}>
              {summaryData.weeklyTrend}
            </span>
            {getTrendIcon(summaryData.weeklyTrend)}
          </div>
          <div className="text-gray text-small">Trend</div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Daily Activity
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {summaryData.dailyActivity.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-gray text-xs mb-1">
                {formatDate(day.date).split(' ')[0]}
              </div>
              <div
                className={`h-8 rounded-sm flex items-center justify-center text-xs font-medium ${
                  day.totalDoses > 0
                    ? 'bg-primary text-dark'
                    : 'bg-gray/20 text-gray'
                }`}
              >
                {day.totalDoses}
              </div>
              <div className="text-gray text-xs mt-1">
                {formatDate(day.date).split(' ')[1]} {formatDate(day.date).split(' ')[2]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Injection Sites */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Injection Sites Used
        </h3>
        <div className="flex flex-wrap gap-2">
          {summaryData.injectionSites.length > 0 ? (
            summaryData.injectionSites.map((site) => (
              <span
                key={site}
                className="bg-gray/20 text-gray px-2 py-1 rounded-button text-xs capitalize"
              >
                {site.replace('_', ' ')}
              </span>
            ))
          ) : (
            <span className="text-gray text-small">No injections recorded</span>
          )}
        </div>
      </div>

      {/* Missed Doses Alert */}
      {summaryData.missedDoses.length > 0 && (
        <div className="bg-error/10 border border-error/30 rounded-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-error" />
            <span className="text-error font-medium text-small">
              {summaryData.missedDoses.length} Missed Dose{summaryData.missedDoses.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-gray text-xs">
            Based on your active protocols
          </div>
        </div>
      )}

      {/* Peptides Used */}
      <div>
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Pill className="w-4 h-4" />
          Peptides This Week
        </h3>
        <div className="text-gray text-small">
          {summaryData.uniquePeptides.length > 0
            ? `${summaryData.uniquePeptides.length} different peptide${summaryData.uniquePeptides.length > 1 ? 's' : ''} used`
            : 'No peptides used this week'
          }
        </div>
      </div>
    </div>
  );
}