import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * AnimatedLogo — Cinematic GSAP intro for the Encore Representation logo.
 *
 * Architecture (separate high-res assets + CSS-generated elements):
 *   1. "ENCORE" — /encore-text.png (drops from above)
 *      • Dynamic star sparkle drops from top-right, lands on R/E junction, then twinkles
 *   2. Gold separator line with continuous left→right shimmer
 *   3. "REPRESENTATION" — /representation-text.png (rises from below)
 *   4. CSS reflection of REPRESENTATION (scaleY(-1) + gradient mask fade)
 *
 * Timeline:
 *   0% → 40%   ENCORE drops, REPRESENTATION rises (simultaneous)
 *   15% → 40%  Star sparkle drops from top-right, lands on R/E junction
 *   32% → 55%  Gold separator line materializes → continuous shimmer begins
 *   40% → 55%  Star sparkle burst on landing → idle twinkle loop
 *   55% → 85%  CSS reflection fades in below
 */

interface AnimatedLogoProps {
    /** Total animation duration in seconds (1–5, default 2.5) */
    duration?: number;
    className?: string;
}

const ENCORE_SRC = '/encore-text.png?v=2';
const REPRESENTATION_SRC = '/representation-text.png';

/* ─── Ray config for the star sparkle ──────────────────────────────────────── */
const STAR_RAYS = [
    { angle: 0, length: 55, width: 2 },
    { angle: 36, length: 35, width: 1 },
    { angle: 72, length: 50, width: 1.5 },
    { angle: 108, length: 35, width: 1 },
    { angle: 144, length: 55, width: 2 },
    { angle: 180, length: 55, width: 2 },
    { angle: 216, length: 35, width: 1 },
    { angle: 252, length: 50, width: 1.5 },
    { angle: 288, length: 35, width: 1 },
    { angle: 324, length: 55, width: 2 },
];

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

    /* Idle twinkle: gentle scale pulse for the star sparkle */
    @keyframes starTwinkle {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.75; }
      25%      { transform: scale(1.08) rotate(4deg); opacity: 0.9; }
      50%      { transform: scale(0.92) rotate(-2deg); opacity: 0.65; }
      75%      { transform: scale(1.05) rotate(3deg); opacity: 0.85; }
    }

    /* Slow continuous rotation for the ray container */
    @keyframes starRotate {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
    const sparkleRef = useRef<HTMLDivElement>(null);

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

            // Responsive sparkle positioning
            const isMobile = window.innerWidth < 768;
            const sparkleSize = isMobile ? 60 : 120;
            if (sparkleRef.current) {
                sparkleRef.current.style.width = `${sparkleSize}px`;
                sparkleRef.current.style.height = `${sparkleSize}px`;
            }

            // Phase 1b: Star sparkle drops from top-right
            tl.fromTo(
                sparkleRef.current,
                {
                    top: '-40%',
                    left: isMobile ? '60%' : '80%',
                    scale: 0.3,
                    opacity: 0,
                },
                {
                    top: isMobile ? '-7%' : '-1%',
                    left: isMobile ? '58%' : '60%',
                    scale: isMobile ? 0.4 : 0.5,
                    opacity: 0.6,
                    duration: duration * 0.35,
                    ease: 'power2.in',
                },
                duration * 0.05
            );

            // Phase 2a: Star sparkle burst on landing
            tl.to(
                sparkleRef.current,
                {
                    scale: 1.4,
                    opacity: 1,
                    duration: duration * 0.12,
                    ease: 'power4.out',
                },
                duration * 0.40
            );

            // Phase 2b: Settle into idle size
            tl.to(
                sparkleRef.current,
                {
                    scale: 1,
                    opacity: 0.8,
                    duration: duration * 0.2,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (sparkleRef.current) {
                            sparkleRef.current.style.animation = 'starTwinkle 4s ease-in-out infinite';
                        }
                    },
                },
                duration * 0.52
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
                        if (shimmerRef.current) {
                            shimmerRef.current.style.animation = 'separatorShimmer 2.5s ease-in-out 0.5s infinite';
                        }
                    },
                },
                duration * 0.55
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
                            mixBlendMode: 'multiply',
                            WebkitBackfaceVisibility: 'hidden',
                            backfaceVisibility: 'hidden',
                        }}
                    />

                    {/* ── Dynamic star sparkle — drops in then twinkles on N/C spike ── */}
                    <div
                        ref={sparkleRef}
                        style={{
                            position: 'absolute',
                            top: '-40%',
                            left: '80%',
                            width: '120px',
                            height: '120px',
                            opacity: 0,
                            willChange: 'transform, opacity, top, left',
                            pointerEvents: 'none',
                            zIndex: 10,
                        }}
                    >
                        {/* Rotating ray container */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '100%',
                                height: '100%',
                                transform: 'translate(-50%, -50%)',
                                animation: 'starRotate 10s linear infinite',
                            }}
                        >
                            {STAR_RAYS.map((ray, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: `${ray.length}px`,
                                        height: `${ray.width}px`,
                                        background: `linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(244,213,122,0.6) 40%, transparent 100%)`,
                                        transformOrigin: '0% 50%',
                                        transform: `translate(0%, -50%) rotate(${ray.angle}deg)`,
                                    }}
                                />
                            ))}
                        </div>
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
                            mixBlendMode: 'multiply',
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
                            mixBlendMode: 'multiply',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnimatedLogo;
