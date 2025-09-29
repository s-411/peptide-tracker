'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Eye, AlertCircle } from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import { useUser } from '@clerk/nextjs';
import type { Peptide, PeptideTemplate } from '@/types/database';

interface PeptideCardProps {
  peptide: Peptide | PeptideTemplate;
  isTemplate: boolean;
  onUpdate?: () => void;
}

export function PeptideCard({ peptide, isTemplate, onUpdate }: PeptideCardProps) {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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

  const formatDoseRange = (doseRange: any) => {
    return `${doseRange.min}-${doseRange.max} ${doseRange.unit} ${doseRange.frequency.replace('_', ' ')}`;
  };

  const handleDelete = async () => {
    if (!user || isTemplate) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${peptide.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const success = await DatabaseService.deletePeptide(peptide.id);
      if (success) {
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error deleting peptide:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!user || !isTemplate) return;

    try {
      setIsAdding(true);

      // Get user's current record
      const userRecord = await DatabaseService.getUserByClerkId(user.id);
      if (!userRecord) return;

      // Create a custom peptide based on the template
      const template = peptide as PeptideTemplate;
      await DatabaseService.createPeptide({
        userId: userRecord.id,
        name: template.name,
        isCustom: true,
        category: template.category,
        typicalDoseRange: template.typicalDoseRange,
        safetyNotes: template.safetyNotes,
        jayContentId: template.jayContentId,
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error adding peptide to library:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-dark2 border border-gray/20 rounded-card p-4 hover:border-gray/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-h5 font-heading text-white mb-1">{peptide.name}</h3>
          <span className={`text-small font-medium ${getCategoryColor(peptide.category)}`}>
            {getCategoryLabel(peptide.category)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isTemplate && (
            <span className="px-2 py-1 bg-success/20 text-success text-tiny rounded">
              Template
            </span>
          )}
          {!isTemplate && 'isCustom' in peptide && peptide.isCustom && (
            <span className="px-2 py-1 bg-primary/20 text-primary text-tiny rounded">
              Custom
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <div className="text-small text-gray mb-1">Typical Dose</div>
          <div className="text-white">{formatDoseRange(peptide.typicalDoseRange)}</div>
        </div>

        {peptide.safetyNotes && peptide.safetyNotes.length > 0 && (
          <div>
            <div className="text-small text-gray mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Safety Notes
            </div>
            <div className="text-small text-gray">
              {peptide.safetyNotes[0]}
              {peptide.safetyNotes.length > 1 && (
                <span className="text-primary"> +{peptide.safetyNotes.length - 1} more</span>
              )}
            </div>
          </div>
        )}

        {'description' in peptide && peptide.description && (
          <div>
            <div className="text-small text-gray mb-1">Description</div>
            <div className="text-small text-gray">{peptide.description}</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={isTemplate ? `/peptides/template/${peptide.id}` : `/peptides/${peptide.id}`}
          className="flex-1 bg-transparent text-white border border-gray px-3 py-2 rounded-button text-small font-medium hover:bg-gray/10 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>

        {isTemplate ? (
          <button
            onClick={handleAddToLibrary}
            disabled={isAdding}
            className="bg-primary text-dark px-3 py-2 rounded-button text-small font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        ) : (
          <>
            <Link
              href={`/peptides/${peptide.id}/edit`}
              className="bg-transparent text-white border border-gray px-3 py-2 rounded-button text-small hover:bg-gray/10 transition-colors inline-flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-transparent text-red-400 border border-red-400/30 px-3 py-2 rounded-button text-small hover:bg-red-400/10 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}