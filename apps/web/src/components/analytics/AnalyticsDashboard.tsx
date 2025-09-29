'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, TrendingUp, Target, Clock, MapPin } from 'lucide-react';
import { ComprehensiveAnalytics, AnalyticsFilters } from '@/types/database';
import { AdherenceChart } from './AdherenceChart';
import { InjectionSiteMap } from './InjectionSiteMap';
import { TimingChart } from './TimingChart';
import { DoseVarianceChart } from './DoseVarianceChart';
import { InsightsPanel } from './InsightsPanel';
import { DateRangePicker } from './DateRangePicker';

interface AnalyticsDashboardProps {
  userId: string;
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    reportType: 'monthly'
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type: 'comprehensive'
      });

      if (filters.reportType) {
        params.append('reportType', filters.reportType);
      }

      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      if (filters.protocolIds && filters.protocolIds.length > 0) {
        params.append('protocolIds', filters.protocolIds.join(','));
      }

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setAnalytics(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
      reportType: 'custom'
    }));
  };

  const handleReportTypeChange = (type: 'weekly' | 'monthly' | 'quarterly') => {
    setFilters(prev => ({
      ...prev,
      reportType: type,
      dateRange: undefined
    }));
  };

  const exportData = async (format: 'pdf' | 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        type: 'comprehensive'
      });

      if (filters.reportType) {
        params.append('reportType', filters.reportType);
      }

      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `analytics-${format === 'pdf' ? 'report.pdf' : 'data.csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 font-heading text-white">Protocol Analytics</h1>
        </div>
        <div className="bg-dark2 p-8 rounded-card border border-gray/20 text-center">
          <div className="text-gray">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 font-heading text-white">Protocol Analytics</h1>
        </div>
        <div className="bg-dark2 p-8 rounded-card border border-gray/20 text-center">
          <div className="text-error">{error}</div>
          <button
            onClick={fetchAnalytics}
            className="mt-4 bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 font-heading text-white">Protocol Analytics</h1>
        </div>
        <div className="bg-dark2 p-8 rounded-card border border-gray/20 text-center">
          <div className="text-gray">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-h2 font-heading text-white">Protocol Analytics</h1>

        <div className="flex items-center gap-3">
          {/* Report Type Selector */}
          <div className="flex bg-dark2 rounded-lg border border-gray/20 overflow-hidden">
            {(['weekly', 'monthly', 'quarterly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleReportTypeChange(type)}
                className={`px-4 py-2 text-sm capitalize transition-colors ${
                  filters.reportType === type
                    ? 'bg-primary text-dark'
                    : 'text-gray hover:text-white hover:bg-gray/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Date Range Picker */}
          <DateRangePicker
            startDate={filters.dateRange?.start}
            endDate={filters.dateRange?.end}
            onDateRangeChange={handleDateRangeChange}
          />

          {/* Export Button */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-dark2 text-white px-4 py-2 rounded-lg border border-gray/20 hover:bg-gray/10 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-dark2 border border-gray/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportData('pdf')}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray/10 rounded-t-lg"
              >
                PDF Report
              </button>
              <button
                onClick={() => exportData('csv')}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray/10 rounded-b-lg"
              >
                CSV Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Adherence */}
        <div className="bg-dark2 p-6 rounded-card border border-gray/20">
          <div className="flex items-center gap-3">
            <div className="bg-success/20 p-2 rounded-lg">
              <Target className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-gray text-sm">Average Adherence</div>
              <div className="text-white text-xl font-bold">
                {analytics.protocolAdherence.length > 0
                  ? (analytics.protocolAdherence.reduce((sum, p) => sum + p.adherencePercentage, 0) / analytics.protocolAdherence.length).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Timing Consistency */}
        <div className="bg-dark2 p-6 rounded-card border border-gray/20">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-gray text-sm">Timing Consistency</div>
              <div className="text-white text-xl font-bold">
                {analytics.timingPatterns.consistencyScore.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Site Rotation */}
        <div className="bg-dark2 p-6 rounded-card border border-gray/20">
          <div className="flex items-center gap-3">
            <div className="bg-warning/20 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="text-gray text-sm">Sites Used</div>
              <div className="text-white text-xl font-bold">
                {analytics.injectionSites.length}
              </div>
            </div>
          </div>
        </div>

        {/* Insights Count */}
        <div className="bg-dark2 p-6 rounded-card border border-gray/20">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-gray text-sm">Key Insights</div>
              <div className="text-white text-xl font-bold">
                {analytics.keyInsights.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdherenceChart data={analytics.protocolAdherence} />
        <TimingChart data={analytics.timingPatterns} />
        <InjectionSiteMap data={analytics.injectionSites} />
        <DoseVarianceChart data={analytics.doseVariance} />
      </div>

      {/* Insights Panel */}
      <InsightsPanel
        insights={analytics.keyInsights}
        recommendations={analytics.recommendations}
      />
    </div>
  );
}