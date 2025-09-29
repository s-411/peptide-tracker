'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Syringe } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { DatabaseService } from '@/lib/database';
import type { Peptide, InjectionSite, DoseUnit } from '@/types/database';
import { InjectionSiteSelector } from './InjectionSiteSelector';

const doseUnits = [
  { value: 'mg', label: 'mg' },
  { value: 'mcg', label: 'mcg' },
  { value: 'iu', label: 'IU' },
  { value: 'ml', label: 'ml' },
  { value: 'units', label: 'units' },
] as const;

export function InjectionForm() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPeptides, setUserPeptides] = useState<Peptide[]>([]);
  const [selectedPeptide, setSelectedPeptide] = useState<Peptide | null>(null);
  const [isLoadingPeptides, setIsLoadingPeptides] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<{
    peptideId: string;
    dose: number;
    doseUnit: DoseUnit;
    injectionSite: InjectionSite;
    timestamp: Date;
    notes: string;
  }>({
    defaultValues: {
      peptideId: '',
      dose: 0,
      doseUnit: 'mg',
      injectionSite: {
        location: 'abdomen',
        subLocation: '',
        side: 'left',
        notes: '',
      },
      timestamp: new Date(),
      notes: '',
    },
  });

  const watchedPeptideId = watch('peptideId');
  const watchedDose = watch('dose');

  // Load user's peptides
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

  // Update selected peptide when peptide selection changes
  useEffect(() => {
    if (watchedPeptideId) {
      const peptide = userPeptides.find(p => p.id === watchedPeptideId);
      setSelectedPeptide(peptide || null);

      // Auto-set dose unit based on peptide's typical range
      if (peptide?.typicalDoseRange.unit) {
        setValue('doseUnit', peptide.typicalDoseRange.unit);
      }
    }
  }, [watchedPeptideId, userPeptides, setValue]);

  // Validate dose against peptide's typical range
  const getDoseValidationMessage = () => {
    if (!selectedPeptide || !watchedDose) return null;

    const { min, max, unit } = selectedPeptide.typicalDoseRange;
    if (watchedDose < min || watchedDose > max) {
      return `Dose outside typical range (${min}-${max} ${unit})`;
    }
    return null;
  };

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const onSubmit = async (data: {
    peptideId: string;
    dose: number;
    doseUnit: DoseUnit;
    injectionSite: InjectionSite;
    timestamp: Date;
    notes: string;
  }) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Get user's current record
      const userRecord = await DatabaseService.getUserByClerkId(user.id);
      if (!userRecord) {
        throw new Error('User record not found');
      }

      // Create injection
      await DatabaseService.createInjection({
        userId: userRecord.id,
        peptideId: data.peptideId,
        dose: Number(data.dose),
        doseUnit: data.doseUnit,
        injectionSite: data.injectionSite,
        timestamp: new Date(data.timestamp),
        notes: data.notes || null,
        protocolId: null, // Will be implemented in future stories
      });

      router.push('/dashboard?success=injection-logged');
    } catch {
      // Error saving injection - TODO: Add proper error handling/toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPeptides) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray">Loading peptides...</div>
      </div>
    );
  }

  if (userPeptides.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-white mb-4">No peptides found in your library</div>
        <p className="text-gray text-small mb-4">
          You need to add peptides to your library before logging injections.
        </p>
        <button
          onClick={() => router.push('/peptides/add')}
          className="bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors"
        >
          Add Your First Peptide
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Peptide Selection */}
      <div>
        <label htmlFor="peptideId" className="block text-white font-medium mb-2">
          <Syringe className="w-4 h-4 inline mr-2" />
          Peptide *
        </label>
        <select
          {...register('peptideId', { required: 'Please select a peptide' })}
          id="peptideId"
          className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
        >
          <option value="">Select a peptide...</option>
          {userPeptides.map((peptide) => (
            <option key={peptide.id} value={peptide.id}>
              {peptide.name} ({peptide.typicalDoseRange.min}-{peptide.typicalDoseRange.max} {peptide.typicalDoseRange.unit})
            </option>
          ))}
        </select>
        {errors.peptideId && (
          <p className="text-red-400 text-small mt-1">{errors.peptideId.message}</p>
        )}
      </div>

      {/* Dose Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dose" className="block text-white font-medium mb-2">
            Dose Amount *
          </label>
          <input
            {...register('dose', {
              required: 'Dose is required',
              min: { value: 0.001, message: 'Dose must be positive' },
              valueAsNumber: true,
            })}
            type="number"
            step="0.001"
            id="dose"
            placeholder="2.5"
            className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
          />
          {errors.dose && (
            <p className="text-red-400 text-small mt-1">{errors.dose.message}</p>
          )}
          {getDoseValidationMessage() && (
            <p className="text-warning text-small mt-1">{getDoseValidationMessage()}</p>
          )}
        </div>
        <div>
          <label htmlFor="doseUnit" className="block text-white font-medium mb-2">
            Unit
          </label>
          <select
            {...register('doseUnit')}
            id="doseUnit"
            className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
          >
            {doseUnits.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date and Time */}
      <div>
        <label htmlFor="timestamp" className="block text-white font-medium mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          <Clock className="w-4 h-4 inline mr-2" />
          Date & Time *
        </label>
        <input
          {...register('timestamp', {
            required: 'Date and time are required',
            valueAsDate: true,
          })}
          type="datetime-local"
          id="timestamp"
          defaultValue={formatDateTime(new Date())}
          className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
        />
        {errors.timestamp && (
          <p className="text-red-400 text-small mt-1">{errors.timestamp.message}</p>
        )}
      </div>

      {/* Injection Site */}
      <InjectionSiteSelector
        value={watch('injectionSite')}
        onChange={(siteData) => setValue('injectionSite', siteData)}
        error={errors.injectionSite?.message}
      />

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-white font-medium mb-2">
          Notes (Optional)
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={3}
          placeholder="Side effects, observations, or protocol notes..."
          className="w-full px-4 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Logging Injection...' : 'Log Injection'}
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