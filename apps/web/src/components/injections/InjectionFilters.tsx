'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { DatabaseService } from '@/lib/database';
import type { InjectionFilters, Peptide, InjectionLocation } from '@/types/database';

interface InjectionFiltersProps {
  filters: InjectionFilters;
  onFiltersChange: (filters: InjectionFilters) => void;
}

const injectionSites = [
  { value: 'abdomen', label: 'Abdomen' },
  { value: 'thigh', label: 'Thigh' },
  { value: 'arm', label: 'Arm' },
  { value: 'glute', label: 'Glute' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'other', label: 'Other' },
] as const;

const quickDateRanges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
] as const;

export function InjectionFilters({ filters, onFiltersChange }: InjectionFiltersProps) {
  const { user } = useUser();
  const [userPeptides, setUserPeptides] = useState<Peptide[]>([]);
  const [isLoadingPeptides, setIsLoadingPeptides] = useState(true);

  // Load user's peptides for filtering
  useEffect(() => {
    const loadPeptides = async () => {
      if (!user) return;

      try {
        const userRecord = await DatabaseService.getUserByClerkId(user.id);
        if (!userRecord) return;

        const peptides = await DatabaseService.getUserPeptides(userRecord.id);
        setUserPeptides(peptides);
      } catch {
        // Error loading peptides
      } finally {
        setIsLoadingPeptides(false);
      }
    };

    loadPeptides();
  }, [user]);

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined,
    });
  };

  const handlePeptideChange = (peptideId: string) => {
    onFiltersChange({
      ...filters,
      peptideId: peptideId === 'all' ? undefined : peptideId,
    });
  };

  const handleSiteChange = (site: string) => {
    onFiltersChange({
      ...filters,
      injectionSite: site === 'all' ? undefined : (site as InjectionLocation),
    });
  };

  const handleDateRangeChange = (days: number | 'custom' | null) => {
    if (days === null) {
      onFiltersChange({
        ...filters,
        dateRange: undefined,
      });
    } else if (days === 'custom') {
      // Keep existing range for custom selection
      return;
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);

      onFiltersChange({
        ...filters,
        dateRange: { start, end },
      });
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    if (!value) return;

    const newDate = new Date(value);
    const currentRange = filters.dateRange || { start: new Date(), end: new Date() };

    onFiltersChange({
      ...filters,
      dateRange: {
        ...currentRange,
        [field]: newDate,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.peptideId ||
    filters.injectionSite ||
    filters.dateRange
  );

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  return (
    <div className="bg-dark2 p-4 rounded-card border border-gray/20 space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
          <input
            type="text"
            placeholder="Search notes and peptide names..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 bg-transparent text-gray border border-gray/30 rounded-button hover:bg-gray/10 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peptide Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
          <select
            value={filters.peptideId || 'all'}
            onChange={(e) => handlePeptideChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary appearance-none"
            disabled={isLoadingPeptides}
          >
            <option value="all">All Peptides</option>
            {userPeptides.map((peptide) => (
              <option key={peptide.id} value={peptide.id}>
                {peptide.name}
              </option>
            ))}
          </select>
        </div>

        {/* Injection Site Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
          <select
            value={filters.injectionSite || 'all'}
            onChange={(e) => handleSiteChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary appearance-none"
          >
            <option value="all">All Sites</option>
            {injectionSites.map((site) => (
              <option key={site.value} value={site.value}>
                {site.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Quick Select */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
          <select
            value={(() => {
              if (!filters.dateRange) return 'all';
              const days = Math.ceil((filters.dateRange.end.getTime() - filters.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
              const quickRange = quickDateRanges.find(range => range.days === days);
              return quickRange ? days.toString() : 'custom';
            })()}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') {
                handleDateRangeChange(null);
              } else if (value === 'custom') {
                handleDateRangeChange('custom');
              } else {
                handleDateRangeChange(parseInt(value));
              }
            }}
            className="w-full pl-10 pr-8 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary appearance-none"
          >
            <option value="all">All Time</option>
            {quickDateRanges.map((range) => (
              <option key={range.days} value={range.days}>
                {range.label}
              </option>
            ))}
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.dateRange && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray/20">
          <div>
            <label className="block text-gray text-sm mb-2">From Date</label>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.start)}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-gray text-sm mb-2">To Date</label>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.end)}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray/20">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded">
              Search: &ldquo;{filters.search}&rdquo;
            </span>
          )}
          {filters.peptideId && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded">
              Peptide: {userPeptides.find(p => p.id === filters.peptideId)?.name || 'Unknown'}
            </span>
          )}
          {filters.injectionSite && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded">
              Site: {injectionSites.find(s => s.value === filters.injectionSite)?.label}
            </span>
          )}
          {filters.dateRange && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded">
              Date: {formatDateForInput(filters.dateRange.start)} to {formatDateForInput(filters.dateRange.end)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}