'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Copy, Calendar, MapPin, Pill, StickyNote, Clock } from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import type { Injection } from '@/types/database';

interface InjectionWithPeptide extends Injection {
  peptides?: {
    name: string;
    category: string;
  };
}

interface InjectionDetailProps {
  injection: InjectionWithPeptide;
  onUpdate?: () => void;
}

export function InjectionDetail({ injection, onUpdate }: InjectionDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const getCategoryColor = (category: string) => {
    const colors = {
      weight_loss: 'text-blue-400',
      muscle_building: 'text-green-400',
      recovery: 'text-yellow-400',
      longevity: 'text-purple-400',
      cognitive: 'text-pink-400',
      other: 'text-gray-400',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      weight_loss: 'Weight Loss',
      muscle_building: 'Muscle Building',
      recovery: 'Recovery',
      longevity: 'Longevity',
      cognitive: 'Cognitive',
      other: 'Other',
    };
    return labels[category as keyof typeof labels] || 'Other';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this injection record? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const success = await DatabaseService.deleteInjection(injection.id, injection.userId);
      if (success) {
        // Redirect to injection history after successful deletion
        window.location.href = '/injections/history';
      }
    } catch {
      // Error deleting injection
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    const confirmed = window.confirm(
      'Create a duplicate of this injection with the current timestamp?'
    );

    if (!confirmed) return;

    try {
      setIsDuplicating(true);
      const duplicate = await DatabaseService.duplicateInjection(injection.id, injection.userId);
      if (duplicate && onUpdate) {
        onUpdate();
        // Navigate to the new injection
        window.location.href = `/injections/${duplicate.id}`;
      }
    } catch {
      // Error duplicating injection
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-dark2 border border-gray/20 rounded-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-h2 font-heading text-white mb-2">
              {injection.peptides?.name || 'Unknown Peptide'}
            </h1>
            {injection.peptides?.category && (
              <span className={`text-h5 font-medium ${getCategoryColor(injection.peptides.category)}`}>
                {getCategoryLabel(injection.peptides.category)}
              </span>
            )}
            <div className="text-gray text-small mt-2">
              Logged {getTimeAgo(injection.timestamp)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-h3 font-heading text-primary">
              {injection.dose} {injection.doseUnit}
            </div>
            <div className="text-gray text-small">Dose Amount</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/injections/${injection.id}/edit`}
            className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Injection
          </Link>
          <button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="bg-success text-dark px-4 py-2 rounded-button font-bold hover:bg-success-hover transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-button font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Injection Information */}
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4">
            <Pill className="w-5 h-5 inline mr-2" />
            Injection Details
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-gray text-small">Peptide</div>
              <div className="text-white font-medium">
                {injection.peptides?.name || 'Unknown Peptide'}
              </div>
            </div>

            <div>
              <div className="text-gray text-small">Dose</div>
              <div className="text-white font-medium font-mono">
                {injection.dose} {injection.doseUnit}
              </div>
            </div>

            <div>
              <div className="text-gray text-small">Injection Site</div>
              <div className="text-white font-medium">
                {formatSite(injection.injectionSite)}
              </div>
            </div>

            {injection.injectionSite.notes && (
              <div>
                <div className="text-gray text-small">Site Notes</div>
                <div className="text-white text-small">
                  {injection.injectionSite.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timing Information */}
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4">
            <Clock className="w-5 h-5 inline mr-2" />
            Timing Information
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-gray text-small">Date & Time</div>
              <div className="text-white font-medium">
                {formatDateTime(injection.timestamp)}
              </div>
            </div>

            <div>
              <div className="text-gray text-small">Time Ago</div>
              <div className="text-white font-medium">
                {getTimeAgo(injection.timestamp)}
              </div>
            </div>

            <div>
              <div className="text-gray text-small">Record Created</div>
              <div className="text-white font-medium">
                {formatDateTime(injection.createdAt)}
              </div>
            </div>

            {injection.updatedAt.getTime() !== injection.createdAt.getTime() && (
              <div>
                <div className="text-gray text-small">Last Modified</div>
                <div className="text-white font-medium">
                  {formatDateTime(injection.updatedAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {injection.notes && (
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4">
            <StickyNote className="w-5 h-5 inline mr-2" />
            Notes
          </h2>
          <div className="text-white whitespace-pre-wrap">
            {injection.notes}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-dark2 border border-gray/20 rounded-card p-6">
        <h2 className="text-h4 font-heading text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/injections/log"
            className="bg-transparent text-white border border-gray px-4 py-2 rounded-button hover:bg-gray/10 transition-colors inline-flex items-center gap-2"
          >
            <Pill className="w-4 h-4" />
            Log New Injection
          </Link>
          <Link
            href="/injections/history"
            className="bg-transparent text-white border border-gray px-4 py-2 rounded-button hover:bg-gray/10 transition-colors inline-flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            View History
          </Link>
          <Link
            href={`/injections/history?peptide=${injection.peptideId}`}
            className="bg-transparent text-white border border-gray px-4 py-2 rounded-button hover:bg-gray/10 transition-colors inline-flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            View All {injection.peptides?.name} Injections
          </Link>
        </div>
      </div>
    </div>
  );
}