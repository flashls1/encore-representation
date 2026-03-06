import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getDefaultProps } from '@/ui-library/react-bits/effects/_registry';
import type {
  SiteSettings,
  HomeContent,
  Talent,
  ContactSettings,
  ContactSubmission,
} from '@/types/database';

// ============================================================================
// UI Effects Configuration (persisted in Supabase ui_effect_overrides table)
// ============================================================================

/** Fetch all effect overrides from Supabase (cached, shared across hooks) */
const useUIEffectOverrides = () => {
  return useQuery({
    queryKey: ['ui-effect-overrides'],
    queryFn: async (): Promise<Record<string, Record<string, any>>> => {
      const { data, error } = await (supabase as any)
        .from('ui_effect_overrides')
        .select('effect_id, props');
      if (error) throw error;
      const map: Record<string, Record<string, any>> = {};
      (data || []).forEach((row: any) => {
        map[row.effect_id] = row.props || {};
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUIEffect = (effectId: string) => {
  const { data: overridesMap, isLoading } = useUIEffectOverrides();
  const defaults = getDefaultProps(effectId);
  const overrides = overridesMap?.[effectId] || {};
  return {
    config: { ...defaults, ...overrides },
    isLoading,
  };
};

// ============================================================================
// Site Settings
// ============================================================================
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// Home Content
// ============================================================================
export const useHomeContent = () => {
  return useQuery({
    queryKey: ['home-content'],
    queryFn: async (): Promise<HomeContent | null> => {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// Talents — matches actual DB schema (name, slug, role_name, character_name)
// ============================================================================
export const useTalents = (featuredOnly: boolean = false) => {
  return useQuery({
    queryKey: ['talents', { featuredOnly }],
    queryFn: async () => {
      let query = supabase
        .from('talents')
        .select(`
          *,
          talent_roles (
            id, talent_id, role_name, character_name, image_url, show_color, bg_image_url
          )
        `)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (featuredOnly) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as Talent[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTalent = (id: string) => {
  return useQuery({
    queryKey: ['talent', id],
    queryFn: async (): Promise<Talent | null> => {
      const { data, error } = await supabase
        .from('talents')
        .select(`
          *,
          talent_roles (
            id, talent_id, role_name, character_name, image_url, show_color, bg_image_url
          ),
          talent_images (
            id, talent_id, image_url, caption, sort_order
          )
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Talent) || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// Contact Settings
// ============================================================================
export const useContactSettings = () => {
  return useQuery({
    queryKey: ['contact-settings'],
    queryFn: async (): Promise<ContactSettings | null> => {
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// Contact Submissions
// ============================================================================
export const useContactSubmissions = () => {
  return useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async (): Promise<ContactSubmission[]> => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSubmitContactForm = () => {
  return useMutation({
    mutationFn: async (submission: Omit<ContactSubmission, 'id' | 'submitted_at'>) => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert(submission)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
};