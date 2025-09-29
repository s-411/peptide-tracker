import { supabase } from './supabase';
import type {
  User,
  Peptide,
  Injection,
  Protocol,
  ProtocolTemplate,
  WellnessMetric,
  PeptideTemplate,
  InjectionFilters,
  PeptideFilters,
  WellnessMetricFilters,
  PaginationOptions,
  WeeklySummaryData,
  DailyInjectionSummary,
  WeeklyProgressData,
  ProtocolProgress,
  WeeklyProgressTrend,
  Alert,
  AlertType,
  AlertSeverity,
  NotificationPreferences,
  InjectionSiteUsage,
  DoseAlertContext,
  MissedDoseContext,
  ProtocolAdherenceData,
  InjectionSiteAnalytics,
  TimingPatternAnalytics,
  DoseVarianceAnalytics,
  ComprehensiveAnalytics,
  AnalyticsFilters,
} from '@/types/database';

export class DatabaseService {
  // User operations
  static async createUser(clerkUserId: string, email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email,
          preferences: {},
          subscription_tier: 'free',
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapUserFromDb(data);
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (error) throw error;
      return this.mapUserFromDb(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async updateUserPreferences(
    clerkUserId: string,
    preferences: any
  ): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ preferences })
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single();

      if (error) throw error;
      return this.mapUserFromDb(data);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return null;
    }
  }

  // Peptide operations
  static async getPeptideTemplates(): Promise<PeptideTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('peptide_templates')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data.map(this.mapPeptideTemplateFromDb);
    } catch (error) {
      console.error('Error fetching peptide templates:', error);
      return [];
    }
  }

  static async getUserPeptides(
    userId: string,
    filters?: PeptideFilters
  ): Promise<Peptide[]> {
    try {
      let query = supabase
        .from('peptides')
        .select('*')
        .eq('user_id', userId);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.isCustom !== undefined) {
        query = query.eq('is_custom', filters.isCustom);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this.mapPeptideFromDb);
    } catch (error) {
      console.error('Error fetching user peptides:', error);
      return [];
    }
  }

  static async getPeptide(peptideId: string): Promise<Peptide | null> {
    try {
      const { data, error } = await supabase
        .from('peptides')
        .select('*')
        .eq('id', peptideId)
        .single();

      if (error) throw error;
      return this.mapPeptideFromDb(data);
    } catch (error) {
      console.error('Error fetching peptide:', error);
      return null;
    }
  }

  static async createPeptide(peptide: Omit<Peptide, 'id' | 'createdAt' | 'updatedAt'>): Promise<Peptide | null> {
    try {
      const { data, error } = await supabase
        .from('peptides')
        .insert({
          user_id: peptide.userId,
          name: peptide.name,
          is_custom: peptide.isCustom,
          category: peptide.category,
          typical_dose_range: peptide.typicalDoseRange,
          safety_notes: peptide.safetyNotes,
          jay_content_id: peptide.jayContentId,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapPeptideFromDb(data);
    } catch (error) {
      console.error('Error creating peptide:', error);
      return null;
    }
  }

  static async updatePeptide(
    peptideId: string,
    updates: Partial<Omit<Peptide, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Peptide | null> {
    try {
      const { data, error } = await supabase
        .from('peptides')
        .update({
          name: updates.name,
          category: updates.category,
          typical_dose_range: updates.typicalDoseRange,
          safety_notes: updates.safetyNotes,
          jay_content_id: updates.jayContentId,
        })
        .eq('id', peptideId)
        .select()
        .single();

      if (error) throw error;
      return this.mapPeptideFromDb(data);
    } catch (error) {
      console.error('Error updating peptide:', error);
      return null;
    }
  }

  static async deletePeptide(peptideId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('peptides')
        .delete()
        .eq('id', peptideId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting peptide:', error);
      return false;
    }
  }

  // Injection operations
  static async getUserInjections(
    userId: string,
    filters?: InjectionFilters,
    pagination?: PaginationOptions
  ): Promise<Injection[]> {
    try {
      let query = supabase
        .from('injections')
        .select(`
          *,
          peptides:peptide_id(name, category)
        `)
        .eq('user_id', userId);

      if (filters?.peptideId) {
        query = query.eq('peptide_id', filters.peptideId);
      }

      if (filters?.dateRange) {
        query = query
          .gte('timestamp', filters.dateRange.start.toISOString())
          .lte('timestamp', filters.dateRange.end.toISOString());
      }

      if (filters?.injectionSite) {
        query = query.eq('injection_site->location', filters.injectionSite);
      }

      if (filters?.search) {
        // Search across notes and peptide names using ilike for case-insensitive partial matching
        const searchTerm = `%${filters.search}%`;
        query = query.or(`notes.ilike.${searchTerm},peptides.name.ilike.${searchTerm}`);
      }

      if (pagination) {
        query = query
          .range(pagination.offset, pagination.offset + pagination.limit - 1);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return data.map(this.mapInjectionFromDb);
    } catch (error) {
      console.error('Error fetching user injections:', error);
      return [];
    }
  }

  static async createInjection(injection: Omit<Injection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Injection | null> {
    try {
      const { data, error } = await supabase
        .from('injections')
        .insert({
          user_id: injection.userId,
          peptide_id: injection.peptideId,
          dose: injection.dose,
          dose_unit: injection.doseUnit,
          injection_site: injection.injectionSite,
          timestamp: injection.timestamp.toISOString(),
          notes: injection.notes,
          protocol_id: injection.protocolId,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapInjectionFromDb(data);
    } catch (error) {
      console.error('Error creating injection:', error);
      return null;
    }
  }

  static async getInjectionById(injectionId: string, userId: string): Promise<Injection | null> {
    try {
      const { data, error } = await supabase
        .from('injections')
        .select(`
          *,
          peptides:peptide_id(name, category)
        `)
        .eq('id', injectionId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return this.mapInjectionFromDb(data);
    } catch {
      // Error getting injection
      return null;
    }
  }

  static async updateInjection(
    injectionId: string,
    updates: Partial<Omit<Injection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Injection | null> {
    try {
      const { data, error } = await supabase
        .from('injections')
        .update({
          peptide_id: updates.peptideId,
          dose: updates.dose,
          dose_unit: updates.doseUnit,
          injection_site: updates.injectionSite,
          timestamp: updates.timestamp?.toISOString(),
          notes: updates.notes,
          protocol_id: updates.protocolId,
        })
        .eq('id', injectionId)
        .select(`
          *,
          peptides:peptide_id(name, category)
        `)
        .single();

      if (error) throw error;
      return this.mapInjectionFromDb(data);
    } catch {
      // Error updating injection
      return null;
    }
  }

  static async deleteInjection(injectionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('injections')
        .delete()
        .eq('id', injectionId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch {
      // Error deleting injection
      return false;
    }
  }

  static async duplicateInjection(injectionId: string, userId: string): Promise<Injection | null> {
    try {
      // First get the original injection
      const original = await this.getInjectionById(injectionId, userId);
      if (!original) return null;

      // Create a duplicate with new timestamp
      const duplicate = await this.createInjection({
        userId: original.userId,
        peptideId: original.peptideId,
        dose: original.dose,
        doseUnit: original.doseUnit,
        injectionSite: original.injectionSite,
        timestamp: new Date(), // Use current time for duplicate
        notes: original.notes ? `${original.notes} (duplicated)` : 'Duplicated injection',
        protocolId: original.protocolId,
      });

      return duplicate;
    } catch {
      // Error duplicating injection
      return null;
    }
  }

  // Protocol operations
  static async getProtocols(userId: string, options?: { includeInactive?: boolean }): Promise<Protocol[]> {
    try {
      let query = supabase
        .from('protocols')
        .select('*')
        .eq('user_id', userId)
        .eq('is_template', false);

      if (!options?.includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this.mapProtocolFromDb);
    } catch (error) {
      console.error('Error fetching protocols:', error);
      return [];
    }
  }

  static async getProtocol(protocolId: string): Promise<Protocol | null> {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', protocolId)
        .single();

      if (error) throw error;
      return this.mapProtocolFromDb(data);
    } catch (error) {
      console.error('Error fetching protocol:', error);
      return null;
    }
  }

  static async createProtocol(protocol: Omit<Protocol, 'id' | 'createdAt' | 'updatedAt'>): Promise<Protocol | null> {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .insert({
          user_id: protocol.userId,
          peptide_id: protocol.peptideId,
          name: protocol.name,
          weekly_target: protocol.weeklyTarget,
          daily_target: protocol.dailyTarget,
          schedule_type: protocol.scheduleType,
          schedule_config: protocol.scheduleConfig,
          start_date: protocol.startDate.toISOString().split('T')[0],
          end_date: protocol.endDate?.toISOString().split('T')[0],
          is_template: protocol.isTemplate,
          template_name: protocol.templateName,
          is_active: protocol.isActive
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapProtocolFromDb(data);
    } catch (error) {
      console.error('Error creating protocol:', error);
      return null;
    }
  }

  static async updateProtocol(protocolId: string, updates: Partial<Protocol>): Promise<Protocol | null> {
    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.weeklyTarget !== undefined) updateData.weekly_target = updates.weeklyTarget;
      if (updates.dailyTarget !== undefined) updateData.daily_target = updates.dailyTarget;
      if (updates.scheduleType !== undefined) updateData.schedule_type = updates.scheduleType;
      if (updates.scheduleConfig !== undefined) updateData.schedule_config = updates.scheduleConfig;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString().split('T')[0];
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate?.toISOString().split('T')[0];
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.templateName !== undefined) updateData.template_name = updates.templateName;

      const { data, error } = await supabase
        .from('protocols')
        .update(updateData)
        .eq('id', protocolId)
        .select()
        .single();

      if (error) throw error;
      return this.mapProtocolFromDb(data);
    } catch (error) {
      console.error('Error updating protocol:', error);
      return null;
    }
  }

  static async deleteProtocol(protocolId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', protocolId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting protocol:', error);
      return false;
    }
  }

  static async getProtocolTemplates(): Promise<ProtocolTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('protocol_templates')
        .select('*')
        .order('peptide_category', { ascending: true });

      if (error) throw error;
      return data?.map(template => ({
        id: template.id,
        peptideId: template.peptide_id,
        name: template.name,
        weeklyTarget: template.weekly_target ? parseFloat(template.weekly_target) : undefined,
        dailyTarget: template.daily_target ? parseFloat(template.daily_target) : undefined,
        scheduleType: template.schedule_type,
        scheduleConfig: template.schedule_config || {},
        templateName: template.template_name,
        peptideName: template.peptide_name,
        peptideCategory: template.peptide_category,
      })) || [];
    } catch (error) {
      console.error('Error fetching protocol templates:', error);
      return [];
    }
  }

  static async getActiveProtocolsForUser(userId: string): Promise<Protocol[]> {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_template', false)
        .lte('start_date', new Date().toISOString().split('T')[0])
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`);

      if (error) throw error;
      return data.map(this.mapProtocolFromDb);
    } catch (error) {
      console.error('Error fetching active protocols:', error);
      return [];
    }
  }

  // Wellness metrics operations
  static async getUserWellnessMetrics(
    userId: string,
    filters?: WellnessMetricFilters,
    pagination?: PaginationOptions
  ): Promise<WellnessMetric[]> {
    try {
      let query = supabase
        .from('wellness_metrics')
        .select('*')
        .eq('user_id', userId);

      if (filters?.metricType) {
        query = query.eq('metric_type', filters.metricType);
      }

      if (filters?.dateRange) {
        query = query
          .gte('timestamp', filters.dateRange.start.toISOString())
          .lte('timestamp', filters.dateRange.end.toISOString());
      }

      if (filters?.injectionId) {
        query = query.eq('injection_id', filters.injectionId);
      }

      if (pagination) {
        query = query
          .range(pagination.offset, pagination.offset + pagination.limit - 1);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return data.map(this.mapWellnessMetricFromDb);
    } catch (error) {
      console.error('Error fetching wellness metrics:', error);
      return [];
    }
  }

  // Mapping functions to convert database snake_case to camelCase
  private static mapUserFromDb(data: any): User {
    return {
      id: data.id,
      clerkUserId: data.clerk_user_id,
      email: data.email,
      preferences: data.preferences || {},
      subscriptionTier: data.subscription_tier,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapPeptideFromDb(data: any): Peptide {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      isCustom: data.is_custom,
      category: data.category,
      typicalDoseRange: data.typical_dose_range,
      safetyNotes: data.safety_notes || [],
      jayContentId: data.jay_content_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapInjectionFromDb(data: any): Injection {
    return {
      id: data.id,
      userId: data.user_id,
      peptideId: data.peptide_id,
      dose: parseFloat(data.dose),
      doseUnit: data.dose_unit,
      injectionSite: data.injection_site,
      timestamp: new Date(data.timestamp),
      notes: data.notes,
      protocolId: data.protocol_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapProtocolFromDb(data: any): Protocol {
    return {
      id: data.id,
      userId: data.user_id,
      peptideId: data.peptide_id,
      name: data.name,
      weeklyTarget: data.weekly_target ? parseFloat(data.weekly_target) : undefined,
      dailyTarget: data.daily_target ? parseFloat(data.daily_target) : undefined,
      scheduleType: data.schedule_type,
      scheduleConfig: data.schedule_config || {},
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      isTemplate: data.is_template,
      templateName: data.template_name,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapWellnessMetricFromDb(data: any): WellnessMetric {
    return {
      id: data.id,
      userId: data.user_id,
      metricType: data.metric_type,
      value: parseFloat(data.value),
      unit: data.unit,
      timestamp: new Date(data.timestamp),
      notes: data.notes,
      injectionId: data.injection_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapPeptideTemplateFromDb(data: any): PeptideTemplate {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      typicalDoseRange: data.typical_dose_range,
      safetyNotes: data.safety_notes || [],
      jayContentId: data.jay_content_id,
      description: data.description,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  static async getWeeklySummary(userId: string): Promise<WeeklySummaryData | null> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Get injections for the last 7 days
      const { data: injections, error } = await supabase
        .from('injections')
        .select(`
          *,
          peptides!inner(name, category)
        `)
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const mappedInjections = injections.map(this.mapInjectionFromDb);

      // Get active protocols for adherence calculation
      const { data: protocols } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      const activeProtocols = protocols?.map(this.mapProtocolFromDb) || [];

      // Build daily activity summary
      const dailyActivity: DailyInjectionSummary[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const dayInjections = mappedInjections.filter(inj => {
          const injDate = new Date(inj.timestamp);
          injDate.setHours(0, 0, 0, 0);
          return injDate.getTime() === date.getTime();
        });

        dailyActivity.push({
          date,
          injections: dayInjections,
          totalDoses: dayInjections.length,
          uniquePeptides: [...new Set(dayInjections.map(inj => inj.peptideId))],
          sites: [...new Set(dayInjections.map(inj => inj.injectionSite.location))],
        });
      }

      // Calculate missed doses based on protocols
      const missedDoses: Date[] = [];
      for (const protocol of activeProtocols) {
        let expectedDays: number[] = [];

        // Calculate expected injection days based on schedule type
        switch (protocol.scheduleType) {
          case 'daily':
            expectedDays = [0, 1, 2, 3, 4, 5, 6];
            break;
          case 'weekly':
            expectedDays = [0]; // Assuming Sunday as default
            break;
          case 'every_other_day':
            expectedDays = [0, 2, 4, 6]; // Every other day starting Sunday
            break;
          case 'custom':
            if (protocol.scheduleConfig.days) {
              const dayMap: { [key: string]: number } = {
                'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
                'thursday': 4, 'friday': 5, 'saturday': 6
              };
              expectedDays = protocol.scheduleConfig.days
                .map(day => dayMap[day.toLowerCase()])
                .filter(day => day !== undefined);
            }
            break;
        }

        for (const dayIndex of expectedDays) {
          const expectedDate = new Date(startDate);
          expectedDate.setDate(startDate.getDate() + dayIndex);

          const hasInjection = dailyActivity[dayIndex].injections.some(
            inj => inj.peptideId === protocol.peptideId
          );

          if (!hasInjection) {
            missedDoses.push(expectedDate);
          }
        }
      }

      // Calculate adherence score
      const totalExpectedDoses = activeProtocols.reduce((total, protocol) => {
        switch (protocol.scheduleType) {
          case 'daily': return total + 7;
          case 'weekly': return total + 1;
          case 'every_other_day': return total + 4;
          case 'custom':
            return total + (protocol.scheduleConfig.days?.length || 0);
          default: return total;
        }
      }, 0);

      const adherenceScore = totalExpectedDoses > 0
        ? Math.round(((totalExpectedDoses - missedDoses.length) / totalExpectedDoses) * 100)
        : 100;

      // Calculate weekly trend
      const firstHalf = dailyActivity.slice(0, 3).reduce((sum, day) => sum + day.totalDoses, 0);
      const secondHalf = dailyActivity.slice(4, 7).reduce((sum, day) => sum + day.totalDoses, 0);
      let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';

      if (secondHalf > firstHalf) {
        weeklyTrend = 'improving';
      } else if (secondHalf < firstHalf) {
        weeklyTrend = 'declining';
      }

      return {
        totalInjections: mappedInjections.length,
        uniquePeptides: [...new Set(mappedInjections.map(inj => inj.peptideId))],
        injectionSites: [...new Set(mappedInjections.map(inj => inj.injectionSite.location))],
        dailyActivity,
        missedDoses,
        adherenceScore,
        weeklyTrend,
      };
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      return null;
    }
  }

  // Weekly Progress operations
  static async getWeeklyProgress(userId: string, weekStart?: Date): Promise<WeeklyProgressData | null> {
    try {
      // Calculate week boundaries
      const startOfWeek = weekStart || this.getStartOfWeek(new Date());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Get active protocols for the user
      const activeProtocols = await this.getActiveProtocolsForUser(userId);
      if (activeProtocols.length === 0) {
        return {
          weekStart: startOfWeek,
          weekEnd: endOfWeek,
          protocolProgresses: [],
          overallProgress: 0,
          totalActiveProtocols: 0,
          onTrackProtocols: 0,
          behindProtocols: 0,
        };
      }

      // Get injections for the week
      const { data: injections, error: injError } = await supabase
        .from('injections')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startOfWeek.toISOString())
        .lte('timestamp', endOfWeek.toISOString());

      if (injError) throw injError;
      const weeklyInjections = injections.map(this.mapInjectionFromDb);

      // Calculate progress for each protocol
      const protocolProgresses: ProtocolProgress[] = [];

      for (const protocol of activeProtocols) {
        const peptide = await this.getPeptide(protocol.peptideId);
        if (!peptide) continue;

        // Filter injections for this protocol
        const protocolInjections = weeklyInjections.filter(inj => inj.peptideId === protocol.peptideId);

        // Calculate current dose for this week
        const currentDose = protocolInjections.reduce((total, inj) => total + inj.dose, 0);

        // Determine target dose based on protocol schedule
        const targetDose = this.calculateWeeklyTargetDose(protocol);

        // Calculate progress percentage
        const progressPercentage = targetDose > 0 ? Math.min(Math.round((currentDose / targetDose) * 100), 100) : 100;
        const remainingDose = Math.max(targetDose - currentDose, 0);

        // Determine status
        const daysRemaining = this.getDaysRemainingInWeek(endOfWeek);
        let status: 'on_track' | 'behind' | 'ahead' | 'complete';

        if (progressPercentage >= 100) {
          status = 'complete';
        } else if (progressPercentage >= 90) {
          status = 'on_track';
        } else if (daysRemaining <= 2 && progressPercentage < 70) {
          status = 'behind';
        } else if (progressPercentage > 120) {
          status = 'ahead';
        } else {
          status = 'on_track';
        }

        // Find last injection date
        const lastInjection = protocolInjections
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

        // Calculate suggested next dose
        const suggestedNextDose = this.calculateSuggestedDose(protocol, remainingDose, daysRemaining);

        protocolProgresses.push({
          protocol,
          peptide,
          currentDose,
          targetDose,
          progressPercentage,
          remainingDose,
          status,
          daysRemaining,
          suggestedNextDose,
          lastInjectionDate: lastInjection?.timestamp,
          weeklyInjections: protocolInjections,
        });
      }

      // Calculate overall metrics
      const overallProgress = protocolProgresses.length > 0
        ? Math.round(protocolProgresses.reduce((sum, p) => sum + p.progressPercentage, 0) / protocolProgresses.length)
        : 0;

      const onTrackProtocols = protocolProgresses.filter(p => p.status === 'on_track' || p.status === 'complete').length;
      const behindProtocols = protocolProgresses.filter(p => p.status === 'behind').length;

      return {
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        protocolProgresses,
        overallProgress,
        totalActiveProtocols: activeProtocols.length,
        onTrackProtocols,
        behindProtocols,
      };
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
      return null;
    }
  }

  static async getWeeklyProgressTrends(userId: string, weeksBack: number = 4): Promise<WeeklyProgressTrend[]> {
    try {
      const trends: WeeklyProgressTrend[] = [];
      const today = new Date();

      for (let i = 0; i < weeksBack; i++) {
        const weekStart = this.getStartOfWeek(today);
        weekStart.setDate(weekStart.getDate() - (i * 7));

        const progressData = await this.getWeeklyProgress(userId, weekStart);
        if (progressData) {
          trends.push({
            weekStart: progressData.weekStart,
            totalProgress: progressData.overallProgress,
            protocolCount: progressData.totalActiveProtocols,
            adherenceScore: progressData.onTrackProtocols / Math.max(progressData.totalActiveProtocols, 1) * 100,
          });
        }
      }

      return trends.reverse(); // Oldest first
    } catch (error) {
      console.error('Error fetching weekly progress trends:', error);
      return [];
    }
  }

  private static calculateWeeklyTargetDose(protocol: Protocol): number {
    // If weekly target is explicitly set, use it
    if (protocol.weeklyTarget) {
      return protocol.weeklyTarget;
    }

    // If daily target is set, calculate based on schedule
    if (protocol.dailyTarget) {
      switch (protocol.scheduleType) {
        case 'daily':
          return protocol.dailyTarget * 7;
        case 'weekly':
          return protocol.dailyTarget;
        case 'every_other_day':
          return protocol.dailyTarget * 4; // ~4 injections per week
        case 'custom':
          const daysCount = protocol.scheduleConfig.days?.length || 1;
          return protocol.dailyTarget * daysCount;
        default:
          return protocol.dailyTarget;
      }
    }

    return 0;
  }

  private static calculateSuggestedDose(protocol: Protocol, remainingDose: number, daysRemaining: number): number {
    if (remainingDose <= 0 || daysRemaining <= 0) return 0;

    // For weekly schedules, suggest the full remaining dose
    if (protocol.scheduleType === 'weekly') {
      return remainingDose;
    }

    // For daily schedules, distribute remaining dose over remaining days
    if (protocol.scheduleType === 'daily') {
      return Math.round((remainingDose / Math.max(daysRemaining, 1)) * 100) / 100;
    }

    // For custom schedules, consider remaining scheduled days
    if (protocol.scheduleType === 'custom' && protocol.scheduleConfig.days) {
      const today = new Date();
      const currentDayOfWeek = today.getDay();
      const dayMap: { [key: string]: number } = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };

      const remainingScheduledDays = protocol.scheduleConfig.days
        .map(day => dayMap[day.toLowerCase()])
        .filter(dayNum => dayNum > currentDayOfWeek).length;

      if (remainingScheduledDays > 0) {
        return Math.round((remainingDose / remainingScheduledDays) * 100) / 100;
      }
    }

    // Default: suggest remaining dose
    return remainingDose;
  }

  private static getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day; // Sunday as start of week
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private static getDaysRemainingInWeek(endOfWeek: Date): number {
    const today = new Date();
    const diffTime = endOfWeek.getTime() - today.getTime();
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  }

  // Alert and Notification operations
  static async getUserAlerts(userId: string, includeRead: boolean = false): Promise<Alert[]> {
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false);

      if (!includeRead) {
        query = query.eq('is_read', false);
      }

      // Filter out expired alerts
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this.mapAlertFromDb);
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      return [];
    }
  }

  static async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert | null> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: alert.userId,
          alert_type: alert.alertType,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          action_text: alert.actionText,
          action_url: alert.actionUrl,
          metadata: alert.metadata || {},
          is_read: alert.isRead,
          is_dismissed: alert.isDismissed,
          expires_at: alert.expiresAt?.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapAlertFromDb(data);
    } catch (error) {
      console.error('Error creating alert:', error);
      return null;
    }
  }

  static async markAlertAsRead(alertId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  static async dismissAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return false;
    }
  }

  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data.notification_preferences || this.getDefaultNotificationPreferences();
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return this.getDefaultNotificationPreferences();
    }
  }

  static async updateNotificationPreferences(userId: string, preferences: NotificationPreferences): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ notification_preferences: preferences })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  static async getInjectionSiteUsage(userId: string, daysBack: number = 30): Promise<InjectionSiteUsage[]> {
    try {
      const { data, error } = await supabase.rpc('get_injection_site_usage', {
        p_user_id: userId,
        p_days_back: daysBack
      });

      if (error) throw error;

      return data.map((row: any) => ({
        location: row.location,
        side: row.side,
        lastUsed: new Date(row.last_used),
        consecutiveUses: row.consecutive_uses,
        totalUses: row.total_uses,
        daysSinceLastUse: row.days_since_last_use
      }));
    } catch (error) {
      console.error('Error fetching injection site usage:', error);
      return [];
    }
  }

  // Alert calculation methods
  static async calculateDoseAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const preferences = await this.getNotificationPreferences(userId);

    if (!preferences?.doseLimit.enabled) return alerts;

    const progressData = await this.getWeeklyProgress(userId);
    if (!progressData) return alerts;

    for (const progress of progressData.protocolProgresses) {
      const threshold = preferences.doseLimit.threshold;

      if (progress.progressPercentage >= threshold) {
        const context: DoseAlertContext = {
          protocol: progress.protocol,
          peptide: progress.peptide,
          currentWeeklyDose: progress.currentDose,
          targetWeeklyDose: progress.targetDose,
          progressPercentage: progress.progressPercentage,
          daysRemaining: progress.daysRemaining,
          threshold
        };

        // Check if we already have an alert for this protocol this week
        const existingAlerts = await this.getUserAlerts(userId);
        const hasRecentAlert = existingAlerts.some(alert =>
          alert.alertType === 'dose_limit_warning' &&
          alert.metadata?.protocolId === progress.protocol.id &&
          new Date(alert.createdAt) > this.getStartOfWeek(new Date())
        );

        if (!hasRecentAlert) {
          if (progress.progressPercentage >= 100) {
            alerts.push(await this.createDoseLimitExceededAlert(userId, context));
          } else if (progress.progressPercentage >= threshold) {
            alerts.push(await this.createDoseLimitWarningAlert(userId, context));
          }
        }
      }
    }

    return alerts.filter(Boolean);
  }

  static async calculateMissedDoseAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const preferences = await this.getNotificationPreferences(userId);

    if (!preferences?.missedDose.enabled) return alerts;

    const activeProtocols = await this.getActiveProtocolsForUser(userId);
    const gracePeriodHours = preferences.missedDose.gracePeriodHours;

    for (const protocol of activeProtocols) {
      const peptide = await this.getPeptide(protocol.peptideId);
      if (!peptide) continue;

      const expectedDates = this.calculateExpectedDoseDates(protocol);
      const recentInjections = await this.getUserInjections(userId, {
        peptideId: protocol.peptideId,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });

      for (const expectedDate of expectedDates) {
        const hoursOverdue = (Date.now() - expectedDate.getTime()) / (1000 * 60 * 60);

        if (hoursOverdue > gracePeriodHours) {
          const hasInjectionOnDay = recentInjections.some(inj =>
            new Date(inj.timestamp).toDateString() === expectedDate.toDateString()
          );

          if (!hasInjectionOnDay) {
            // Check for existing alert
            const existingAlerts = await this.getUserAlerts(userId);
            const hasRecentAlert = existingAlerts.some(alert =>
              alert.alertType === 'missed_dose' &&
              alert.metadata?.protocolId === protocol.id &&
              Math.abs(new Date(alert.createdAt).getTime() - expectedDate.getTime()) < 24 * 60 * 60 * 1000
            );

            if (!hasRecentAlert) {
              const context: MissedDoseContext = {
                protocol,
                peptide,
                expectedDate,
                hoursOverdue,
                lastInjectionDate: recentInjections[0]?.timestamp,
                gracePeriodExpired: true
              };

              alerts.push(await this.createMissedDoseAlert(userId, context));
            }
          }
        }
      }
    }

    return alerts.filter(Boolean);
  }

  static async calculateSiteRotationAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const preferences = await this.getNotificationPreferences(userId);

    if (!preferences?.siteRotation.enabled) return alerts;

    const siteUsage = await this.getInjectionSiteUsage(userId, 7);
    const maxConsecutive = preferences.siteRotation.maxConsecutiveUses;

    for (const site of siteUsage) {
      if (site.consecutiveUses >= maxConsecutive) {
        // Check for existing alert
        const existingAlerts = await this.getUserAlerts(userId);
        const hasRecentAlert = existingAlerts.some(alert =>
          alert.alertType === 'site_rotation_reminder' &&
          alert.metadata?.suggestion?.includes(`${site.location} ${site.side}`) &&
          new Date(alert.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (!hasRecentAlert) {
          alerts.push(await this.createSiteRotationAlert(userId, site, maxConsecutive));
        }
      }
    }

    return alerts.filter(Boolean);
  }

  static async calculateProtocolMilestoneAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const preferences = await this.getNotificationPreferences(userId);

    if (!preferences?.protocolMilestones.enabled) return alerts;

    const progressData = await this.getWeeklyProgress(userId);
    if (!progressData) return alerts;

    for (const progress of progressData.protocolProgresses) {
      for (const milestone of preferences.protocolMilestones.milestones) {
        if (progress.progressPercentage >= milestone) {
          // Check if we already have an alert for this milestone
          const existingAlerts = await this.getUserAlerts(userId);
          const hasRecentAlert = existingAlerts.some(alert =>
            (alert.alertType === 'protocol_milestone' || alert.alertType === 'protocol_complete') &&
            alert.metadata?.protocolId === progress.protocol.id &&
            alert.metadata?.currentValue === milestone &&
            new Date(alert.createdAt) > this.getStartOfWeek(new Date())
          );

          if (!hasRecentAlert) {
            if (milestone === 100) {
              alerts.push(await this.createProtocolCompleteAlert(userId, progress));
            } else {
              alerts.push(await this.createProtocolMilestoneAlert(userId, progress, milestone));
            }
          }
        }
      }
    }

    return alerts.filter(Boolean);
  }

  // Alert creation helper methods
  private static async createDoseLimitWarningAlert(userId: string, context: DoseAlertContext): Promise<Alert | null> {
    const remainingDose = context.targetWeeklyDose - context.currentWeeklyDose;

    return this.createAlert({
      userId,
      alertType: 'dose_limit_warning',
      severity: 'warning',
      title: `Approaching dose limit for ${context.peptide.name}`,
      message: `You've reached ${context.progressPercentage}% of your weekly target. ${remainingDose.toFixed(2)} ${context.peptide.typicalDoseRange.unit} remaining.`,
      actionText: 'View Progress',
      actionUrl: '/dashboard/protocols',
      metadata: {
        protocolId: context.protocol.id,
        peptideId: context.peptide.id,
        threshold: context.threshold,
        currentValue: context.progressPercentage,
        targetValue: 100
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    });
  }

  private static async createDoseLimitExceededAlert(userId: string, context: DoseAlertContext): Promise<Alert | null> {
    return this.createAlert({
      userId,
      alertType: 'dose_limit_exceeded',
      severity: 'error',
      title: `Weekly target exceeded for ${context.peptide.name}`,
      message: `You've exceeded your weekly target (${context.progressPercentage}%). Consider adjusting your protocol or consulting with your healthcare provider.`,
      actionText: 'Manage Protocol',
      actionUrl: '/dashboard/protocols',
      metadata: {
        protocolId: context.protocol.id,
        peptideId: context.peptide.id,
        currentValue: context.progressPercentage,
        targetValue: 100
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }

  private static async createMissedDoseAlert(userId: string, context: MissedDoseContext): Promise<Alert | null> {
    const hoursText = Math.round(context.hoursOverdue) === 1 ? 'hour' : 'hours';

    return this.createAlert({
      userId,
      alertType: 'missed_dose',
      severity: 'warning',
      title: `Missed dose: ${context.peptide.name}`,
      message: `Your ${context.peptide.name} dose was due ${Math.round(context.hoursOverdue)} ${hoursText} ago. Consider logging it now to stay on track.`,
      actionText: 'Log Injection',
      actionUrl: '/injections/log',
      metadata: {
        protocolId: context.protocol.id,
        peptideId: context.peptide.id,
        currentValue: context.hoursOverdue
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    });
  }

  private static async createSiteRotationAlert(userId: string, site: InjectionSiteUsage, maxConsecutive: number): Promise<Alert | null> {
    const suggestions = this.generateSiteRotationSuggestions(site);

    return this.createAlert({
      userId,
      alertType: 'site_rotation_reminder',
      severity: 'info',
      title: 'Consider rotating injection sites',
      message: `You've used ${site.location} (${site.side}) ${site.consecutiveUses} times recently. Try rotating to avoid tissue damage.`,
      actionText: 'View Suggestions',
      actionUrl: '/injections/log',
      metadata: {
        currentValue: site.consecutiveUses,
        targetValue: maxConsecutive,
        suggestion: suggestions.join(', ')
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }

  private static async createProtocolMilestoneAlert(userId: string, progress: ProtocolProgress, milestone: number): Promise<Alert | null> {
    return this.createAlert({
      userId,
      alertType: 'protocol_milestone',
      severity: 'success',
      title: `${milestone}% progress on ${progress.peptide.name}`,
      message: `Great job! You've reached ${milestone}% of your weekly target for ${progress.peptide.name}.`,
      actionText: 'View Progress',
      actionUrl: '/dashboard/protocols',
      metadata: {
        protocolId: progress.protocol.id,
        peptideId: progress.peptide.id,
        currentValue: milestone,
        targetValue: 100
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }

  private static async createProtocolCompleteAlert(userId: string, progress: ProtocolProgress): Promise<Alert | null> {
    return this.createAlert({
      userId,
      alertType: 'protocol_complete',
      severity: 'success',
      title: `Weekly target completed: ${progress.peptide.name}`,
      message: `🎉 Congratulations! You've completed your weekly target for ${progress.peptide.name}.`,
      actionText: 'View Progress',
      actionUrl: '/dashboard/protocols',
      metadata: {
        protocolId: progress.protocol.id,
        peptideId: progress.peptide.id,
        currentValue: 100,
        targetValue: 100
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }

  // Helper methods
  private static calculateExpectedDoseDates(protocol: Protocol): Date[] {
    const dates: Date[] = [];
    const startOfWeek = this.getStartOfWeek(new Date());

    switch (protocol.scheduleType) {
      case 'daily':
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(date.getDate() + i);
          dates.push(date);
        }
        break;
      case 'weekly':
        dates.push(startOfWeek);
        break;
      case 'every_other_day':
        for (let i = 0; i < 7; i += 2) {
          const date = new Date(startOfWeek);
          date.setDate(date.getDate() + i);
          dates.push(date);
        }
        break;
      case 'custom':
        if (protocol.scheduleConfig.days) {
          const dayMap: { [key: string]: number } = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
          };

          for (const dayName of protocol.scheduleConfig.days) {
            const dayIndex = dayMap[dayName.toLowerCase()];
            if (dayIndex !== undefined) {
              const date = new Date(startOfWeek);
              date.setDate(date.getDate() + dayIndex);
              dates.push(date);
            }
          }
        }
        break;
    }

    return dates;
  }

  private static generateSiteRotationSuggestions(currentSite: InjectionSiteUsage): string[] {
    const allSites = [
      'abdomen left', 'abdomen right',
      'thigh left', 'thigh right',
      'arm left', 'arm right'
    ];

    const currentSiteString = `${currentSite.location} ${currentSite.side}`;
    return allSites.filter(site => site !== currentSiteString).slice(0, 3);
  }

  private static getDefaultNotificationPreferences(): NotificationPreferences {
    return {
      doseLimit: {
        enabled: true,
        threshold: 90,
        deliveryMethods: ['in_app']
      },
      missedDose: {
        enabled: true,
        gracePeriodHours: 6,
        deliveryMethods: ['in_app']
      },
      siteRotation: {
        enabled: true,
        maxConsecutiveUses: 3,
        deliveryMethods: ['in_app']
      },
      protocolMilestones: {
        enabled: true,
        milestones: [25, 50, 75, 100],
        deliveryMethods: ['in_app']
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      emailNotifications: false,
      pushNotifications: false
    };
  }

  private static mapAlertFromDb(data: any): Alert {
    return {
      id: data.id,
      userId: data.user_id,
      alertType: data.alert_type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      actionText: data.action_text,
      actionUrl: data.action_url,
      metadata: data.metadata || {},
      isRead: data.is_read,
      isDismissed: data.is_dismissed,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  // Analytics Methods
  static async getProtocolAdherence(
    userId: string,
    filters?: AnalyticsFilters
  ): Promise<ProtocolAdherenceData[]> {
    try {
      const dateRange = filters?.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      };

      // Get user protocols
      const protocols = await this.getUserProtocols(userId);
      const results: ProtocolAdherenceData[] = [];

      for (const protocol of protocols) {
        if (filters?.protocolIds && !filters.protocolIds.includes(protocol.id)) {
          continue;
        }

        // Get injections for this protocol in date range
        const { data: injections } = await supabase
          .from('injections')
          .select(`
            *,
            peptides (name)
          `)
          .eq('user_id', userId)
          .eq('peptide_id', protocol.peptideId)
          .gte('timestamp', dateRange.start.toISOString())
          .lte('timestamp', dateRange.end.toISOString())
          .order('timestamp', { ascending: true });

        if (!injections) continue;

        const peptideName = injections[0]?.peptides?.name || 'Unknown';

        // Calculate planned doses based on protocol schedule
        const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
        let plannedDoses = 0;

        switch (protocol.scheduleType) {
          case 'daily':
            plannedDoses = totalDays;
            break;
          case 'every_other_day':
            plannedDoses = Math.ceil(totalDays / 2);
            break;
          case 'weekly':
            plannedDoses = Math.ceil(totalDays / 7);
            break;
          case 'custom':
            // Custom schedule calculation based on schedule_config
            const config = protocol.scheduleConfig as any;
            if (config.daysOfWeek) {
              const weeksInPeriod = Math.ceil(totalDays / 7);
              plannedDoses = config.daysOfWeek.length * weeksInPeriod;
            } else {
              plannedDoses = totalDays; // Default to daily
            }
            break;
          default:
            plannedDoses = totalDays;
        }

        const actualDoses = injections.length;
        const adherencePercentage = plannedDoses > 0 ? (actualDoses / plannedDoses) * 100 : 0;

        // Calculate streak and consistency
        const { streakDays, longestStreak, averageTimeBetween, consistencyScore } =
          this.calculateAdherenceMetrics(injections.map(this.mapInjectionFromDb));

        results.push({
          protocolId: protocol.id,
          protocolName: protocol.name,
          peptideName,
          adherencePercentage: Math.min(adherencePercentage, 100),
          totalPlannedDoses: plannedDoses,
          actualDoses,
          missedDoses: Math.max(plannedDoses - actualDoses, 0),
          streakDays,
          longestStreak,
          averageTimeBetweenDoses: averageTimeBetween,
          doseConsistencyScore: consistencyScore
        });
      }

      return results;
    } catch (error) {
      console.error('Error getting protocol adherence:', error);
      return [];
    }
  }

  static async getInjectionSiteAnalytics(
    userId: string,
    filters?: AnalyticsFilters
  ): Promise<InjectionSiteAnalytics[]> {
    try {
      const dateRange = filters?.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const { data: injections } = await supabase
        .from('injections')
        .select('injection_site, timestamp')
        .eq('user_id', userId)
        .gte('timestamp', dateRange.start.toISOString())
        .lte('timestamp', dateRange.end.toISOString())
        .order('timestamp', { ascending: false });

      if (!injections) return [];

      // Group by site location and side
      const siteUsage: Map<string, {
        location: string;
        side: string;
        count: number;
        lastUsed: Date;
        injections: Date[];
      }> = new Map();

      injections.forEach(injection => {
        const site = injection.injection_site;
        if (!site?.location) return;

        const key = `${site.location}-${site.side || 'center'}`;
        const existing = siteUsage.get(key);

        if (existing) {
          existing.count++;
          existing.injections.push(new Date(injection.timestamp));
          if (new Date(injection.timestamp) > existing.lastUsed) {
            existing.lastUsed = new Date(injection.timestamp);
          }
        } else {
          siteUsage.set(key, {
            location: site.location,
            side: site.side || 'center',
            count: 1,
            lastUsed: new Date(injection.timestamp),
            injections: [new Date(injection.timestamp)]
          });
        }
      });

      const totalInjections = injections.length;
      const results: InjectionSiteAnalytics[] = [];

      siteUsage.forEach((usage) => {
        const daysSinceLastUse = Math.floor(
          (new Date().getTime() - usage.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
        );

        const usagePercentage = (usage.count / totalInjections) * 100;
        const overused = usagePercentage > 25; // More than 25% usage might indicate overuse
        const recommendedRotation = daysSinceLastUse < 7 && usage.count > 1;

        results.push({
          location: usage.location as any,
          side: usage.side as any,
          usageCount: usage.count,
          usagePercentage,
          lastUsed: usage.lastUsed,
          daysSinceLastUse,
          recommendedRotation,
          overused
        });
      });

      return results.sort((a, b) => b.usageCount - a.usageCount);
    } catch (error) {
      console.error('Error getting injection site analytics:', error);
      return [];
    }
  }

  static async getTimingPatternAnalytics(
    userId: string,
    filters?: AnalyticsFilters
  ): Promise<TimingPatternAnalytics> {
    try {
      const dateRange = filters?.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const { data: injections } = await supabase
        .from('injections')
        .select('timestamp')
        .eq('user_id', userId)
        .gte('timestamp', dateRange.start.toISOString())
        .lte('timestamp', dateRange.end.toISOString())
        .order('timestamp', { ascending: true });

      if (!injections || injections.length === 0) {
        return {
          optimalTimeWindow: { start: '09:00', end: '10:00' },
          consistencyScore: 0,
          averageTime: '09:00',
          mostCommonTimes: [],
          dayOfWeekPatterns: []
        };
      }

      // Analyze injection times
      const timeData = injections.map(inj => {
        const date = new Date(inj.timestamp);
        return {
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          hour: date.getHours(),
          dayOfWeek: date.toLocaleDateString('en', { weekday: 'long' }),
          timestamp: date
        };
      });

      // Find most common times (by hour)
      const hourCounts: Map<number, number> = new Map();
      timeData.forEach(data => {
        hourCounts.set(data.hour, (hourCounts.get(data.hour) || 0) + 1);
      });

      const mostCommonTimes = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hour, count]) => ({
          time: `${hour.toString().padStart(2, '0')}:00`,
          count
        }));

      // Calculate consistency score (lower variance = higher consistency)
      const hours = timeData.map(d => d.hour);
      const avgHour = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;
      const variance = hours.reduce((sum, hour) => sum + Math.pow(hour - avgHour, 2), 0) / hours.length;
      const consistencyScore = Math.max(0, 100 - (variance * 10)); // Scale variance to 0-100

      // Day of week patterns
      const dayPatterns: Map<string, number[]> = new Map();
      timeData.forEach(data => {
        if (!dayPatterns.has(data.dayOfWeek)) {
          dayPatterns.set(data.dayOfWeek, []);
        }
        dayPatterns.get(data.dayOfWeek)!.push(data.hour);
      });

      const dayOfWeekPatterns = Array.from(dayPatterns.entries()).map(([day, hours]) => {
        const avgTime = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;
        const variance = hours.reduce((sum, hour) => sum + Math.pow(hour - avgTime, 2), 0) / hours.length;
        const consistency = Math.max(0, 100 - (variance * 10));

        return {
          day,
          averageTime: `${Math.round(avgTime).toString().padStart(2, '0')}:00`,
          consistency
        };
      });

      // Optimal time window (most frequent hour ± 1 hour)
      const mostFrequentHour = mostCommonTimes[0]?.time.split(':')[0] || '9';
      const optimalHour = parseInt(mostFrequentHour);

      return {
        optimalTimeWindow: {
          start: `${Math.max(0, optimalHour - 1).toString().padStart(2, '0')}:00`,
          end: `${Math.min(23, optimalHour + 1).toString().padStart(2, '0')}:00`
        },
        consistencyScore,
        averageTime: `${Math.round(avgHour).toString().padStart(2, '0')}:00`,
        mostCommonTimes,
        dayOfWeekPatterns
      };
    } catch (error) {
      console.error('Error getting timing pattern analytics:', error);
      return {
        optimalTimeWindow: { start: '09:00', end: '10:00' },
        consistencyScore: 0,
        averageTime: '09:00',
        mostCommonTimes: [],
        dayOfWeekPatterns: []
      };
    }
  }

  static async getDoseVarianceAnalytics(
    userId: string,
    filters?: AnalyticsFilters
  ): Promise<DoseVarianceAnalytics[]> {
    try {
      const protocols = await this.getUserProtocols(userId);
      const results: DoseVarianceAnalytics[] = [];

      const dateRange = filters?.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      for (const protocol of protocols) {
        if (filters?.protocolIds && !filters.protocolIds.includes(protocol.id)) {
          continue;
        }

        const { data: injections } = await supabase
          .from('injections')
          .select('dose, timestamp')
          .eq('user_id', userId)
          .eq('peptide_id', protocol.peptideId)
          .gte('timestamp', dateRange.start.toISOString())
          .lte('timestamp', dateRange.end.toISOString())
          .order('timestamp', { ascending: true });

        if (!injections || injections.length === 0) continue;

        const targetDose = protocol.dailyTarget || protocol.weeklyTarget || 0;
        const doses = injections.map(inj => inj.dose).filter(dose => dose > 0);

        if (doses.length === 0) continue;

        const averageDose = doses.reduce((sum, dose) => sum + dose, 0) / doses.length;
        const variance = doses.reduce((sum, dose) => sum + Math.pow(dose - averageDose, 2), 0) / doses.length;
        const standardDeviation = Math.sqrt(variance);

        // Accuracy percentage (how close to target)
        const accuracyPercentage = targetDose > 0 ?
          Math.max(0, 100 - (Math.abs(averageDose - targetDose) / targetDose * 100)) : 0;

        // Identify high variance dates (doses > 1 std dev from mean)
        const highVarianceDates = injections
          .filter(inj => Math.abs(inj.dose - averageDose) > standardDeviation)
          .map(inj => new Date(inj.timestamp));

        // Trend analysis (simple linear regression)
        const trend = this.calculateDoseTrend(injections.map(inj => ({
          dose: inj.dose,
          date: new Date(inj.timestamp)
        })));

        results.push({
          targetDose,
          averageDose,
          variance,
          standardDeviation,
          accuracyPercentage,
          highVarianceDates,
          trend
        });
      }

      return results;
    } catch (error) {
      console.error('Error getting dose variance analytics:', error);
      return [];
    }
  }

  static async getComprehensiveAnalytics(
    userId: string,
    filters?: AnalyticsFilters
  ): Promise<ComprehensiveAnalytics> {
    try {
      const dateRange = filters?.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      // Get all analytics components
      const [protocolAdherence, injectionSites, timingPatterns, doseVariance] = await Promise.all([
        this.getProtocolAdherence(userId, filters),
        this.getInjectionSiteAnalytics(userId, filters),
        this.getTimingPatternAnalytics(userId, filters),
        this.getDoseVarianceAnalytics(userId, filters)
      ]);

      // Generate insights and recommendations
      const keyInsights = this.generateInsights({
        protocolAdherence,
        injectionSites,
        timingPatterns,
        doseVariance
      });

      const recommendations = this.generateRecommendations({
        protocolAdherence,
        injectionSites,
        timingPatterns,
        doseVariance
      });

      return {
        dateRange,
        protocolAdherence,
        injectionSites,
        timingPatterns,
        doseVariance,
        keyInsights,
        recommendations
      };
    } catch (error) {
      console.error('Error getting comprehensive analytics:', error);
      return {
        dateRange: { start: new Date(), end: new Date() },
        protocolAdherence: [],
        injectionSites: [],
        timingPatterns: {
          optimalTimeWindow: { start: '09:00', end: '10:00' },
          consistencyScore: 0,
          averageTime: '09:00',
          mostCommonTimes: [],
          dayOfWeekPatterns: []
        },
        doseVariance: [],
        keyInsights: [],
        recommendations: []
      };
    }
  }

  // Helper methods
  private static calculateAdherenceMetrics(injections: Injection[]) {
    if (injections.length === 0) {
      return { streakDays: 0, longestStreak: 0, averageTimeBetween: 0, consistencyScore: 0 };
    }

    const sortedInjections = injections.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate current streak
    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = sortedInjections.length - 1; i >= 0; i--) {
      const injectionDate = new Date(sortedInjections[i].timestamp);
      injectionDate.setHours(0, 0, 0, 0);

      const daysDiff = (currentDate.getTime() - injectionDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 1) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak and average time between doses
    let longestStreak = 0;
    let currentStreakLength = 1;
    let totalTimeBetween = 0;

    for (let i = 1; i < sortedInjections.length; i++) {
      const prevDate = new Date(sortedInjections[i - 1].timestamp);
      const currDate = new Date(sortedInjections[i].timestamp);
      const timeDiff = currDate.getTime() - prevDate.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      totalTimeBetween += timeDiff;

      if (daysDiff <= 2) { // Within 2 days = part of streak
        currentStreakLength++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreakLength);
        currentStreakLength = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreakLength);
    const averageTimeBetween = sortedInjections.length > 1 ?
      totalTimeBetween / (sortedInjections.length - 1) / (1000 * 60 * 60) : 0; // in hours

    // Consistency score based on regular intervals
    const expectedInterval = 24; // hours for daily doses
    let consistencyScore = 0;
    if (sortedInjections.length > 1) {
      const intervals = [];
      for (let i = 1; i < sortedInjections.length; i++) {
        const timeDiff = (new Date(sortedInjections[i].timestamp).getTime() -
                         new Date(sortedInjections[i - 1].timestamp).getTime()) / (1000 * 60 * 60);
        intervals.push(timeDiff);
      }

      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) =>
        sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

      consistencyScore = Math.max(0, 100 - (Math.sqrt(variance) / expectedInterval * 100));
    }

    return {
      streakDays,
      longestStreak,
      averageTimeBetween,
      consistencyScore
    };
  }

  private static calculateDoseTrend(data: { dose: number; date: Date }[]): 'stable' | 'increasing' | 'decreasing' {
    if (data.length < 2) return 'stable';

    // Simple linear regression to determine trend
    const n = data.length;
    const xValues = data.map((_, index) => index);
    const yValues = data.map(d => d.dose);

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (Math.abs(slope) < 0.1) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private static generateInsights(data: {
    protocolAdherence: ProtocolAdherenceData[];
    injectionSites: InjectionSiteAnalytics[];
    timingPatterns: TimingPatternAnalytics;
    doseVariance: DoseVarianceAnalytics[];
  }): string[] {
    const insights: string[] = [];

    // Adherence insights
    const avgAdherence = data.protocolAdherence.reduce((sum, p) => sum + p.adherencePercentage, 0) /
      Math.max(data.protocolAdherence.length, 1);

    if (avgAdherence >= 90) {
      insights.push(`Excellent protocol adherence at ${avgAdherence.toFixed(1)}%`);
    } else if (avgAdherence >= 75) {
      insights.push(`Good protocol adherence at ${avgAdherence.toFixed(1)}%, room for improvement`);
    } else {
      insights.push(`Protocol adherence needs attention at ${avgAdherence.toFixed(1)}%`);
    }

    // Site rotation insights
    const overusedSites = data.injectionSites.filter(site => site.overused);
    if (overusedSites.length > 0) {
      insights.push(`${overusedSites.length} injection sites may be overused`);
    }

    // Timing consistency insights
    if (data.timingPatterns.consistencyScore >= 80) {
      insights.push(`Very consistent injection timing (${data.timingPatterns.consistencyScore.toFixed(0)}% consistency)`);
    } else if (data.timingPatterns.consistencyScore >= 60) {
      insights.push(`Moderately consistent timing, consider setting reminders`);
    } else {
      insights.push(`Inconsistent injection timing may affect protocol effectiveness`);
    }

    return insights;
  }

  private static generateRecommendations(data: {
    protocolAdherence: ProtocolAdherenceData[];
    injectionSites: InjectionSiteAnalytics[];
    timingPatterns: TimingPatternAnalytics;
    doseVariance: DoseVarianceAnalytics[];
  }): string[] {
    const recommendations: string[] = [];

    // Adherence recommendations
    const lowAdherenceProtocols = data.protocolAdherence.filter(p => p.adherencePercentage < 80);
    if (lowAdherenceProtocols.length > 0) {
      recommendations.push('Set up dose reminders for protocols with low adherence');
      recommendations.push('Consider adjusting protocol schedule to better fit your routine');
    }

    // Site rotation recommendations
    const overusedSites = data.injectionSites.filter(site => site.overused);
    if (overusedSites.length > 0) {
      recommendations.push(`Rotate away from overused sites: ${overusedSites.map(s => s.location).join(', ')}`);
    }

    const underusedSites = data.injectionSites.filter(site => site.daysSinceLastUse > 14);
    if (underusedSites.length > 0) {
      recommendations.push(`Consider using underutilized sites: ${underusedSites.map(s => s.location).join(', ')}`);
    }

    // Timing recommendations
    if (data.timingPatterns.consistencyScore < 70) {
      recommendations.push(`Try injecting consistently around ${data.timingPatterns.averageTime} for better results`);
    }

    return recommendations;
  }
}