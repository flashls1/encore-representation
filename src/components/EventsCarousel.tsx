/**
 * EventsCarousel — Horizontal Image Carousel
 *
 * CSS/DOM-based horizontal carousel for event images.
 *   - Continuous auto-scroll left-to-right
 *   - Configurable desktop/mobile speeds
 *   - Touch/pointer drag support
 *   - Infinite loop wrapping
 */

import { useRef, useEffect, useMemo, useCallback } from 'react';
import './EventsCarousel.css';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface EventCardItem {
    image: string;
    id: string;
    title?: string;
}

interface EventsCarouselProps {
    items: EventCardItem[];
    desktopSpeed?: number;
    mobileSpeed?: number;
    onItemClick?: (id: string) => void;
    className?: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const GAP = 16;
const MIN_EFFECTIVE = 12; // Ensure enough cards for seamless looping

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function EventsCarousel({
    items,
    desktopSpeed = 1.0,
    mobileSpeed = 0.6,
    onItemClick,
    className = '',
}: EventsCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollRef = useRef({ current: 0, target: 0, last: 0 });
    const rafRef = useRef(0);
    const isDownRef = useRef(false);
    const dragStartRef = useRef({ x: 0, scroll: 0 });
    const dragVelocityRef = useRef(0);
    const lastDragXRef = useRef(0);
    const dragDistRef = useRef(0);
    const resumeTimer = useRef(0);
    const didDragRef = useRef(false);
    const speedRef = useRef(desktopSpeed);

    // Mutable layout values
    const layoutRef = useRef({
        itemW: 0, stride: 0, totalTrack: 0,
    });

    // Duplicate items for seamless infinite wrapping
    const effectiveItems = useMemo(() => {
        if (!items.length) return [];
        const arr = [...items];
        while (arr.length < MIN_EFFECTIVE) arr.push(...items);
        return arr;
    }, [items]);

    // Compute layout dimensions
    const computeLayout = useCallback(() => {
        const el = containerRef.current;
        if (!el || !effectiveItems.length) return;
        const containerH = el.clientHeight;
        // Card height = 85% of container, width = 5:3 aspect ratio
        const cardH = Math.round(containerH * 0.85);
        const cardW = Math.round(cardH * (5 / 3));
        const stride = cardW + GAP;
        const totalTrack = stride * effectiveItems.length;

        layoutRef.current = { itemW: cardW, stride, totalTrack };

        // Apply dimensions to items
        itemRefs.current.forEach((div) => {
            if (!div) return;
            div.style.width = `${cardW}px`;
            div.style.height = `${cardH}px`;
        });
    }, [effectiveItems.length]);

    // On image load, recompute
    const onImgLoad = useCallback(() => computeLayout(), [computeLayout]);

    // Set up RAF loop + pointer handlers + resize
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !effectiveItems.length) return;

        const isMobile = window.innerWidth < 768;
        speedRef.current = isMobile ? mobileSpeed : desktopSpeed;

        computeLayout();

        // RAF loop — scroll left-to-right
        const update = () => {
            const { stride, totalTrack } = layoutRef.current;
            if (!stride || !totalTrack) {
                rafRef.current = requestAnimationFrame(update);
                return;
            }

            const sc = scrollRef.current;

            if (!isDownRef.current) {
                // Auto-scroll: left-to-right means offset increases
                sc.target += speedRef.current;
            }

            // Wrap
            if (sc.target >= totalTrack) sc.target -= totalTrack;
            if (sc.target < 0) sc.target += totalTrack;

            sc.current = lerp(sc.current, sc.target, 0.08);

            // Wrap current too
            if (sc.current >= totalTrack) sc.current -= totalTrack;
            if (sc.current < 0) sc.current += totalTrack;

            // Position items
            const containerW = el.clientWidth;
            const halfContainer = containerW / 2;

            itemRefs.current.forEach((div, i) => {
                if (!div) return;
                let pos = i * stride - sc.current;

                // Wrap items for infinite scroll
                if (pos < -stride) pos += totalTrack;
                if (pos > totalTrack - stride) pos -= totalTrack;

                const centerX = pos + layoutRef.current.itemW / 2;
                const distFromCenter = Math.abs(centerX - halfContainer);
                const maxDist = containerW;
                const normalizedDist = Math.min(distFromCenter / maxDist, 1);

                // Subtle scale and opacity for items near edges
                const scale = 1 - normalizedDist * 0.08;
                const opacity = 1 - normalizedDist * 0.4;

                div.style.transform = `translateX(${pos}px) scale(${scale})`;
                div.style.opacity = `${opacity}`;
            });

            sc.last = sc.current;
            rafRef.current = requestAnimationFrame(update);
        };

