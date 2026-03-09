import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * AnimatedLogo — Cinematic GSAP intro for the Encore Representation logo.
 *
 * Architecture (separate high-res assets + CSS-generated elements):
 *   1. "ENCORE" — /encore-text.png (drops from above)
 *   2. Gold separator line with left-to-right shine sweep
 *   3. "REPRESENTATION" — /representation-text.png (rises from below)
 *   4. CSS reflection of REPRESENTATION (scaleY(-1) + gradient mask fade)
 *
 * Timeline:
 *   0% → 40%   ENCORE drops, REPRESENTATION rises (simultaneous)
 *   35% → 55%  Gold separator line materializes with shine sweep
 *   40% → 55%  Lens-flare flash at convergence point
 *   55% → 85%  CSS reflection fades in below
 */

interface AnimatedLogoProps {
    /** Total animation duration in seconds (1–5, default 2.5) */
    duration?: number;
    className?: string;
}

const ENCORE_SRC = '/encore-text.png';
const REPRESENTATION_SRC = '/representation-text.png';

const AnimatedLogo = ({ duration = 2.5, className = '' }: AnimatedLogoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const encoreRef = useRef<HTMLDivElement>(null);
    const separatorRef = useRef<HTMLDivElement>(null);
    const shineRef = useRef<HTMLDivElement>(null);
    const repRef = useRef<HTMLDivElement>(null);
    const reflectionRef = useRef<HTMLDivElement>(null);
    const flareRef = useRef<HTMLDivElement>(null);

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

            // Phase 2: Shine sweep across the separator (left to right)
            tl.fromTo(
                shineRef.current,
                { x: '-100%', opacity: 1 },
                { x: '200%', opacity: 1, duration: duration * 0.35, ease: 'power1.inOut' },
                duration * 0.4
            );

            // Phase 2: Lens flare flash at convergence
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
                </div>

                {/* Gold separator line with shine effect */}
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
                    {/* Shine sweep overlay */}
                    <div
                        ref={shineRef}
                        style={{
                            position: 'absolute',
                            top: '-3px',
                            left: 0,
                            width: '40%',
                            height: '8px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 60%, transparent)',
                            filter: 'blur(1px)',
                            pointerEvents: 'none',
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

                {/* Lens flare flash — positioned at center convergence */}
                <div
                    ref={flareRef}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '120px',
                        height: '120px',
                        marginTop: '-60px',
                        marginLeft: '-60px',
                        opacity: 0,
                        willChange: 'transform, opacity',
                        background:
                            'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(212,175,55,0.6) 30%, rgba(212,175,55,0) 70%)',
                        borderRadius: '50%',
                        filter: 'blur(2px)',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                />
            </div>
        </div>
    );
};

export default AnimatedLogo;
