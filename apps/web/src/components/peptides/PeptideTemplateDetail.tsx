'use client';

import { useState } from 'react';
import { Plus, ExternalLink, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DatabaseService } from '@/lib/database';
import type { PeptideTemplate } from '@/types/database';

interface PeptideTemplateDetailProps {
  template: PeptideTemplate;
}

export function PeptideTemplateDetail({ template }: PeptideTemplateDetailProps) {
  const { user } = useUser();
  const router = useRouter();
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

  const formatFrequency = (frequency: string) => {
    return frequency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddToLibrary = async () => {
    if (!user) return;

    try {
      setIsAdding(true);

      // Get user's current record
      const userRecord = await DatabaseService.getUserByClerkId(user.id);
      if (!userRecord) return;

      // Create a custom peptide based on the template
      await DatabaseService.createPeptide({
        userId: userRecord.id,
        name: template.name,
        isCustom: true,
        category: template.category,
        typicalDoseRange: template.typicalDoseRange,
        safetyNotes: template.safetyNotes,
        jayContentId: template.jayContentId,
      });

      router.push('/peptides');
    } catch (error) {
      console.error('Error adding peptide to library:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-dark2 border border-gray/20 rounded-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-h2 font-heading text-white mb-2">{template.name}</h1>
            <span className={`text-h5 font-medium ${getCategoryColor(template.category)}`}>
              {getCategoryLabel(template.category)}
            </span>
          </div>

          <span className="px-3 py-1 bg-success/20 text-success rounded">
            Template
          </span>
        </div>

        {template.description && (
          <p className="text-gray mb-4">{template.description}</p>
        )}

        <button
          onClick={handleAddToLibrary}
          disabled={isAdding}
          className="bg-primary text-dark px-6 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Adding to Library...' : 'Add to My Library'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dosing Information */}
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4">Recommended Dosing</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray text-small mb-1">Starting Dose</div>
                <div className="text-white text-h5">
                  {template.typicalDoseRange.min} {template.typicalDoseRange.unit}
                </div>
              </div>
              <div>
                <div className="text-gray text-small mb-1">Maximum Dose</div>
                <div className="text-white text-h5">
                  {template.typicalDoseRange.max} {template.typicalDoseRange.unit}
                </div>
              </div>
            </div>

            <div>
              <div className="text-gray text-small mb-1">Frequency</div>
              <div className="text-white text-h5">
                {formatFrequency(template.typicalDoseRange.frequency)}
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded">
              <div className="text-primary text-small font-medium mb-1">Typical Protocol</div>
              <div className="text-white">
                Start with {template.typicalDoseRange.min} {template.typicalDoseRange.unit} {formatFrequency(template.typicalDoseRange.frequency)},
                titrate up to {template.typicalDoseRange.max} {template.typicalDoseRange.unit} as needed
              </div>
            </div>
          </div>
        </div>

        {/* Safety Information */}
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Safety Guidelines
          </h2>

          {template.safetyNotes && template.safetyNotes.length > 0 ? (
            <div className="space-y-3">
              {template.safetyNotes.map((note, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-gray">{note}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray">
              No specific safety guidelines provided. Always consult with a healthcare provider before starting any peptide therapy.
            </div>
          )}

          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded">
            <div className="text-warning text-small font-medium mb-1">Important</div>
            <div className="text-gray text-small">
              This information is for educational purposes only. Always work with a qualified healthcare provider
              for personalized dosing and safety recommendations.
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {template.jayContentId && (
        <div className="bg-dark2 border border-gray/20 rounded-card p-6">
          <h2 className="text-h4 font-heading text-white mb-4">Educational Resources</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark/50 rounded border border-gray/10">
              <div>
                <div className="text-white font-medium">Jay Campbell Content</div>
                <div className="text-gray text-small">
                  Comprehensive guide and protocols for {template.name}
                </div>
                <div className="text-gray text-tiny mt-1">Reference: {template.jayContentId}</div>
              </div>
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>

            <button className="w-full bg-transparent text-primary border border-primary/30 px-4 py-2 rounded-button hover:bg-primary/10 transition-colors">
              View Educational Content
            </button>
          </div>
        </div>
      )}

      {/* Popular Combinations */}
      <div className="bg-dark2 border border-gray/20 rounded-card p-6">
        <h2 className="text-h4 font-heading text-white mb-4">Popular Combinations</h2>
        <div className="text-gray">
          Information about peptide stacking and combinations will be available in future updates.
        </div>
      </div>
    </div>
  );
}