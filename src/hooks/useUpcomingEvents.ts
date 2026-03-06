import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================
export interface UpcomingEvent {
    id: string;
    title: string;
    description: string;
    image_url: string;
    event_date: string | null;
    event_time: string;
    location: string;
    link_url: string;
    sort_order: number;
    visible: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Hooks
// ============================================================================
export const useUpcomingEvents = (visibleOnly: boolean = false) => {
    return useQuery({
        queryKey: ['upcoming-events', { visibleOnly }],
        queryFn: async (): Promise<UpcomingEvent[]> => {
            let query = (supabase as any)
                .from('upcoming_events')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('event_date', { ascending: true });

            if (visibleOnly) {
                query = query.eq('visible', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpsertEvent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (event: Partial<UpcomingEvent>) => {
            const payload = { ...event, updated_at: new Date().toISOString() };
            const { data, error } = await (supabase as any)
                .from('upcoming_events')
                .upsert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['upcoming-events'] }),
    });
};

export const useDeleteEvent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from('upcoming_events')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['upcoming-events'] }),
    });
};

// ============================================================================
// About Content
// ============================================================================
export interface AboutContent {
    id: string;
    page_title: string;
    page_description: string;
    hero_image_url: string;
    sections: ContentSection[];
    updated_at: string;
}

export interface ContentSection {
    id: string;
    type: 'text' | 'image' | 'video' | 'image-text' | 'owner-hero';
    title?: string;
    content: string;
    media_url: string;
}

export const useAboutContent = () => {
    return useQuery({
        queryKey: ['about-content'],
        queryFn: async (): Promise<AboutContent | null> => {
            const { data, error } = await (supabase as any)
                .from('about_content')
                .select('*')
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// ============================================================================
// Book Content
// ============================================================================
export interface BookContent {
    id: string;
    page_title: string;
    page_description: string;
    hero_image_url: string;
    sections: ContentSection[];
    updated_at: string;
}

export const useBookContent = () => {
    return useQuery({
        queryKey: ['book-content'],
        queryFn: async (): Promise<BookContent | null> => {
            const { data, error } = await (supabase as any)
                .from('book_content')
                .select('*')
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