        rafRef.current = requestAnimationFrame(update);

        // ── Pointer handlers (mouse + touch) ───────────────────
        const onPointerDown = (e: PointerEvent) => {
            isDownRef.current = true;
            didDragRef.current = false;
            dragStartRef.current = { x: e.clientX, scroll: scrollRef.current.target };
            lastDragXRef.current = e.clientX;
            dragDistRef.current = 0;
            dragVelocityRef.current = 0;
            clearTimeout(resumeTimer.current);
            el.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDownRef.current) return;
            const dx = e.clientX - lastDragXRef.current;
            dragVelocityRef.current = dx;
            lastDragXRef.current = e.clientX;
            dragDistRef.current += Math.abs(dx);
            if (dragDistRef.current > 4) didDragRef.current = true;
            // Drag opposite to scroll direction for natural feel
            scrollRef.current.target -= dx * 1.5;
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!isDownRef.current) return;
            isDownRef.current = false;
            el.releasePointerCapture(e.pointerId);
            // Apply fling velocity
            scrollRef.current.target -= dragVelocityRef.current * 12;
            // Resume auto-scroll after 2s
            resumeTimer.current = window.setTimeout(() => {
                dragVelocityRef.current = 0;
            }, 2000);
        };

        const onPointerLeave = () => {
            if (isDownRef.current) {
                isDownRef.current = false;
                resumeTimer.current = window.setTimeout(() => {
                    dragVelocityRef.current = 0;
                }, 2000);
            }
        };

        const onResize = () => {
            const mobile = window.innerWidth < 768;
            speedRef.current = mobile ? mobileSpeed : desktopSpeed;
            computeLayout();
        };

        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('pointerleave', onPointerLeave);
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(rafRef.current);
            clearTimeout(resumeTimer.current);
            el.removeEventListener('pointerdown', onPointerDown);
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerup', onPointerUp);
            el.removeEventListener('pointerleave', onPointerLeave);
            window.removeEventListener('resize', onResize);
        };
    }, [effectiveItems.length, desktopSpeed, mobileSpeed, computeLayout]);

    // Update speed ref when props change
    useEffect(() => {
        const mobile = window.innerWidth < 768;
        speedRef.current = mobile ? mobileSpeed : desktopSpeed;
    }, [desktopSpeed, mobileSpeed]);

    if (!effectiveItems.length) return null;

    return (
        <div
            ref={containerRef}
            className={`events-carousel ${className}`}
            style={{ touchAction: 'pan-y' }}
        >
            {effectiveItems.map((item, i) => (
                <div
                    key={`${item.id}-${i}`}
                    ref={(el) => { itemRefs.current[i] = el; }}
                    className="events-carousel__card"
                    onClick={() => {
                        if (!didDragRef.current && onItemClick) {
                            onItemClick(item.id);
                        }
                    }}
                >
                    <img
                        src={item.image}
                        alt={item.title || ''}
                        className="events-carousel__img"
                        onLoad={onImgLoad}
                        draggable={false}
                    />
                    {item.title && (
                        <div className="events-carousel__label">
                            <span>{item.title}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
