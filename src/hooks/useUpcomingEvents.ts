import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
    UpcomingEvent,
    AboutContent,
    BookContent,
} from '@/types/database';

// Re-export shared types for consumers
export type { UpcomingEvent, AboutContent, BookContent };

// ============================================================================
// Upcoming Events Hooks
// ============================================================================
export const useUpcomingEvents = (visibleOnly: boolean = false) => {
    return useQuery({
        queryKey: ['upcoming-events', { visibleOnly }],
        queryFn: async (): Promise<UpcomingEvent[]> => {
            let query = supabase
                .from('upcoming_events')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('event_date', { ascending: true });

            if (visibleOnly) {
                query = query.eq('visible', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data as unknown as UpcomingEvent[]) || [];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpsertEvent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (event: Partial<UpcomingEvent>) => {
            const payload = { ...event, updated_at: new Date().toISOString() };
            const { data, error } = await supabase
                .from('upcoming_events')
                .upsert(payload as any)
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
            const { error } = await supabase
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
export const useAboutContent = () => {
    return useQuery({
        queryKey: ['about-content'],
        queryFn: async (): Promise<AboutContent | null> => {
            const { data, error } = await supabase
                .from('about_content')
                .select('*')
                .maybeSingle();
            if (error) throw error;
            return data as unknown as AboutContent | null;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// ============================================================================
// Book Content
// ============================================================================
export const useBookContent = () => {
    return useQuery({
        queryKey: ['book-content'],
        queryFn: async (): Promise<BookContent | null> => {
            const { data, error } = await supabase
                .from('book_content')
                .select('*')
                .maybeSingle();
            if (error) throw error;
            return data as unknown as BookContent | null;
        },
        staleTime: 5 * 60 * 1000,
    });
};
