'use client';

import { useState, useEffect } from 'react';
import { PeptideFilters } from './PeptideFilters';
import { PeptideCard } from './PeptideCard';
import { DatabaseService } from '@/lib/database';
import { useUser } from '@clerk/nextjs';
import type { Peptide, PeptideTemplate, PeptideFiltersInput } from '@/types/database';

export function PeptideLibrary() {
  const { user } = useUser();
  const [userPeptides, setUserPeptides] = useState<Peptide[]>([]);
  const [templates, setTemplates] = useState<PeptideTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PeptideFiltersInput>({});

  useEffect(() => {
    loadPeptides();
    loadTemplates();
  }, [user, filters]);

  const loadPeptides = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get user's current record
      const userRecord = await DatabaseService.getUserByClerkId(user.id);
      if (!userRecord) return;

      const peptides = await DatabaseService.getUserPeptides(userRecord.id, {
        category: filters.category,
        isCustom: filters.isCustom,
      });

      setUserPeptides(peptides);
    } catch (error) {
      console.error('Error loading peptides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templates = await DatabaseService.getPeptideTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (filters.category && template.category !== filters.category) return false;
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const filteredUserPeptides = userPeptides.filter(peptide => {
    if (filters.search && !peptide.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray">Loading peptides...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PeptideFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* User's Custom Peptides */}
      {filteredUserPeptides.length > 0 && (
        <div>
          <h2 className="text-h4 font-heading mb-4 text-primary">My Peptides</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUserPeptides.map((peptide) => (
              <PeptideCard
                key={peptide.id}
                peptide={peptide}
                isTemplate={false}
                onUpdate={loadPeptides}
              />
            ))}
          </div>
        </div>
      )}

      {/* Peptide Templates */}
      <div>
        <h2 className="text-h4 font-heading mb-4 text-success">Peptide Templates</h2>
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <PeptideCard
                key={template.id}
                peptide={template}
                isTemplate={true}
                onUpdate={loadPeptides}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray">
            No peptide templates found matching your filters.
          </div>
        )}
      </div>

      {filteredUserPeptides.length === 0 && filteredTemplates.length === 0 && !filters.search && !filters.category && (
        <div className="text-center py-12">
          <div className="text-gray mb-4">No peptides in your library yet.</div>
          <p className="text-gray text-small">
            Add your first peptide to start tracking your peptide therapy journey.
          </p>
        </div>
      )}
    </div>
  );
}