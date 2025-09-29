'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { DatabaseService } from '@/lib/database';
import { InjectionFilters } from './InjectionFilters';
import { InjectionHistoryTable } from './InjectionHistoryTable';
import type { Injection, InjectionFilters as IFilters, PaginationOptions } from '@/types/database';

interface InjectionWithPeptide extends Injection {
  peptides?: {
    name: string;
    category: string;
  };
}

export function InjectionHistory() {
  const { user } = useUser();
  const [injections, setInjections] = useState<InjectionWithPeptide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<IFilters>({});
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState<PaginationOptions & { total: number }>({
    offset: 0,
    limit: 20,
    total: 0,
  });

  // Simple debouncing - in a real app you'd use a proper debounce hook
  const debouncedFilters = filters;

  const loadInjections = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get user's current record
      const userRecord = await DatabaseService.getUserByClerkId(user.id);
      if (!userRecord) return;

      // Load injections with current filters and pagination
      const injections = await DatabaseService.getUserInjections(
        userRecord.id,
        debouncedFilters,
        {
          offset: pagination.offset,
          limit: pagination.limit,
        }
      );

      // For this implementation, we'll estimate total count
      // In a real application, you'd want a separate count query
      const estimatedTotal = injections.length === pagination.limit
        ? pagination.offset + pagination.limit + 1
        : pagination.offset + injections.length;

      setInjections(injections as InjectionWithPeptide[]);
      setPagination(prev => ({
        ...prev,
        total: estimatedTotal,
      }));

    } catch {
      // Error loading injections
      setInjections([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, debouncedFilters, pagination.offset, pagination.limit]);

  useEffect(() => {
    loadInjections();
  }, [loadInjections, sortField, sortDirection]);

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (offset: number, limit: number) => {
    setPagination(prev => ({
      ...prev,
      offset,
      limit,
    }));
  };

  const handleFiltersChange = (newFilters: IFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  // Sort injections locally if needed (since the database query handles most sorting)
  const sortedInjections = useMemo(() => {
    if (!injections) return [];

    return [...injections].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'peptide':
          aValue = a.peptides?.name || '';
          bValue = b.peptides?.name || '';
          break;
        case 'dose':
          aValue = a.dose;
          bValue = b.dose;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [injections, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      <InjectionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <InjectionHistoryTable
        injections={sortedInjections}
        loading={isLoading}
        onSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}