import { supabase } from './supabase';
import type {
  User,
  Peptide,
  Injection,
  Protocol,
  WellnessMetric,
  PeptideTemplate,
  InjectionFilters,
  PeptideFilters,
  WellnessMetricFilters,
  PaginationOptions,
  DatabaseError,
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

  // Protocol operations
  static async getUserProtocols(userId: string): Promise<Protocol[]> {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select(`
          *,
          peptides:peptide_id(name, category)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this.mapProtocolFromDb);
    } catch (error) {
      console.error('Error fetching user protocols:', error);
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
      name: data.name,
      description: data.description,
      peptideId: data.peptide_id,
      schedule: data.schedule,
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
}