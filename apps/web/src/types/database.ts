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
  peptideId: string;
  name: string;
  weeklyTarget?: number;
  dailyTarget?: number;
  scheduleType: ProtocolScheduleType;
  scheduleConfig: ProtocolScheduleConfig;
  startDate: Date;
  endDate?: Date;
  isTemplate: boolean;
  templateName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProtocolScheduleType = 'daily' | 'weekly' | 'custom' | 'every_other_day';

export interface ProtocolScheduleConfig {
  days?: string[]; // ['monday', 'wednesday', 'friday']
  times?: string[]; // ['morning', 'evening']
  time?: string; // 'bedtime'
  notes?: string;
}

export interface ProtocolTemplate {
  id: string;
  peptideId: string;
  name: string;
  weeklyTarget?: number;
  dailyTarget?: number;
  scheduleType: ProtocolScheduleType;
  scheduleConfig: ProtocolScheduleConfig;
  templateName: string;
  peptideName: string;
  peptideCategory: PeptideCategory;
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
  search?: string;
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

// Weekly summary types
export interface DailyInjectionSummary {
  date: Date;
  injections: Injection[];
  totalDoses: number;
  uniquePeptides: string[];
  sites: InjectionLocation[];
}

export interface WeeklySummaryData {
  totalInjections: number;
  uniquePeptides: string[];
  injectionSites: InjectionLocation[];
  dailyActivity: DailyInjectionSummary[];
  missedDoses: Date[];
  adherenceScore: number;
  weeklyTrend: 'improving' | 'declining' | 'stable';
}

// Weekly progress types for protocols
export interface ProtocolProgress {
  protocol: Protocol;
  peptide: Peptide;
  currentDose: number;
  targetDose: number;
  progressPercentage: number;
  remainingDose: number;
  status: 'on_track' | 'behind' | 'ahead' | 'complete';
  daysRemaining: number;
  suggestedNextDose?: number;
  lastInjectionDate?: Date;
  weeklyInjections: Injection[];
}

export interface WeeklyProgressData {
  weekStart: Date;
  weekEnd: Date;
  protocolProgresses: ProtocolProgress[];
  overallProgress: number;
  totalActiveProtocols: number;
  onTrackProtocols: number;
  behindProtocols: number;
}

export interface WeeklyProgressTrend {
  weekStart: Date;
  totalProgress: number;
  protocolCount: number;
  adherenceScore: number;
}

// Alert and notification types
export type AlertType =
  | 'dose_limit_warning'
  | 'dose_limit_exceeded'
  | 'missed_dose'
  | 'site_rotation_reminder'
  | 'protocol_milestone'
  | 'protocol_complete'
  | 'week_summary';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

export interface Alert {
  id: string;
  userId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  metadata?: {
    protocolId?: string;
    peptideId?: string;
    injectionId?: string;
    threshold?: number;
    currentValue?: number;
    targetValue?: number;
    suggestion?: string;
  };
  isRead: boolean;
  isDismissed: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface NotificationPreferences {
  doseLimit: {
    enabled: boolean;
    threshold: number; // percentage (default 90)
    deliveryMethods: NotificationMethod[];
  };
  missedDose: {
    enabled: boolean;
    gracePeriodHours: number; // default 6
    deliveryMethods: NotificationMethod[];
  };
  siteRotation: {
    enabled: boolean;
    maxConsecutiveUses: number; // default 3
    deliveryMethods: NotificationMethod[];
  };
  protocolMilestones: {
    enabled: boolean;
    milestones: number[]; // [25, 50, 75, 100]
    deliveryMethods: NotificationMethod[];
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
  };
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export type NotificationMethod = 'in_app' | 'push' | 'email';

export interface InjectionSiteUsage {
  location: InjectionLocation;
  side: 'left' | 'right' | 'center';
  lastUsed: Date;
  consecutiveUses: number;
  totalUses: number;
  daysSinceLastUse: number;
}

export interface DoseAlertContext {
  protocol: Protocol;
  peptide: Peptide;
  currentWeeklyDose: number;
  targetWeeklyDose: number;
  progressPercentage: number;
  daysRemaining: number;
  threshold: number;
}

export interface MissedDoseContext {
  protocol: Protocol;
  peptide: Peptide;
  expectedDate: Date;
  hoursOverdue: number;
  lastInjectionDate?: Date;
  gracePeriodExpired: boolean;
}

// Analytics Types
export interface ProtocolAdherenceData {
  protocolId: string;
  protocolName: string;
  peptideName: string;
  adherencePercentage: number;
  totalPlannedDoses: number;
  actualDoses: number;
  missedDoses: number;
  streakDays: number;
  longestStreak: number;
  averageTimeBetweenDoses: number;
  doseConsistencyScore: number;
}

export interface InjectionSiteAnalytics {
  location: InjectionLocation;
  side: 'left' | 'right' | 'center';
  usageCount: number;
  usagePercentage: number;
  lastUsed: Date;
  daysSinceLastUse: number;
  recommendedRotation: boolean;
  overused: boolean;
}

export interface TimingPatternAnalytics {
  optimalTimeWindow: {
    start: string;
    end: string;
  };
  consistencyScore: number;
  averageTime: string;
  mostCommonTimes: {
    time: string;
    count: number;
  }[];
  dayOfWeekPatterns: {
    day: string;
    averageTime: string;
    consistency: number;
  }[];
}

export interface DoseVarianceAnalytics {
  targetDose: number;
  averageDose: number;
  variance: number;
  standardDeviation: number;
  accuracyPercentage: number;
  highVarianceDates: Date[];
  trend: 'stable' | 'increasing' | 'decreasing';
}

export interface ComprehensiveAnalytics {
  dateRange: {
    start: Date;
    end: Date;
  };
  protocolAdherence: ProtocolAdherenceData[];
  injectionSites: InjectionSiteAnalytics[];
  timingPatterns: TimingPatternAnalytics;
  doseVariance: DoseVarianceAnalytics[];
  keyInsights: string[];
  recommendations: string[];
}

export interface AnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  protocolIds?: string[];
  peptideIds?: string[];
  reportType?: 'weekly' | 'monthly' | 'quarterly' | 'custom';
}