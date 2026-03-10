import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * AnimatedLogo — Cinematic GSAP intro for the Encore Representation logo.
 *
 * Uses a single high-res full logo image (ENCORE + REPRESENTATION + reflection)
 * to avoid quality degradation from image splitting/processing.
 *
 * Animation: Logo fades in with a subtle scale and gold shimmer sweep.
 */

interface AnimatedLogoProps {
    /** Total animation duration in seconds (1–5, default 2.5) */
    duration?: number;
    className?: string;
}

const LOGO_SRC = '/encore-logo-full.jpg';

/* ─── CSS keyframes injected once ──────────────────────────────────────────── */
const STYLE_ID = 'animated-logo-keyframes';
const injectKeyframes = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
    /* Continuous left→right shimmer across the logo */
    @keyframes logoShimmer {
      0%   { left: -50%; opacity: 0; }
      10%  { opacity: 0.6; }
      90%  { opacity: 0.6; }
      100% { left: 120%; opacity: 0; }
    }
  `;
    document.head.appendChild(style);
};

const AnimatedLogo = ({ duration = 2.5, className = '' }: AnimatedLogoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const shimmerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        injectKeyframes();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Phase 1: Logo fades in with subtle upward motion
            tl.fromTo(
                logoRef.current,
                { y: '30px', opacity: 0, scale: 0.97 },
                { y: '0px', opacity: 1, scale: 1, duration: duration * 0.5 },
                0
            );

            // Phase 2: Shimmer sweep after logo is visible
            tl.fromTo(
                shimmerRef.current,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.01,
                    onComplete: () => {
                        if (shimmerRef.current) {
                            shimmerRef.current.style.animation = 'logoShimmer 3s ease-in-out 1s infinite';
                        }
                    },
                },
                duration * 0.5
            );
        }, containerRef);

        return () => ctx.revert();
    }, [duration]);

    return (
        <div
            ref={containerRef}
            className={`select-none ${className}`}
        >
            {/* Logo container */}
            <div
                ref={logoRef}
                style={{
                    opacity: 0,
                    willChange: 'transform, opacity',
                    transform: 'translateZ(0)',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '4px',
                }}
            >
                <img
                    src={LOGO_SRC}
                    alt="Encore Representation"
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

                {/* Shimmer sweep overlay */}
                <div
                    ref={shimmerRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '-50%',
                        width: '40%',
                        height: '100%',
                        opacity: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0.05) 75%, transparent 100%)',
                        pointerEvents: 'none',
                        willChange: 'transform',
                    }}
                />
            </div>
        </div>
    );
};

export default AnimatedLogo;
