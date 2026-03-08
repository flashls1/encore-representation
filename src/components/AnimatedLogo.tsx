import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * AnimatedLogo — Cinematic GSAP intro for the Encore Representation logo.
 *
 * Uses CSS clip-path on 3 copies of the same image to isolate:
 *   1. "ENCORE" (top)
 *   2. "REPRESENTATION" (middle)
 *   3. Reflection + separator (bottom)
 *
 * Timeline:
 *   0% → 40%   ENCORE drops from above, REPRESENTATION rises from below
 *   40% → 55%  Lens-flare flash on the "R" area
 *   55% → 100% Reflection slides up + rotates into place
 */

interface AnimatedLogoProps {
    /** Total animation duration in seconds (1–5, default 2.5) */
    duration?: number;
    className?: string;
}

const LOGO_SRC = '/encore-logo-full.png';

// Clip-path regions — pixel-measured from 1024×1024 PNG
// ENCORE content: rows 211–517, REPRESENTATION: 528–591, Separator+Reflection: 596–655
// Using generous 3-4% overlaps to eliminate subpixel rendering seams
const CLIP_ENCORE = 'inset(18% 0% 46% 0%)';        // Shows ~18% to ~54% (extends 3% past REP start)
const CLIP_REPRESENTATION = 'inset(49% 0% 38% 0%)'; // Shows ~49% to ~62% (overlaps both neighbors)
const CLIP_REFLECTION = 'inset(56% 0% 34% 0%)';     // Shows ~56% to ~66% (overlaps REP by 6%)

// Shared image style — preserves crisp quality at all sizes
const IMG_STYLE: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
    imageRendering: 'auto',           // best quality downscale (browser default but explicit)
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
};

const AnimatedLogo = ({ duration = 2.5, className = '' }: AnimatedLogoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const encoreRef = useRef<HTMLDivElement>(null);
    const repRef = useRef<HTMLDivElement>(null);
    const reflectionRef = useRef<HTMLDivElement>(null);
    const flareRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Phase 1: ENCORE drops from top, REPRESENTATION rises from bottom
            tl.fromTo(
                encoreRef.current,
                { y: '-150%', opacity: 0 },
                { y: '0%', opacity: 1, duration: duration * 0.4 },
                0
            );

            tl.fromTo(
                repRef.current,
                { y: '150%', opacity: 0 },
                { y: '0%', opacity: 1, duration: duration * 0.4 },
                0
            );

            // Phase 2: Lens flare flash (starts when pieces meet)
            tl.fromTo(
                flareRef.current,
                { scale: 0, opacity: 0 },
                {
                    scale: 1.5,
                    opacity: 1,
                    duration: duration * 0.12,
                    ease: 'power2.out',
                },
                duration * 0.35
            );
            tl.to(
                flareRef.current,
                {
                    scale: 3,
                    opacity: 0,
                    duration: duration * 0.15,
                    ease: 'power2.in',
                },
                duration * 0.47
            );

            // Phase 3: Reflection slides up + rotates in
            tl.fromTo(
                reflectionRef.current,
                { y: '100%', opacity: 0, rotateX: 180 },
                {
                    y: '0%',
                    opacity: 1,
                    rotateX: 0,
                    duration: duration * 0.45,
                    ease: 'power2.out',
                },
                duration * 0.5
            );
        }, containerRef);

        return () => ctx.revert();
    }, [duration]);

    return (
        <div
            ref={containerRef}
            className={`relative select-none ${className}`}
            style={{ perspective: '800px' }}
        >
            {/* Master container — determines layout width, images scale naturally */}
            <div className="relative w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Invisible sizing reference — sets natural height from the visible region */}
                <img
                    src={LOGO_SRC}
                    alt=""
                    style={{
                        ...IMG_STYLE,
                        clipPath: 'inset(18% 0% 34% 0%)',
                        visibility: 'hidden',
                    }}
                    draggable={false}
                />

                {/* ENCORE — drops from top */}
                <div
                    ref={encoreRef}
                    className="absolute inset-0"
                    style={{
                        opacity: 0,
                        willChange: 'transform, opacity',
                        transform: 'translateZ(0)',  // force GPU layer
                    }}
                >
                    <img
                        src={LOGO_SRC}
                        alt="Encore"
                        style={{
                            ...IMG_STYLE,
                            clipPath: CLIP_ENCORE,
                        }}
                        draggable={false}
                    />
                </div>

                {/* REPRESENTATION — rises from bottom */}
                <div
                    ref={repRef}
                    className="absolute inset-0"
                    style={{
                        opacity: 0,
                        willChange: 'transform, opacity',
                        transform: 'translateZ(0)',
                    }}
                >
                    <img
                        src={LOGO_SRC}
                        alt="Representation"
                        style={{
                            ...IMG_STYLE,
                            clipPath: CLIP_REPRESENTATION,
                        }}
                        draggable={false}
                    />
                </div>

                {/* Lens flare flash — positioned near the "R" on ENCORE */}
                <div
                    ref={flareRef}
                    className="absolute pointer-events-none"
                    style={{
                        top: '10%',
                        right: '10%',
                        width: '120px',
                        height: '120px',
                        opacity: 0,
                        willChange: 'transform, opacity',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(212,175,55,0.6) 30%, rgba(212,175,55,0) 70%)',
                        borderRadius: '50%',
                        filter: 'blur(2px)',
                    }}
                />

                {/* Reflection + separator — spins in from bottom */}
                <div
                    ref={reflectionRef}
                    className="absolute inset-0"
                    style={{
                        opacity: 0,
                        willChange: 'transform, opacity',
                        transformOrigin: 'center top',
                        transform: 'translateZ(0)',
                    }}
                >
                    <img
                        src={LOGO_SRC}
                        alt=""
                        style={{
                            ...IMG_STYLE,
                            clipPath: CLIP_REFLECTION,
                        }}
                        draggable={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnimatedLogo;
