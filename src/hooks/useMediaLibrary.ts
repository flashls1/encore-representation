import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MediaLibraryItem } from '@/types/database';

const BUCKET = 'media-library';
const MAX_TOTAL_BYTES = 500 * 1024 * 1024; // 500 MB
const MAX_FILE_BYTES = 200 * 1024 * 1024;  // 200 MB — accommodates raw .mov files before conversion

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm',
    // .mov is accepted — converted to .mp4 before storage
    'video/quicktime',
];

// ============================================================================
// Fetch all media
// ============================================================================
export const useMediaLibrary = () => {
    return useQuery({
        queryKey: ['media-library'],
        queryFn: async (): Promise<MediaLibraryItem[]> => {
            const { data, error } = await supabase
                .from('media_library')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        staleTime: 60 * 1000,
    });
};

// ============================================================================
// Total usage
// ============================================================================
export const useMediaUsage = () => {
    const { data: items } = useMediaLibrary();
    const totalUsed = items?.reduce((sum, i) => sum + i.file_size, 0) || 0;
    return { totalUsed, maxBytes: MAX_TOTAL_BYTES, pct: Math.round((totalUsed / MAX_TOTAL_BYTES) * 100) };
};

// ============================================================================
// Upload media  (conversion handled by caller — file passed here is final)
// ============================================================================
export const useUploadMedia = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file: File): Promise<MediaLibraryItem> => {
            // Validate type (video/quicktime won't reach here — caller converts first)
            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`Unsupported file type: ${file.type}`);
            }
            if (file.size > MAX_FILE_BYTES) {
                throw new Error(`File too large. Max ${MAX_FILE_BYTES / 1024 / 1024} MB.`);
            }
            // Check total usage
            const { data: existing } = await supabase.from('media_library').select('file_size');
            const totalUsed = existing?.reduce((s, i) => s + i.file_size, 0) || 0;
            if (totalUsed + file.size > MAX_TOTAL_BYTES) {
                throw new Error('Storage limit reached (500 MB). Delete some files first.');
            }

            // Upload to storage
            const ext = file.name.split('.').pop() || 'bin';
            const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
            const publicUrl = urlData.publicUrl;

            // Get dimensions for images
            let width: number | null = null;
            let height: number | null = null;
            if (file.type.startsWith('image/')) {
                try {
                    const dims = await getImageDimensions(file);
                    width = dims.width;
                    height = dims.height;
                } catch { /* ignore */ }
            }

            // Insert DB record
            const { data: record, error: dbError } = await supabase
                .from('media_library')
                .insert({
                    file_name: file.name,
                    file_url: publicUrl,
                    file_size: file.size,
                    file_type: file.type,
                    width,
                    height,
                })
                .select()
                .single();
            if (dbError) throw dbError;
            return record;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['media-library'] });
        },
    });
};

// ============================================================================
// Delete media
// ============================================================================
export const useDeleteMedia = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (item: MediaLibraryItem) => {
            // Extract storage path from URL
            const url = new URL(item.file_url);
            const pathParts = url.pathname.split(`/object/public/${BUCKET}/`);
            if (pathParts.length > 1) {
                await supabase.storage.from(BUCKET).remove([pathParts[1]]);
            }
            // Delete DB record
            const { error } = await supabase.from('media_library').delete().eq('id', item.id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['media-library'] });
        },
    });
};

// ============================================================================
// Helpers
// ============================================================================
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

export { MAX_FILE_BYTES, MAX_TOTAL_BYTES, ALLOWED_TYPES };
