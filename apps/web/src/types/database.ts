// Database type definitions for Peptide Tracker

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  preferences: UserPreferences;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  timezone?: string;
  units?: {
    weight: 'kg' | 'lbs';
    dose: 'mg' | 'mcg';
  };
  notifications?: {
    injectionReminders: boolean;
    weeklyReports: boolean;
  };
  theme?: 'dark' | 'light';
}

export type SubscriptionTier = 'free' | 'premium' | 'expert';

export interface Peptide {
  id: string;
  userId: string | null; // null for global templates
  name: string;
  isCustom: boolean;
  category: PeptideCategory;
  typicalDoseRange: DoseRange;
  safetyNotes: string[];
  jayContentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PeptideCategory =
  | 'weight_loss'
  | 'muscle_building'
  | 'recovery'
  | 'longevity'
  | 'cognitive'
  | 'other';

export interface DoseRange {
  min: number;
  max: number;
  unit: DoseUnit;
  frequency: DoseFrequency;
}

export type DoseUnit = 'mg' | 'mcg' | 'iu' | 'ml' | 'units';

export type DoseFrequency =
  | 'daily'
  | 'twice_daily'
  | 'weekly'
  | 'twice_weekly'
  | 'monthly'
  | 'as_needed';

export interface Injection {
  id: string;
  userId: string;
  peptideId: string;
  dose: number;
  doseUnit: DoseUnit;
  injectionSite: InjectionSite;
  timestamp: Date;
  notes: string | null;
  protocolId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InjectionSite {
  location: InjectionLocation;
  subLocation?: string;
  side: 'left' | 'right' | 'center';
  notes?: string;
}

export type InjectionLocation =
  | 'abdomen'
  | 'thigh'
  | 'arm'
  | 'glute'
  | 'shoulder'
  | 'other';

export interface Protocol {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  peptideId: string;
  schedule: ProtocolSchedule;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProtocolSchedule {
  frequency: DoseFrequency;
  dose: number;
  doseUnit: DoseUnit;
  duration?: {
    weeks: number;
    cyclePattern?: string;
  };
  instructions?: string[];
}

export interface WellnessMetric {
  id: string;
  userId: string;
  metricType: WellnessMetricType;
  value: number;
  unit: string;
  timestamp: Date;
  notes: string | null;
  injectionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type WellnessMetricType =
  | 'weight'
  | 'body_fat'
  | 'muscle_mass'
  | 'energy_level'
  | 'sleep_quality'
  | 'mood'
  | 'other';

export interface PeptideTemplate {
  id: string;
  name: string;
  category: PeptideCategory;
  typicalDoseRange: DoseRange;
  safetyNotes: string[];
  jayContentId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Database utility types
export interface DatabaseError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Query filter types
export interface InjectionFilters {
  peptideId?: string;
  dateRange?: DateRange;
  injectionSite?: InjectionLocation;
}

export interface PeptideFilters {
  category?: PeptideCategory;
  isCustom?: boolean;
}

export interface PeptideFiltersInput {
  category?: PeptideCategory;
  search?: string;
  isCustom?: boolean;
}

export interface WellnessMetricFilters {
  metricType?: WellnessMetricType;
  dateRange?: DateRange;
  injectionId?: string;
}