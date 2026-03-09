import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * AnimatedLogo — Cinematic GSAP intro for the Encore Representation logo.
 *
 * Architecture (separate high-res assets + CSS-generated elements):
 *   1. "ENCORE" — /encore-text.png (drops from above)
 *      • Starburst flare on the 'R' letter design element
 *   2. Gold separator line with continuous left→right shimmer
 *   3. "REPRESENTATION" — /representation-text.png (rises from below)
 *   4. CSS reflection of REPRESENTATION (scaleY(-1) + gradient mask fade)
 *
 * Timeline:
 *   0% → 40%   ENCORE drops, REPRESENTATION rises (simultaneous)
 *   32% → 55%  Gold separator line materializes → continuous shimmer begins
 *   35% → 55%  Starburst flare on the R letter
 *   55% → 85%  CSS reflection fades in below
 */

interface AnimatedLogoProps {
    /** Total animation duration in seconds (1–5, default 2.5) */
    duration?: number;
    className?: string;
}

const ENCORE_SRC = '/encore-text.png';
const REPRESENTATION_SRC = '/representation-text.png';

/* ─── CSS keyframes injected once ──────────────────────────────────────────── */
const STYLE_ID = 'animated-logo-keyframes';
const injectKeyframes = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
    /* Continuous left→right shimmer on gold separator */
    @keyframes separatorShimmer {
      0%   { left: -40%; opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { left: 110%; opacity: 0; }
    }

    /* Starburst rays rotating subtly */
    @keyframes starburstPulse {
      0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
      50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.15) rotate(8deg); }
    }

    /* Starburst core glow pulse */
    @keyframes coreGlow {
      0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
      50%      { opacity: 0.9; transform: translate(-50%, -50%) scale(1.2); }
    }
  `;
    document.head.appendChild(style);
};

const AnimatedLogo = ({ duration = 2.5, className = '' }: AnimatedLogoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const encoreRef = useRef<HTMLDivElement>(null);
    const separatorRef = useRef<HTMLDivElement>(null);
    const shimmerRef = useRef<HTMLDivElement>(null);
    const repRef = useRef<HTMLDivElement>(null);
    const reflectionRef = useRef<HTMLDivElement>(null);
    const flareRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        injectKeyframes();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Phase 1: ENCORE drops from top
            tl.fromTo(
                encoreRef.current,
                { y: '-120%', opacity: 0 },
                { y: '0%', opacity: 1, duration: duration * 0.4 },
                0
            );

            // Phase 1: REPRESENTATION rises from bottom (simultaneous)
            tl.fromTo(
                repRef.current,
                { y: '120%', opacity: 0 },
                { y: '0%', opacity: 1, duration: duration * 0.4 },
                0
            );

            // Phase 2: Gold separator line materializes
            tl.fromTo(
                separatorRef.current,
                { scaleX: 0, opacity: 0 },
                { scaleX: 1, opacity: 1, duration: duration * 0.25, ease: 'power2.inOut' },
                duration * 0.32
            );

            // Phase 2: Start continuous shimmer after separator is visible
            tl.fromTo(
                shimmerRef.current,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.01,
                    onComplete: () => {
                        // Enable the CSS animation loop
                        if (shimmerRef.current) {
                            shimmerRef.current.style.animation = 'separatorShimmer 2.5s ease-in-out 0.5s infinite';
                        }
                    },
                },
                duration * 0.55
            );

            // Phase 2: Starburst flare on the R letter — bursts out then settles into subtle idle
            tl.fromTo(
                flareRef.current,
                { scale: 0, opacity: 0 },
                {
                    scale: 1.8,
                    opacity: 1,
                    duration: duration * 0.15,
                    ease: 'power2.out',
                },
                duration * 0.35
            );
            // Settle down to a gentle idle glow
            tl.to(
                flareRef.current,
                {
                    scale: 1,
                    opacity: 0.7,
                    duration: duration * 0.25,
                    ease: 'power2.inOut',
                },
                duration * 0.5
            );

            // Phase 3: CSS reflection fades in
            tl.fromTo(
                reflectionRef.current,
                { opacity: 0, y: '10px' },
                {
                    opacity: 1,
                    y: '0px',
                    duration: duration * 0.35,
                    ease: 'power2.out',
                },
                duration * 0.55
            );
        }, containerRef);

        return () => ctx.revert();
    }, [duration]);

    return (
        <div
            ref={containerRef}
            className={`select-none ${className}`}
            style={{ perspective: '800px' }}
        >
            {/* Master container — centers the logo stack */}
            <div
                style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0px',
                    position: 'relative',
                }}
            >
                {/* ENCORE — drops from top */}
                <div
                    ref={encoreRef}
                    style={{
                        opacity: 0,
                        willChange: 'transform, opacity',
                        transform: 'translateZ(0)',
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    <img
                        src={ENCORE_SRC}
                        alt="Encore"
                        draggable={false}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            imageRendering: 'auto',
                            WebkitBackfaceVisibility: 'hidden',
                            backfaceVisibility: 'hidden',
                        }}
                    />

                    {/* ── Starburst flare on the 'R' design element ───────────────────── */}
                    {/* Positioned at the sparkle point on top of the R (~78% left, ~12% top) */}
                    <div
                        ref={flareRef}
                        style={{
                            position: 'absolute',
                            top: '12%',
                            left: '78%',
                            width: '80px',
                            height: '80px',
                            opacity: 0,
                            willChange: 'transform, opacity',
                            pointerEvents: 'none',
                            zIndex: 10,
                        }}
                    >
                        {/* Core bright point */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, #FFFFFF 0%, rgba(255,255,255,0.9) 40%, rgba(244,213,122,0.6) 70%, transparent 100%)',
                                transform: 'translate(-50%, -50%)',
                                animation: 'coreGlow 3s ease-in-out infinite',
                                filter: 'blur(0.5px)',
                            }}
                        />

                        {/* Radial glow halo */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(212,175,55,0.15) 40%, transparent 70%)',
                                transform: 'translate(-50%, -50%)',
                                animation: 'starburstPulse 4s ease-in-out infinite',
                                filter: 'blur(2px)',
                            }}
                        />

                        {/* Cross-shaped light rays — horizontal */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '70px',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 55%, rgba(255,255,255,0.1) 80%, transparent 100%)',
                                transform: 'translate(-50%, -50%)',
                                animation: 'starburstPulse 4s ease-in-out infinite',
                            }}
                        />

                        {/* Cross-shaped light rays — vertical */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '2px',
                                height: '50px',
                                background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 55%, rgba(255,255,255,0.1) 80%, transparent 100%)',
                                transform: 'translate(-50%, -50%)',
                                animation: 'starburstPulse 4s ease-in-out 0.5s infinite',
                            }}
                        />

                        {/* Diagonal ray — 45deg */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '45px',
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 60%, transparent 100%)',
                                transform: 'translate(-50%, -50%) rotate(45deg)',
                                animation: 'starburstPulse 4s ease-in-out 0.3s infinite',
                            }}
                        />

                        {/* Diagonal ray — -45deg */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '45px',
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 60%, transparent 100%)',
                                transform: 'translate(-50%, -50%) rotate(-45deg)',
                                animation: 'starburstPulse 4s ease-in-out 0.7s infinite',
                            }}
                        />
                    </div>
                </div>

                {/* Gold separator line with continuous shimmer */}
                <div
                    ref={separatorRef}
                    style={{
                        width: '85%',
                        height: '2px',
                        opacity: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity',
                        background: 'linear-gradient(90deg, transparent, #D4AF37 15%, #F4D57A 50%, #D4AF37 85%, transparent)',
                        margin: '4px 0',
                        borderRadius: '1px',
                    }}
                >
                    {/* Continuous shimmer sweep — CSS animated */}
                    <div
                        ref={shimmerRef}
                        style={{
                            position: 'absolute',
                            top: '-4px',
                            left: '-40%',
                            width: '35%',
                            height: '10px',
                            opacity: 0,
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.9) 45%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 55%, rgba(255,255,255,0.3) 75%, transparent 100%)',
                            filter: 'blur(1px)',
                            pointerEvents: 'none',
                            willChange: 'transform',
                        }}
                    />
                </div>

                {/* REPRESENTATION — rises from bottom */}
                <div
                    ref={repRef}
                    style={{
                        opacity: 0,
                        willChange: 'transform, opacity',
                        transform: 'translateZ(0)',
                        width: '100%',
                    }}
                >
                    <img
                        src={REPRESENTATION_SRC}
                        alt="Representation"
                        draggable={false}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            imageRendering: 'auto',
                            WebkitBackfaceVisibility: 'hidden',
                            backfaceVisibility: 'hidden',
                        }}
                    />
                </div>

                {/* CSS Reflection — flipped REPRESENTATION with gradient mask */}
                <div
                    ref={reflectionRef}
                    style={{
                        opacity: 0,
                        willChange: 'opacity',
                        width: '100%',
                        marginTop: '2px',
                        transform: 'scaleY(-1)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, transparent 80%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, transparent 80%)',
                        filter: 'blur(0.5px)',
                        pointerEvents: 'none',
                    }}
                >
                    <img
                        src={REPRESENTATION_SRC}
                        alt=""
                        draggable={false}
                        aria-hidden="true"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            imageRendering: 'auto',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnimatedLogo;
