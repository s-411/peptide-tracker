'use client';

import Link from 'next/link';
import { Calendar, MapPin, Pill, StickyNote, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Injection, PaginationOptions } from '@/types/database';

interface InjectionWithPeptide extends Injection {
  peptides?: {
    name: string;
    category: string;
  };
}

interface InjectionHistoryTableProps {
  injections: InjectionWithPeptide[];
  loading?: boolean;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  pagination?: PaginationOptions & { total: number };
  onPageChange?: (offset: number, limit: number) => void;
}

type SortField = 'timestamp' | 'peptide' | 'dose';

export function InjectionHistoryTable({
  injections,
  loading = false,
  onSort,
  sortField,
  sortDirection,
  pagination,
  onPageChange
}: InjectionHistoryTableProps) {

  const handleSort = (field: SortField) => {
    if (!onSort) return;

    let direction: 'asc' | 'desc' = 'desc';
    if (sortField === field && sortDirection === 'desc') {
      direction = 'asc';
    }

    onSort(field, direction);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatSite = (site: Injection['injectionSite']) => {
    const parts = [
      site.location.charAt(0).toUpperCase() + site.location.slice(1),
      site.side && site.side !== 'center' ? `(${site.side})` : '',
      site.subLocation ? `- ${site.subLocation}` : ''
    ].filter(Boolean);
    return parts.join(' ');
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const pageSize = pagination?.limit || 20;
  const totalPages = pagination ? Math.ceil(pagination.total / pageSize) : 0;
  const currentPageNum = pagination ? Math.floor(pagination.offset / pageSize) : 0;

  const handlePageChange = (page: number) => {
    if (!onPageChange || !pagination) return;
    onPageChange(page * pageSize, pageSize);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray">Loading injection history...</div>
      </div>
    );
  }

  if (injections.length === 0) {
    return (
      <div className="text-center py-12">
        <Pill className="w-12 h-12 text-gray mx-auto mb-4" />
        <h3 className="text-h4 font-heading text-white mb-2">No injections found</h3>
        <p className="text-gray mb-4">
          No injection records match your current filters.
        </p>
        <Link
          href="/injections/log"
          className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors inline-block"
        >
          Log Your First Injection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block bg-dark2 rounded-card border border-gray/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark border-b border-gray/20">
              <tr>
                <th className="text-left p-4 text-white font-medium">
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Date & Time
                    {getSortIcon('timestamp')}
                  </button>
                </th>
                <th className="text-left p-4 text-white font-medium">
                  <button
                    onClick={() => handleSort('peptide')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Pill className="w-4 h-4" />
                    Peptide
                    {getSortIcon('peptide')}
                  </button>
                </th>
                <th className="text-left p-4 text-white font-medium">
                  <button
                    onClick={() => handleSort('dose')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    Dose
                    {getSortIcon('dose')}
                  </button>
                </th>
                <th className="text-left p-4 text-white font-medium">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Site
                </th>
                <th className="text-left p-4 text-white font-medium">
                  <StickyNote className="w-4 h-4 inline mr-2" />
                  Notes
                </th>
                <th className="text-left p-4 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {injections.map((injection) => (
                <tr key={injection.id} className="border-b border-gray/10 hover:bg-gray/5 transition-colors">
                  <td className="p-4 text-white">
                    <div className="text-sm">
                      {formatDateTime(injection.timestamp)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">
                      {injection.peptides?.name || 'Unknown Peptide'}
                    </div>
                    <div className="text-gray text-sm capitalize">
                      {injection.peptides?.category?.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="p-4 text-white">
                    <span className="font-mono">
                      {injection.dose} {injection.doseUnit}
                    </span>
                  </td>
                  <td className="p-4 text-gray text-sm">
                    {formatSite(injection.injectionSite)}
                  </td>
                  <td className="p-4 text-gray text-sm max-w-xs">
                    <div className="truncate">
                      {injection.notes || '—'}
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/injections/${injection.id}/edit`}
                      className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {injections.map((injection) => (
          <div key={injection.id} className="bg-dark2 p-4 rounded-card border border-gray/20">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-white font-medium">
                  {injection.peptides?.name || 'Unknown Peptide'}
                </div>
                <div className="text-gray text-sm">
                  {formatDateTime(injection.timestamp)}
                </div>
              </div>
              <Link
                href={`/injections/${injection.id}/edit`}
                className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
              >
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray">Dose</div>
                <div className="text-white font-mono">
                  {injection.dose} {injection.doseUnit}
                </div>
              </div>
              <div>
                <div className="text-gray">Site</div>
                <div className="text-white">
                  {formatSite(injection.injectionSite)}
                </div>
              </div>
            </div>

            {injection.notes && (
              <div className="mt-3">
                <div className="text-gray text-sm">Notes</div>
                <div className="text-white text-sm">{injection.notes}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-gray text-sm">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pageSize, pagination.total)} of {pagination.total} injections
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPageNum - 1)}
              disabled={currentPageNum === 0}
              className="px-3 py-1 bg-dark border border-gray/30 text-white rounded-button text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray/50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPageNum < 3 ? i : currentPageNum - 2 + i;
              if (pageNum >= totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-button text-sm transition-colors ${
                    pageNum === currentPageNum
                      ? 'bg-primary text-dark'
                      : 'bg-dark border border-gray/30 text-white hover:border-gray/50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPageNum + 1)}
              disabled={currentPageNum >= totalPages - 1}
              className="px-3 py-1 bg-dark border border-gray/30 text-white rounded-button text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray/50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}