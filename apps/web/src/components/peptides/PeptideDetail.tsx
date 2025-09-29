'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, AlertCircle, ExternalLink, BarChart3 } from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import type { Peptide } from '@/types/database';

interface PeptideDetailProps {
  peptide: Peptide;
}

export function PeptideDetail({ peptide }: PeptideDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const formatFrequency = (frequency: string) => {
    return frequency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${peptide.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const success = await DatabaseService.deletePeptide(peptide.id);
      if (success) {
        // Redirect to peptides library after successful deletion
        window.location.href = '/peptides';
      }
    } catch (error) {
      console.error('Error deleting peptide:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-dark2 border border-gray/20 rounded-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-h2 font-heading text-white mb-2">{peptide.name}</h1>
            <span className={`text-h5 font-medium ${getCategoryColor(peptide.category)}`}>
              {getCategoryLabel(peptide.category)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {peptide.isCustom ? (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded">
                Custom Peptide
              </span>
            ) : (
              <span className="px-3 py-1 bg-success/20 text-success rounded">
                Template Peptide
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/peptides/${peptide.id}/edit`}
            className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Peptide
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-transparent text-red-400 border border-red-400/30 px-4 py-2 rounded-button hover:bg-red-400/10 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dosing Information */}
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4">Dosing Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray text-small mb-1">Minimum Dose</div>
                <div className="text-white text-h5">
                  {peptide.typicalDoseRange.min} {peptide.typicalDoseRange.unit}
                </div>
              </div>
              <div>
                <div className="text-gray text-small mb-1">Maximum Dose</div>
                <div className="text-white text-h5">
                  {peptide.typicalDoseRange.max} {peptide.typicalDoseRange.unit}
                </div>
              </div>
            </div>

            <div>
              <div className="text-gray text-small mb-1">Frequency</div>
              <div className="text-white text-h5">
                {formatFrequency(peptide.typicalDoseRange.frequency)}
              </div>
            </div>

            <div className="bg-dark/50 p-4 rounded border border-gray/10">
              <div className="text-primary text-small font-medium mb-1">Typical Range</div>
              <div className="text-white">
                {peptide.typicalDoseRange.min}-{peptide.typicalDoseRange.max} {peptide.typicalDoseRange.unit}, {formatFrequency(peptide.typicalDoseRange.frequency)}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Information */}
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Safety Information
          </h2>

          {peptide.safetyNotes && peptide.safetyNotes.length > 0 ? (
            <div className="space-y-3">
              {peptide.safetyNotes.map((note, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-gray">{note}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray">
              No specific safety notes recorded for this peptide. Always consult with a healthcare provider before starting any peptide therapy.
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jay Campbell Content */}
        {peptide.jayContentId && (
          <div className="bg-dark2 border border-gray/20 rounded-card p-6">
            <h2 className="text-h4 font-heading text-white mb-4">Educational Content</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Jay Campbell Content</div>
                  <div className="text-gray text-small">Reference ID: {peptide.jayContentId}</div>
                </div>
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <button className="w-full bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors">
                View Content
              </button>
            </div>
          </div>
        )}

        {/* Injection History Preview */}
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Injection History
          </h2>

          <div className="text-center py-6">
            <div className="text-gray mb-2">No injection history yet</div>
            <Link
              href="/injections/log"
              className="text-primary hover:text-primary-hover text-small"
            >
              Log your first injection →
            </Link>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-dark2 border border-gray/20 rounded-card p-6">
        <h2 className="text-h4 font-heading text-white mb-4">Details</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-small">
          <div>
            <div className="text-gray mb-1">Created</div>
            <div className="text-white">
              {new Date(peptide.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-gray mb-1">Last Updated</div>
            <div className="text-white">
              {new Date(peptide.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-gray mb-1">Type</div>
            <div className="text-white">
              {peptide.isCustom ? 'Custom' : 'Template'}
            </div>
          </div>
          <div>
            <div className="text-gray mb-1">ID</div>
            <div className="text-white font-mono text-tiny">
              {peptide.id.split('-')[0]}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}