/**
 * EventsCarousel — Horizontal Infinite Arc Carousel
 *
 * Items travel along a subtle arc path:
 *   - Enter from the bottom-right with a slight tilt
 *   - Center perfectly straight and vertically centered
 *   - Exit to the bottom-left with the opposite tilt
 * Seamless infinite scroll left-to-right. Touch/pointer drag support.
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

const GAP = 24;
const MIN_EFFECTIVE = 12;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

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
    const scrollRef = useRef({ current: 0, target: 0 });
    const rafRef = useRef(0);
    const isDownRef = useRef(false);
    const dragStartRef = useRef({ x: 0, scroll: 0 });
    const dragVelocityRef = useRef(0);
    const lastDragXRef = useRef(0);
    const dragDistRef = useRef(0);
    const didDragRef = useRef(false);
    const speedRef = useRef(desktopSpeed);
    const resumeTimer = useRef(0);

    const layoutRef = useRef({ cardSize: 0, stride: 0, totalTrack: 0 });

    // Duplicate items for seamless looping
    const effectiveItems = useMemo(() => {
        if (!items.length) return [];
        const arr = [...items];
        while (arr.length < MIN_EFFECTIVE) arr.push(...items);
        return arr;
    }, [items]);

    // Compute layout — 1:1 square cards
    const computeLayout = useCallback(() => {
        const el = containerRef.current;
        if (!el || !effectiveItems.length) return;
        const containerH = el.clientHeight;
        const cardSize = Math.round(containerH * 0.65);
        const stride = cardSize + GAP;
        const totalTrack = stride * effectiveItems.length;

        layoutRef.current = { cardSize, stride, totalTrack };

        itemRefs.current.forEach((div) => {
            if (!div) return;
            div.style.width = `${cardSize}px`;
            div.style.height = `${cardSize}px`;
        });
    }, [effectiveItems.length]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !effectiveItems.length) return;

        const isMobile = window.innerWidth < 768;
        speedRef.current = isMobile ? mobileSpeed : desktopSpeed;
        computeLayout();

        // RAF loop
        const update = () => {
            const { cardSize, stride, totalTrack } = layoutRef.current;
            if (!stride || !totalTrack) {
                rafRef.current = requestAnimationFrame(update);
                return;
            }

            const sc = scrollRef.current;

            if (!isDownRef.current) {
                sc.target += speedRef.current;
            }

            // Seamless wrap
            if (sc.target >= totalTrack) sc.target -= totalTrack;
            if (sc.target < 0) sc.target += totalTrack;

            sc.current = lerp(sc.current, sc.target, 0.08);
            if (sc.current >= totalTrack) sc.current -= totalTrack;
            if (sc.current < 0) sc.current += totalTrack;

            const containerW = el.clientWidth;
            const containerH = el.clientHeight;
            const centerX = containerW / 2;
            const centerY = (containerH - cardSize) / 2; // vertical center for card

            // Arc parameters
            const arcRadius = containerW * 0.8; // large radius = subtle curve
            const maxRotation = 6; // degrees of rotation at the edges
            const maxYOffset = 35; // pixels of vertical offset at the edges

            itemRefs.current.forEach((div, i) => {
                if (!div) return;
                let posX = i * stride - sc.current;

                // Wrap items
                if (posX < -stride * 1.5) posX += totalTrack;
                if (posX > totalTrack - stride * 1.5) posX -= totalTrack;

                // Where is this card's center relative to container center?
                const cardCenterX = posX + cardSize / 2;
                const normalizedX = (cardCenterX - centerX) / (containerW / 2); // -1 to +1

                // Arc effect — parabolic curve for Y offset (0 at center, max at edges)
                const yOffset = maxYOffset * normalizedX * normalizedX;

                // Rotation — linear tilt: positive on right (clockwise), negative on left (counter-clockwise)
                // Center = 0 rotation
                const rotation = -normalizedX * maxRotation;

                // Scale — slightly smaller at edges
                const absNorm = Math.abs(normalizedX);
                const scale = 1 - absNorm * 0.06;

                // Opacity — fade at far edges
                const opacity = Math.max(0, 1 - absNorm * 0.35);

                const tx = posX;
                const ty = centerY + yOffset;

                div.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(${scale})`;
                div.style.opacity = `${opacity}`;
            });

            rafRef.current = requestAnimationFrame(update);
        };

        rafRef.current = requestAnimationFrame(update);

        // ── Pointer handlers ───────────────────
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
            scrollRef.current.target -= dx * 1.5;
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!isDownRef.current) return;
            isDownRef.current = false;
            el.releasePointerCapture(e.pointerId);
            scrollRef.current.target -= dragVelocityRef.current * 10;
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
                        draggable={false}
                    />
                </div>
            ))}
        </div>
    );
}
