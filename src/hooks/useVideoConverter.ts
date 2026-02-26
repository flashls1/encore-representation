import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Singleton FFmpeg instance — loaded once per session
let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

// Must match the installed @ffmpeg/ffmpeg version exactly, and use ESM (not UMD)
const CORE_VERSION = '0.12.10';
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

/**
 * Load the single-threaded FFmpeg WASM core.
 *
 * @ffmpeg/ffmpeg 0.12.x spawns a Web Worker internally. The worker tries to
 * resolve its own script via a publicPath that breaks in Vite. We fix this by
 * pre-fetching all three files (core JS, core WASM, worker JS) and converting
 * them to same-origin blob URLs before calling ff.load().
 *
 * Single-threaded core = no SharedArrayBuffer = no COOP/COEP headers needed.
 */
async function loadFFmpeg(): Promise<FFmpeg> {
    if (ffmpegInstance?.loaded) return ffmpegInstance;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        const ff = new FFmpeg();

        // Log FFmpeg stderr to browser console for diagnostics
        ff.on('log', ({ type, message }: { type: string; message: string }) => {
            if (type === 'stderr') console.debug('[FFmpeg]', message);
        });

        try {
            console.log('[FFmpeg] Fetching core files from CDN…');
            const [coreURL, wasmURL] = await Promise.all([
                toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
                toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
            ]);
            console.log('[FFmpeg] Files downloaded, initialising WASM…');
            await ff.load({ coreURL, wasmURL });
            console.log('[FFmpeg] Ready ✓');
        } catch (err: unknown) {
            // Reset so the next call can retry
            loadPromise = null;
            ffmpegInstance = null;
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[FFmpeg] Load failed:', msg, err);
            throw new Error(`Video converter failed to initialise: ${msg}`);
        }

        ffmpegInstance = ff;
        return ff;
    })();

    return loadPromise;
}

export interface ConversionProgress {
    phase: 'loading' | 'converting' | 'done';
    /** 0–100 during 'converting', undefined otherwise */
    percent?: number;
}

export type ProgressCallback = (p: ConversionProgress) => void;

/**
 * Convert a .mov (or any video) File to a web-optimised .mp4.
 *
 * Encoding settings:
 *   - libx264  CRF 23  (excellent quality, ~40–70% smaller than raw .mov)
 *   - preset medium    (good speed/size balance)
 *   - AAC audio
 *   - +faststart       (moov atom first → instant streaming playback)
 */
export async function convertMovToMp4(
    file: File,
    onProgress?: ProgressCallback,
): Promise<File> {
    onProgress?.({ phase: 'loading' });

    let ff: FFmpeg;
    try {
        ff = await loadFFmpeg();
    } catch (loadErr: unknown) {
        const msg = loadErr instanceof Error ? loadErr.message : String(loadErr);
        throw new Error(msg);
    }

    const progressHandler = ({ progress }: { progress: number; time: number }) => {
        onProgress?.({
            phase: 'converting',
            percent: Math.min(100, Math.round(progress * 100)),
        });
    };

    ff.on('progress', progressHandler);

    const inputName = 'input.mov';
    const outputName = 'output.mp4';

    try {
        // Write source bytes into FFmpeg's in-memory virtual FS
        await ff.writeFile(inputName, await fetchFile(file));
        onProgress?.({ phase: 'converting', percent: 0 });

        const exitCode = await ff.exec([
            '-i', inputName,
            '-c:v', 'libx264',
            '-crf', '23',
            '-preset', 'medium',
            '-c:a', 'aac',
            '-movflags', '+faststart',
            outputName,
        ]);

        if (exitCode !== 0) {
            throw new Error(
                `FFmpeg exited with code ${exitCode}. The video may be corrupted or in an unsupported format.`
            );
        }
    } catch (execErr: unknown) {
        ff.off('progress', progressHandler);
        await ff.deleteFile(inputName).catch(() => null);
        const msg = execErr instanceof Error ? execErr.message : String(execErr);
        throw new Error(`Conversion failed: ${msg}`);
    }

    const rawData = await ff.readFile(outputName);

    // FileData is Uint8Array | string. We always get Uint8Array for binary output.
    // Copy into a plain ArrayBuffer to avoid SharedArrayBuffer type conflicts.
    let data: ArrayBuffer;
    if (rawData instanceof Uint8Array) {
        data = rawData.buffer.slice(
            rawData.byteOffset,
            rawData.byteOffset + rawData.byteLength,
        ) as ArrayBuffer;
    } else {
        data = new TextEncoder().encode(rawData).buffer as ArrayBuffer;
    }

    // Clean up virtual FS
    await ff.deleteFile(inputName).catch(() => null);
    await ff.deleteFile(outputName).catch(() => null);
    ff.off('progress', progressHandler);

    onProgress?.({ phase: 'done' });

    const mp4Name = file.name.replace(/\.mov$/i, '.mp4');
    return new File([data], mp4Name, { type: 'video/mp4' });
}

export const isMovFile = (file: File) =>
    file.type === 'video/quicktime' ||
    file.name.toLowerCase().endsWith('.mov');
