import { useState, useRef, useCallback } from 'react';
import { useMediaLibrary, useUploadMedia, useDeleteMedia, useMediaUsage, ALLOWED_TYPES, MAX_FILE_BYTES } from '@/hooks/useMediaLibrary';
import type { MediaLibraryItem } from '@/types/database';
import { X, Upload, Trash2, Check, Image as ImageIcon, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    accept?: 'image' | 'video' | 'all';
}

const MediaPicker = ({ open, onClose, onSelect, accept = 'all' }: MediaPickerProps) => {
    const { data: items, isLoading } = useMediaLibrary();
    const upload = useUploadMedia();
    const deleteMedia = useDeleteMedia();
    const { totalUsed, maxBytes, pct } = useMediaUsage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const { toast } = useToast();

    const filteredItems = items?.filter(i => {
        if (accept === 'image') return i.file_type.startsWith('image/');
        if (accept === 'video') return i.file_type.startsWith('video/');
        return true;
    });

    const acceptAttr = accept === 'image'
        ? 'image/*'
        : accept === 'video'
            ? 'video/mp4,video/webm,video/quicktime,.mov'
            : 'image/*,video/mp4,video/webm,video/quicktime,.mov';

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await upload.mutateAsync(file);
            onSelect(result.file_url);
            onClose();
        } catch (err: any) {
            toast({ title: 'Upload failed', description: err.message || 'Upload failed', variant: 'destructive' });
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [upload, onSelect, onClose]);

    const handleSelect = (item: MediaLibraryItem) => {
        onSelect(item.file_url);
        onClose();
    };

    const handleDelete = async (e: React.MouseEvent, item: MediaLibraryItem) => {
        e.stopPropagation();
        if (!confirm(`Delete "${item.file_name}"?`)) return;
        try {
            await deleteMedia.mutateAsync(item);
        } catch (err: any) {
            toast({ title: 'Delete failed', description: err.message || 'Delete failed', variant: 'destructive' });
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-3xl max-h-[80vh] mx-4 rounded-xl overflow-hidden flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Media Library</h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {formatSize(totalUsed)} / {formatSize(maxBytes)} used ({pct}%)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={acceptAttr}
                            onChange={handleUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={upload.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                        >
                            <Upload className="h-3.5 w-3.5" />
                            {upload.isPending ? 'Uploading…' : 'Upload New'}
                        </button>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Usage bar */}
                <div className="px-4 pt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${Math.min(pct, 100)}%`,
                                backgroundColor: pct > 90 ? '#ef4444' : 'var(--accent)',
                            }}
                        />
                    </div>
                </div>

                {/* Upload progress */}
                {upload.isPending && (
                    <div className="mx-4 mt-3 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent)' }}>
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Uploading file…</p>
                    </div>
                )}

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {[...Array(10)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-lg" />)}
                        </div>
                    ) : filteredItems && filteredItems.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square"
                                    style={{ border: '2px solid var(--border)' }}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setPreview(item.file_url)}
                                    onMouseLeave={() => setPreview(null)}
                                >
                                    {item.file_type.startsWith('image/') ? (
                                        <img src={item.file_url} alt={item.file_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <video
                                            src={item.file_url}
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                            className="w-full h-full object-cover"
                                            onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play().catch(() => { })}
                                            onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                                        />
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Check className="h-6 w-6 text-white" />
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => handleDelete(e, item)}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>

                                    {/* File info */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] text-white truncate">{item.file_name}</p>
                                        <p className="text-[9px] text-gray-300">{formatSize(item.file_size)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ImageIcon className="mx-auto h-10 w-10 mb-3" style={{ color: 'var(--text-muted)' }} />
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No media uploaded yet</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 text-sm font-medium"
                                style={{ color: 'var(--accent)' }}
                            >
                                Upload your first file
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Max file size: {MAX_FILE_BYTES / 1024 / 1024} MB · Supported: JPEG, PNG, WebP, GIF, MP4, WebM, MOV
                </div>
            </div>
        </div>
    );
};

export default MediaPicker;
