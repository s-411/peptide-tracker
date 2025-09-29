'use client';

import { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ProgressChart } from './ProgressChart';
import type { WeeklyProgressData, ProtocolProgress, WeeklyProgressTrend } from '@/types/database';

interface WeeklyProgressWidgetProps {
  userId: string;
}

export function WeeklyProgressWidget({ userId }: WeeklyProgressWidgetProps) {
  const [progressData, setProgressData] = useState<WeeklyProgressData | null>(null);
  const [trends, setTrends] = useState<WeeklyProgressTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/protocols/weekly-progress?includeTrends=true`);
        if (!response.ok) {
          throw new Error('Failed to fetch weekly progress');
        }
        const data = await response.json();
        setProgressData(data);
        if (data.trends) {
          setTrends(data.trends);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  const getStatusColor = (status: ProtocolProgress['status']) => {
    switch (status) {
      case 'complete':
        return 'text-success';
      case 'on_track':
        return 'text-primary';
      case 'behind':
        return 'text-error';
      case 'ahead':
        return 'text-info';
      default:
        return 'text-gray';
    }
  };

  const getStatusIcon = (status: ProtocolProgress['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'on_track':
        return <Target className="w-4 h-4" />;
      case 'behind':
        return <AlertTriangle className="w-4 h-4" />;
      case 'ahead':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: ProtocolProgress['status']) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'on_track':
        return 'On Track';
      case 'behind':
        return 'Behind';
      case 'ahead':
        return 'Ahead';
      default:
        return 'Unknown';
    }
  };

  const getProgressBarColor = (percentage: number, status: ProtocolProgress['status']) => {
    if (status === 'complete') return 'bg-success';
    if (status === 'behind') return 'bg-error';
    if (status === 'ahead') return 'bg-info';
    return 'bg-primary';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatDose = (dose: number, unit?: string) => {
    return `${dose.toFixed(2)}${unit ? ` ${unit}` : ''}`;
  };

  if (loading) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-h4 font-heading text-primary">Weekly Progress</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray">Loading progress data...</div>
        </div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-h4 font-heading text-primary">Weekly Progress</h2>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-gray mx-auto mb-2" />
          <p className="text-gray text-small">{error || 'Unable to load progress'}</p>
        </div>
      </div>
    );
  }

  if (progressData.protocolProgresses.length === 0) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-h4 font-heading text-primary">Weekly Progress</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray/50 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">No Active Protocols</p>
          <p className="text-gray text-small mb-4">Create a protocol to start tracking your weekly progress</p>
          <Link
            href="/dashboard/protocols"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-button text-small font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Protocol
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-h4 font-heading text-primary">Weekly Progress</h2>
        </div>
        <div className="text-gray text-small flex items-center gap-1">
          <Calendar className="w-3 w-3" />
          {formatDate(progressData.weekStart)} - {formatDate(progressData.weekEnd)}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Overall Progress</span>
          <span className="text-white font-bold">{progressData.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray/20 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressData.overallProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-h3 font-bold text-white mb-1">
            {progressData.totalActiveProtocols}
          </div>
          <div className="text-gray text-xs">Active Protocols</div>
        </div>
        <div className="text-center">
          <div className="text-h3 font-bold text-success mb-1">
            {progressData.onTrackProtocols}
          </div>
          <div className="text-gray text-xs">On Track</div>
        </div>
        <div className="text-center">
          <div className="text-h3 font-bold text-error mb-1">
            {progressData.behindProtocols}
          </div>
          <div className="text-gray text-xs">Behind</div>
        </div>
      </div>

      {/* Protocol Progress List */}
      <div className="space-y-4 mb-6">
        {progressData.protocolProgresses.map((progress) => (
          <div key={progress.protocol.id} className="border border-gray/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-small">
                  {progress.peptide.name}
                </span>
                <div className={`flex items-center gap-1 ${getStatusColor(progress.status)}`}>
                  {getStatusIcon(progress.status)}
                  <span className="text-xs">{getStatusLabel(progress.status)}</span>
                </div>
              </div>
              <span className="text-white font-bold text-small">
                {progress.progressPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray/20 rounded-full h-1.5 mb-3">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(
                  progress.progressPercentage,
                  progress.status
                )}`}
                style={{ width: `${Math.min(progress.progressPercentage, 100)}%` }}
              />
            </div>

            {/* Dose Information */}
            <div className="flex items-center justify-between text-xs text-gray">
              <span>
                {formatDose(progress.currentDose, progress.peptide.typicalDoseRange.unit)} / {formatDose(progress.targetDose, progress.peptide.typicalDoseRange.unit)}
              </span>
              {progress.remainingDose > 0 && (
                <span>
                  {formatDose(progress.remainingDose, progress.peptide.typicalDoseRange.unit)} remaining
                </span>
              )}
            </div>

            {/* Suggestion */}
            {progress.suggestedNextDose && progress.suggestedNextDose > 0 && (
              <div className="mt-2 p-2 bg-primary/10 rounded text-xs text-primary">
                💡 Suggested next dose: {formatDose(progress.suggestedNextDose, progress.peptide.typicalDoseRange.unit)}
              </div>
            )}

            {/* Last Injection */}
            {progress.lastInjectionDate && (
              <div className="mt-2 text-xs text-gray">
                Last injection: {formatDate(progress.lastInjectionDate)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Historical Trends */}
      {trends.length > 0 && (
        <div className="mb-6 p-4 border border-gray/20 rounded-lg">
          <ProgressChart trends={trends} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Link
          href="/injections/log"
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-dark rounded-button text-small font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Injection
        </Link>
        <Link
          href="/dashboard/protocols"
          className="px-3 py-2 border border-gray/30 text-gray rounded-button text-small font-medium hover:bg-gray/10 transition-colors"
        >
          Manage Protocols
        </Link>
      </div>
    </div>
  );
}