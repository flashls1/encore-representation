/**
 * EventsCarousel — Horizontal Infinite Image Carousel
 *
 * Seamless infinite scroll left-to-right with 1:1 square event cards.
 * Touch/pointer drag support. Never stops or resets.
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

const GAP = 24; // spacing between cards
const MIN_COPIES = 4; // minimum duplications for seamless wrap

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function EventsCarousel({
    items,
    desktopSpeed = 1.0,
    mobileSpeed = 0.6,
    onItemClick,
    className = '',
}: EventsCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const rafRef = useRef(0);
    const isDownRef = useRef(false);
    const dragStartRef = useRef({ x: 0, offset: 0 });
    const dragVelocityRef = useRef(0);
    const lastDragXRef = useRef(0);
    const dragDistRef = useRef(0);
    const didDragRef = useRef(false);
    const speedRef = useRef(desktopSpeed);
    const resumeTimer = useRef(0);
    const singleSetWidthRef = useRef(0);

    // Duplicate items enough times for seamless wrapping
    const effectiveItems = useMemo(() => {
        if (!items.length) return [];
        const copies = Math.max(MIN_COPIES, Math.ceil(20 / items.length));
        const arr: EventCardItem[] = [];
        for (let i = 0; i < copies; i++) arr.push(...items);
        return arr;
    }, [items]);

    // Compute card size — 1:1 square, height = 70% of container
    const computeLayout = useCallback(() => {
        const el = containerRef.current;
        if (!el || !items.length) return;
        const containerH = el.clientHeight;
        const cardSize = Math.round(containerH * 0.7);
        const singleSetWidth = items.length * (cardSize + GAP);
        singleSetWidthRef.current = singleSetWidth;

        // Set CSS variable for card size
        el.style.setProperty('--card-size', `${cardSize}px`);
    }, [items.length]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !effectiveItems.length) return;

        const isMobile = window.innerWidth < 768;
        speedRef.current = isMobile ? mobileSpeed : desktopSpeed;

        computeLayout();

        // RAF — continuous scroll
        const update = () => {
            if (!isDownRef.current) {
                offsetRef.current += speedRef.current;
            }

            // Seamless wrap: when we've scrolled past one full set, wrap back
            const singleW = singleSetWidthRef.current;
            if (singleW > 0 && offsetRef.current >= singleW) {
                offsetRef.current -= singleW;
            }
            if (singleW > 0 && offsetRef.current < 0) {
                offsetRef.current += singleW;
            }

            if (trackRef.current) {
                trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
            }

            rafRef.current = requestAnimationFrame(update);
        };

        rafRef.current = requestAnimationFrame(update);

        // ── Pointer handlers ───────────────────
        const onPointerDown = (e: PointerEvent) => {
            isDownRef.current = true;
            didDragRef.current = false;
            dragStartRef.current = { x: e.clientX, offset: offsetRef.current };
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
            offsetRef.current -= dx;
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!isDownRef.current) return;
            isDownRef.current = false;
            el.releasePointerCapture(e.pointerId);
            // Apply fling
            const fling = dragVelocityRef.current * 10;
            offsetRef.current -= fling;
            resumeTimer.current = window.setTimeout(() => {
                dragVelocityRef.current = 0;
            }, 1500);
        };

        const onPointerLeave = () => {
            if (isDownRef.current) {
                isDownRef.current = false;
                resumeTimer.current = window.setTimeout(() => {
                    dragVelocityRef.current = 0;
                }, 1500);
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
            <div
                ref={trackRef}
                className="events-carousel__track"
            >
                {effectiveItems.map((item, i) => (
                    <div
                        key={`${item.id}-${i}`}
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
                            draggable={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
