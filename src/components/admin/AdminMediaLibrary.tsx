import { useRef, useCallback, useState } from 'react';
import { useMediaLibrary, useUploadMedia, useDeleteMedia, useMediaUsage, MAX_FILE_BYTES } from '@/hooks/useMediaLibrary';
import { convertMovToMp4, isMovFile, ConversionProgress } from '@/hooks/useVideoConverter';
import { Upload, Trash2, Image as ImageIcon, Film, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminMediaLibrary = () => {
    const { data: items, isLoading } = useMediaLibrary();
    const upload = useUploadMedia();
    const deleteMedia = useDeleteMedia();
    const { totalUsed, maxBytes, pct } = useMediaUsage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Conversion state (separate from upload.isPending)
    const [conversion, setConversion] = useState<ConversionProgress | null>(null);
    const [convertingFileName, setConvertingFileName] = useState<string>('');

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (const file of Array.from(files)) {
            try {
                let fileToUpload = file;

                if (isMovFile(file)) {
                    setConvertingFileName(file.name);
                    setConversion({ phase: 'loading' });

                    fileToUpload = await convertMovToMp4(file, (progress) => {
                        setConversion(progress);
                    });

                    setConversion(null);
                    setConvertingFileName('');
                }

                await upload.mutateAsync(fileToUpload);
            } catch (err: unknown) {
                setConversion(null);
                setConvertingFileName('');
                console.error('Media upload/conversion error:', err);
                // err may be a string, Error, WebAssembly error, or plain object
                const msg =
                    err instanceof Error
                        ? err.message
                        : typeof err === 'string'
                            ? err
                            : (err as any)?.message
                            ?? (err as any)?.toString?.()
                            ?? JSON.stringify(err)
                            ?? 'Unknown error — check the browser console for details.';
                toast({ title: 'Upload failed', description: `Failed to process ${file.name}: ${msg}`, variant: 'destructive' });
            }
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [upload]);

    const handleDelete = async (item: any) => {
        if (!confirm(`Delete "${item.file_name}"? This cannot be undone.`)) return;
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

    const imageCount = items?.filter(i => i.file_type.startsWith('image/')).length || 0;
    const videoCount = items?.filter(i => i.file_type.startsWith('video/')).length || 0;

    // Determine banner state
    const isBusy = !!conversion || upload.isPending;
    const bannerLabel = conversion
        ? conversion.phase === 'loading'
            ? `Loading converter… (${convertingFileName})`
            : conversion.phase === 'converting'
                ? `Converting ${convertingFileName} to MP4… ${conversion.percent ?? 0}%`
                : 'Conversion complete — uploading…'
        : upload.isPending
            ? 'Uploading to media library…'
            : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Media Library</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Upload images &amp; videos. MOV files are automatically converted to optimised MP4.
                    </p>
                </div>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*,video/mp4,video/webm,video/quicktime,.mov"
                        onChange={handleUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                    >
                        <Upload className="h-4 w-4" />
                        {isBusy ? 'Processing…' : 'Upload Files'}
                    </button>
                </div>
            </div>

            {/* Progress banner */}
            {bannerLabel && (
                <div
                    className="theme-card p-4"
                    style={{ border: '1px solid var(--accent)' }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                        />
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {bannerLabel}
                        </p>
                    </div>
                    {/* Progress bar — only shown during conversion */}
                    {conversion?.phase === 'converting' && typeof conversion.percent === 'number' && (
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-200"
                                style={{ width: `${conversion.percent}%`, backgroundColor: 'var(--accent)' }}
                            />
                        </div>
                    )}
                    {conversion?.phase === 'loading' && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            Downloading video converter (~8 MB) — this only happens once per session.
                        </p>
                    )}
                </div>
            )}

            {/* Usage Stats */}
            <div className="theme-card p-4">
                <div className="flex items-center gap-3 mb-3">
                    <HardDrive className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Storage Usage</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: pct > 90 ? 'var(--error, #ef4444)' : pct > 70 ? '#f59e0b' : 'var(--accent)',
                        }}
                    />
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{formatSize(totalUsed)} of {formatSize(maxBytes)} used ({pct}%)</span>
                    <span>{items?.length || 0} files · {imageCount} images · {videoCount} videos</span>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-lg" />)}
                </div>
            ) : items && items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="relative group rounded-lg overflow-hidden aspect-square theme-card"
                        >
                            {item.file_type.startsWith('image/') ? (
                                <img src={item.file_url} alt={item.file_name} className="w-full h-full object-cover" loading="lazy" />
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

                            {/* Info overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                <p className="text-xs text-white truncate font-medium">{item.file_name}</p>
                                <p className="text-[10px] text-gray-300">{formatSize(item.file_size)}</p>
                                {item.width && item.height && (
                                    <p className="text-[10px] text-gray-400">{item.width}×{item.height}</p>
                                )}
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(item)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 theme-card">
                    <ImageIcon className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>No media uploaded</h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                        Upload images and videos. MOV files are automatically converted to MP4.
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                    >
                        Upload Your First File
                    </button>
                </div>
            )}

            {/* File limits info */}
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Max file size: {MAX_FILE_BYTES / 1024 / 1024} MB · Supported: JPEG, PNG, WebP, GIF, MP4, WebM, MOV (auto-converted to MP4)
            </p>
        </div>
    );
};

export default AdminMediaLibrary;
