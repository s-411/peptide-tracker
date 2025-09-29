import { z } from 'zod';

export const doseRangeSchema = z.object({
  min: z.number().positive('Minimum dose must be positive'),
  max: z.number().positive('Maximum dose must be positive'),
  unit: z.enum(['mg', 'mcg', 'iu', 'ml', 'units']),
  frequency: z.enum(['daily', 'twice_daily', 'weekly', 'twice_weekly', 'monthly', 'as_needed']),
}).refine(data => data.max >= data.min, {
  message: 'Maximum dose must be greater than or equal to minimum dose',
  path: ['max'],
});

export const createPeptideSchema = z.object({
  name: z
    .string()
    .min(1, 'Peptide name is required')
    .max(100, 'Peptide name must be 100 characters or less')
    .trim(),
  category: z.enum(['weight_loss', 'muscle_building', 'recovery', 'longevity', 'cognitive', 'other']),
  typicalDoseRange: doseRangeSchema,
  safetyNotes: z
    .array(z.string().trim())
    .optional()
    .default([]),
  jayContentId: z
    .string()
    .optional()
    .nullable(),
});

export const updatePeptideSchema = createPeptideSchema.extend({
  id: z.string().uuid('Invalid peptide ID'),
});

export const deletePeptideSchema = z.object({
  id: z.string().uuid('Invalid peptide ID'),
});

export const peptideFiltersSchema = z.object({
  category: z
    .enum(['weight_loss', 'muscle_building', 'recovery', 'longevity', 'cognitive', 'other'])
    .optional(),
  search: z.string().optional(),
  isCustom: z.boolean().optional(),
});

// Type exports
export type CreatePeptideInput = z.infer<typeof createPeptideSchema>;
export type UpdatePeptideInput = z.infer<typeof updatePeptideSchema>;
export type DeletePeptideInput = z.infer<typeof deletePeptideSchema>;
export type PeptideFiltersInput = z.infer<typeof peptideFiltersSchema>;
export type DoseRangeInput = z.infer<typeof doseRangeSchema>;