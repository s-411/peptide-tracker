'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Target, Save, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { DatabaseService } from '@/lib/database';
import type { Protocol, Peptide, ProtocolTemplate, ProtocolScheduleType, ProtocolScheduleConfig } from '@/types/database';

interface ProtocolFormProps {
  mode: 'create' | 'edit';
  protocol?: Protocol;
  selectedPeptideId?: string;
  onClose?: () => void;
}

interface ProtocolFormData {
  name: string;
  peptideId: string;
  weeklyTarget?: number;
  dailyTarget?: number;
  scheduleType: ProtocolScheduleType;
  startDate: string;
  endDate?: string;
  scheduleConfig: ProtocolScheduleConfig;
}

const scheduleTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'every_other_day', label: 'Every Other Day' },
  { value: 'custom', label: 'Custom Schedule' }
] as const;

const weekDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export function ProtocolForm({ mode, protocol, selectedPeptideId, onClose }: ProtocolFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customDays, setCustomDays] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProtocolFormData>({
    defaultValues: {
      name: protocol?.name || '',
      peptideId: selectedPeptideId || protocol?.peptideId || '',
      weeklyTarget: protocol?.weeklyTarget,
      dailyTarget: protocol?.dailyTarget,
      scheduleType: protocol?.scheduleType || 'weekly',
      startDate: protocol?.startDate ? new Date(protocol.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: protocol?.endDate ? new Date(protocol.endDate).toISOString().split('T')[0] : '',
      scheduleConfig: protocol?.scheduleConfig || {}
    }
  });

  const watchedValues = watch();

  // Load user peptides and templates
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [peptidesData, templatesData] = await Promise.all([
          DatabaseService.getUserPeptides(user.id, { isCustom: true }),
          DatabaseService.getProtocolTemplates()
        ]);

        setPeptides(peptidesData);
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error loading protocol form data:', error);
      }
    };

    loadData();
  }, [user]);

  // Apply template when selected
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (!templateId) return;

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setValue('peptideId', template.peptideId);
    setValue('weeklyTarget', template.weeklyTarget);
    setValue('dailyTarget', template.dailyTarget);
    setValue('scheduleType', template.scheduleType);
    setValue('name', template.name);

    // Set custom days if it's a custom schedule
    if (template.scheduleType === 'custom' && template.scheduleConfig.days) {
      setCustomDays(template.scheduleConfig.days);
    }
  };

  // Handle custom days selection
  const handleDayToggle = (day: string) => {
    setCustomDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Validate dose targets against peptide safety range
  const validateDoseTargets = (data: ProtocolFormData) => {
    const peptide = peptides.find(p => p.id === data.peptideId);
    if (!peptide) return true;

    const { min, max } = peptide.typicalDoseRange;

    if (data.weeklyTarget && (data.weeklyTarget < min || data.weeklyTarget > max * 7)) {
      throw new Error(`Weekly target must be between ${min} and ${max * 7} ${peptide.typicalDoseRange.unit}`);
    }

    if (data.dailyTarget && (data.dailyTarget < min || data.dailyTarget > max)) {
      throw new Error(`Daily target must be between ${min} and ${max} ${peptide.typicalDoseRange.unit}`);
    }

    return true;
  };

  const onSubmit = async (data: ProtocolFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Validate dose targets
      validateDoseTargets(data);

      // Build schedule config
      const scheduleConfig: ProtocolScheduleConfig = {
        ...data.scheduleConfig
      };

      if (data.scheduleType === 'custom') {
        scheduleConfig.days = customDays;
      }

      const protocolData: Partial<Protocol> = {
        userId: user.id,
        name: data.name,
        peptideId: data.peptideId,
        weeklyTarget: data.weeklyTarget,
        dailyTarget: data.dailyTarget,
        scheduleType: data.scheduleType,
        scheduleConfig,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isTemplate: false,
        isActive: true
      };

      if (mode === 'create') {
        await DatabaseService.createProtocol(protocolData as Omit<Protocol, 'id' | 'createdAt' | 'updatedAt'>);
      } else if (protocol) {
        await DatabaseService.updateProtocol(protocol.id, protocolData);
      }

      router.push('/dashboard/protocols');
      onClose?.();
    } catch (error) {
      console.error('Error saving protocol:', error);
      alert(error instanceof Error ? error.message : 'Failed to save protocol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPeptide = peptides.find(p => p.id === watchedValues.peptideId);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create Protocol' : 'Edit Protocol'}
        </h1>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Selection */}
        {mode === 'create' && templates.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start from Template (Optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Create from scratch</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.templateName} ({template.peptideName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Protocol Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Protocol Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Protocol name is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Semaglutide Protocol"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Peptide Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="inline h-4 w-4 mr-1" />
            Select Peptide
          </label>
          <select
            {...register('peptideId', { required: 'Please select a peptide' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a peptide...</option>
            {peptides.map(peptide => (
              <option key={peptide.id} value={peptide.id}>
                {peptide.name} ({peptide.category.replace('_', ' ')})
              </option>
            ))}
          </select>
          {errors.peptideId && (
            <p className="mt-1 text-sm text-red-600">{errors.peptideId.message}</p>
          )}
        </div>

        {/* Dose Targets */}
        {selectedPeptide && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Safe dose range: {selectedPeptide.typicalDoseRange.min} - {selectedPeptide.typicalDoseRange.max} {selectedPeptide.typicalDoseRange.unit}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Target ({selectedPeptide.typicalDoseRange.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('weeklyTarget', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2.4"
                />
                {errors.weeklyTarget && (
                  <p className="mt-1 text-sm text-red-600">{errors.weeklyTarget.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Target ({selectedPeptide.typicalDoseRange.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('dailyTarget', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.34"
                />
                {errors.dailyTarget && (
                  <p className="mt-1 text-sm text-red-600">{errors.dailyTarget.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Schedule Type
          </label>
          <select
            {...register('scheduleType', { required: 'Please select a schedule type' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {scheduleTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Days Selection */}
        {watchedValues.scheduleType === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Days
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border ${
                    customDays.includes(day.value)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Start Date
            </label>
            <input
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="inline h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Protocol' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}