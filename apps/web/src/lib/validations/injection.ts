import { z } from 'zod';

export const injectionSiteSchema = z.object({
  location: z.enum(['abdomen', 'thigh', 'arm', 'glute', 'shoulder', 'other']),
  subLocation: z.string().optional(),
  side: z.enum(['left', 'right', 'center']),
  notes: z.string().optional(),
});

export const createInjectionSchema = z.object({
  peptideId: z.string().min(1, 'Peptide selection is required'),
  dose: z.number().positive('Dose must be positive'),
  doseUnit: z.enum(['mg', 'mcg', 'iu', 'ml', 'units']),
  injectionSite: injectionSiteSchema,
  timestamp: z.date(),
  notes: z.string().optional(),
});

export const updateInjectionSchema = createInjectionSchema.extend({
  id: z.string().uuid('Invalid injection ID'),
});

export const deleteInjectionSchema = z.object({
  id: z.string().uuid('Invalid injection ID'),
});

// Type exports
export type CreateInjectionInput = z.infer<typeof createInjectionSchema>;
export type UpdateInjectionInput = z.infer<typeof updateInjectionSchema>;
export type DeleteInjectionInput = z.infer<typeof deleteInjectionSchema>;
export type InjectionSiteInput = z.infer<typeof injectionSiteSchema>;