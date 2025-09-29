'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { DatabaseService } from '@/lib/database';
import type { Peptide } from '@/types/database';

interface PeptideFormProps {
  mode: 'create' | 'edit';
  peptide?: Peptide;
}

const categories = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_building', label: 'Muscle Building' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'longevity', label: 'Longevity' },
  { value: 'cognitive', label: 'Cognitive' },
  { value: 'other', label: 'Other' },
] as const;

const doseUnits = [
  { value: 'mg', label: 'mg' },
  { value: 'mcg', label: 'mcg' },
  { value: 'iu', label: 'IU' },
  { value: 'ml', label: 'ml' },
  { value: 'units', label: 'units' },
] as const;

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'twice_weekly', label: 'Twice Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as_needed', label: 'As Needed' },
] as const;

export function PeptideForm({ mode, peptide }: PeptideFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [safetyNotes, setSafetyNotes] = useState<string[]>(
    peptide?.safetyNotes || ['']
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: peptide ? {
      name: peptide.name,
      category: peptide.category,
      typicalDoseRange: peptide.typicalDoseRange,
      safetyNotes: peptide.safetyNotes || [],
      jayContentId: peptide.jayContentId || '',
    } : {
      name: '',
      category: 'other' as const,
      typicalDoseRange: {
        min: 1,
        max: 10,
        unit: 'mg' as const,
        frequency: 'daily' as const,
      },
      safetyNotes: [],
      jayContentId: '',
    },
  });

  const addSafetyNote = () => {
    const newNotes = [...safetyNotes, ''];
    setSafetyNotes(newNotes);
    setValue('safetyNotes', newNotes);
  };

  const removeSafetyNote = (index: number) => {
    const newNotes = safetyNotes.filter((_, i) => i !== index);
    setSafetyNotes(newNotes);
    setValue('safetyNotes', newNotes);
  };

  const updateSafetyNote = (index: number, value: string) => {
    const newNotes = [...safetyNotes];
    newNotes[index] = value;
    setSafetyNotes(newNotes);
    setValue('safetyNotes', newNotes.filter(note => note.trim()));
  };

  const onSubmit = async (data: any) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Get user's current record
      const userRecord = await DatabaseService.getUserByClerkId(user.id);
      if (!userRecord) {
        throw new Error('User record not found');
      }

      if (mode === 'create') {
        await DatabaseService.createPeptide({
          userId: userRecord.id,
          name: data.name,
          isCustom: true,
          category: data.category,
          typicalDoseRange: data.typicalDoseRange,
          safetyNotes: data.safetyNotes || [],
          jayContentId: data.jayContentId || null,
        });
      } else {
        if (!peptide) {
          throw new Error('Peptide data required for update');
        }
        await DatabaseService.updatePeptide(peptide.id, {
          name: data.name,
          category: data.category,
          typicalDoseRange: data.typicalDoseRange,
          safetyNotes: data.safetyNotes || [],
          jayContentId: data.jayContentId || null,
        });
      }

      router.push('/peptides');
    } catch (error) {
      console.error('Error saving peptide:', error);
      // TODO: Add proper error handling/toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Peptide Name */}
      <div>
        <label htmlFor="name" className="block text-white font-medium mb-2">
          Peptide Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          placeholder="e.g., BPC-157"
          className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
        />
        {errors.name && (
          <p className="text-red-400 text-small mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-white font-medium mb-2">
          Category *
        </label>
        <select
          {...register('category')}
          id="category"
          className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-400 text-small mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Typical Dose Range */}
      <div>
        <label className="block text-white font-medium mb-2">
          Typical Dose Range *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="min-dose" className="block text-gray text-small mb-1">
              Min Dose
            </label>
            <input
              {...register('typicalDoseRange.min', { valueAsNumber: true })}
              type="number"
              id="min-dose"
              step="0.001"
              min="0"
              placeholder="0.25"
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="max-dose" className="block text-gray text-small mb-1">
              Max Dose
            </label>
            <input
              {...register('typicalDoseRange.max', { valueAsNumber: true })}
              type="number"
              id="max-dose"
              step="0.001"
              min="0"
              placeholder="2.4"
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="dose-unit" className="block text-gray text-small mb-1">
              Unit
            </label>
            <select
              {...register('typicalDoseRange.unit')}
              id="dose-unit"
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
            >
              {doseUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="frequency" className="block text-gray text-small mb-1">
              Frequency
            </label>
            <select
              {...register('typicalDoseRange.frequency')}
              id="frequency"
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
            >
              {frequencies.map((frequency) => (
                <option key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.typicalDoseRange && (
          <p className="text-red-400 text-small mt-1">
            {errors.typicalDoseRange.message ||
             errors.typicalDoseRange.min?.message ||
             errors.typicalDoseRange.max?.message ||
             errors.typicalDoseRange.unit?.message ||
             errors.typicalDoseRange.frequency?.message}
          </p>
        )}
      </div>

      {/* Safety Notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-white font-medium">
            Safety Notes
          </label>
          <button
            type="button"
            onClick={addSafetyNote}
            className="text-primary hover:text-primary-hover text-small inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
        <div className="space-y-2">
          {safetyNotes.map((note, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => updateSafetyNote(index, e.target.value)}
                placeholder="e.g., Start with lowest dose and titrate slowly"
                className="flex-1 px-4 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
              />
              {safetyNotes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSafetyNote(index)}
                  className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Jay Campbell Content ID */}
      <div>
        <label htmlFor="jayContentId" className="block text-white font-medium mb-2">
          Jay Campbell Content Reference
        </label>
        <input
          {...register('jayContentId')}
          type="text"
          id="jayContentId"
          placeholder="e.g., semaglutide-guide"
          className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
        />
        <p className="text-gray text-small mt-1">
          Optional reference to Jay Campbell content for this peptide
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Peptide' : 'Update Peptide'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-transparent text-white border border-gray rounded-button hover:bg-gray/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}