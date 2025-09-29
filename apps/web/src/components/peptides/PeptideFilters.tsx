'use client';

import { Search, Filter, X } from 'lucide-react';
import type { PeptideFiltersInput } from '@/types/database';

interface PeptideFiltersProps {
  filters: PeptideFiltersInput;
  onFiltersChange: (filters: PeptideFiltersInput) => void;
}

const categories = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_building', label: 'Muscle Building' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'longevity', label: 'Longevity' },
  { value: 'cognitive', label: 'Cognitive' },
  { value: 'other', label: 'Other' },
] as const;

export function PeptideFilters({ filters, onFiltersChange }: PeptideFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined,
    });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : (category as any),
    });
  };

  const handleCustomToggle = (isCustom: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      isCustom,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(filters.search || filters.category || filters.isCustom !== undefined);

  return (
    <div className="bg-dark2 p-4 rounded-card border border-gray/20 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
          <input
            type="text"
            placeholder="Search peptides..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="pl-10 pr-8 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary appearance-none min-w-[180px]"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom/Template Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCustomToggle(undefined)}
            className={`px-3 py-2 rounded-button text-small font-medium transition-colors ${
              filters.isCustom === undefined
                ? 'bg-primary text-dark'
                : 'bg-transparent text-gray border border-gray/30 hover:bg-gray/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleCustomToggle(true)}
            className={`px-3 py-2 rounded-button text-small font-medium transition-colors ${
              filters.isCustom === true
                ? 'bg-primary text-dark'
                : 'bg-transparent text-gray border border-gray/30 hover:bg-gray/10'
            }`}
          >
            Custom
          </button>
          <button
            onClick={() => handleCustomToggle(false)}
            className={`px-3 py-2 rounded-button text-small font-medium transition-colors ${
              filters.isCustom === false
                ? 'bg-primary text-dark'
                : 'bg-transparent text-gray border border-gray/30 hover:bg-gray/10'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-gray hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-small">
              Search: "{filters.search}"
              <button
                onClick={() => handleSearchChange('')}
                className="hover:text-primary-hover"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-small">
              Category: {categories.find(c => c.value === filters.category)?.label}
              <button
                onClick={() => handleCategoryChange('all')}
                className="hover:text-primary-hover"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.isCustom !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-small">
              Type: {filters.isCustom ? 'Custom' : 'Templates'}
              <button
                onClick={() => handleCustomToggle(undefined)}
                className="hover:text-primary-hover"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}