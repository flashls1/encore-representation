/**
 * TalentCarousel — Vertical Banner Carousel
 *
 * CSS/DOM-based vertical carousel for talent banners (5:3 aspect ratio).
 *   - 3 items visible: center crisp, top/bottom blurred + faded
 *   - Continuous auto-scroll (configurable speed)
 *   - Click center item to navigate
 *   - Drag to scroll vertically
 *   - Zero WebGL overhead — pure CSS transforms + requestAnimationFrame
 *
 * Replaces the original OGL horizontal CircularGallery fork.
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import './TalentCarousel.css';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface CarouselItem {
    image: string;
    id: string;
}

export interface TalentCarouselProps {
    items: CarouselItem[];
    autoScrollSpeed?: number;
    onItemClick?: (id: string) => void;
    className?: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const ASPECT = 5 / 3;
const GAP = 24;
const MIN_EFFECTIVE = 6; // duplicated items for seamless wrapping

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function TalentCarousel({
    items,
    autoScrollSpeed = 3,
    onItemClick,
    className = '',
}: TalentCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollRef = useRef({ current: 0, target: 0, last: 0 });
    const rafRef = useRef(0);
    const isDownRef = useRef(false);
    const dragStartRef = useRef({ y: 0, scroll: 0 });
    const dragVelocityRef = useRef(0);
    const lastDragYRef = useRef(0);
    const dragDistRef = useRef(0);
    const resumeTimer = useRef(0);
    const centerIdxRef = useRef(0);
    const didDragRef = useRef(false);

    // Mutable layout values — recalculated on resize
    const layoutRef = useRef({
        itemH: 0, itemW: 0, stride: 0,
        totalTrack: 0, centerSlot: 0,
    });

    // Duplicate items for seamless infinite wrapping when list is short
    const effectiveItems = useMemo(() => {
        if (!items.length) return [];
        const arr = [...items];
        while (arr.length < MIN_EFFECTIVE) arr.push(...items);
        return arr;
    }, [items]);

    const N = effectiveItems.length;

    /* ─── Animation + events ──────────────────────────────────────────────────── */

    useEffect(() => {
        if (!N || !containerRef.current) return;

        const container = containerRef.current;
        const scroll = scrollRef.current;
        const layout = layoutRef.current;
        const ease = 0.06;

        // Compute layout dimensions
        const computeLayout = () => {
            const cW = container.clientWidth;
            const cH = container.clientHeight;

            // Width-driven: banners fill ~42% of container width (proper banner proportions)
            // Capped at 620px so they don't get absurdly large on ultrawide monitors
            layout.itemW = Math.min(Math.round(cW * 0.42), 620);
            // Height derived from 5:3 aspect ratio
            layout.itemH = Math.round(layout.itemW / ASPECT);
            layout.stride = layout.itemH + GAP;
            layout.totalTrack = N * layout.stride;
            layout.centerSlot = cH / 2 - layout.itemH / 2;

            // Apply sizes to DOM
            itemRefs.current.forEach(el => {
                if (!el) return;
                el.style.height = `${layout.itemH}px`;
            });
        };

        computeLayout();

        // RAF loop
        const update = () => {
            const { stride, totalTrack, centerSlot } = layout;

            // Auto-scroll when not dragging
            if (!isDownRef.current && dragVelocityRef.current === 0) {
                scroll.target += autoScrollSpeed * 0.5;
            }

            // Lerp towards target
            scroll.current = lerp(scroll.current, scroll.target, ease);

            // Update each item position + effects
            let closestD = Infinity;
            let closestI = 0;

            for (let i = 0; i < N; i++) {
                const el = itemRefs.current[i];
                if (!el) continue;

                // Virtual distance from scroll center
                let diff = i * stride - (((scroll.current % totalTrack) + totalTrack) % totalTrack);
                // Wrap to [-half, +half)
                while (diff > totalTrack / 2) diff -= totalTrack;
                while (diff < -totalTrack / 2) diff += totalTrack;

                const y = centerSlot + diff;
                const d = Math.abs(diff) / stride; // 0 = center, 1 = adjacent

                // Blur + brightness + opacity based on distance
                const blur = d < 0.15 ? 0 : Math.min(d * 5, 8);
                const brightness = d < 0.15 ? 1 : Math.max(0.45, 1 - d * 0.45);
                const opacity = d >= 2 ? 0 : Math.max(0.35, 1 - d * 0.5);
                const scale = d >= 2 ? 0.85 : Math.max(0.9, 1 - d * 0.06);

                el.style.transform = `translate(-50%, ${y}px) scale(${scale})`;
                el.style.filter =
                    blur < 0.5
                        ? 'none'
                        : `blur(${blur.toFixed(1)}px) brightness(${brightness.toFixed(2)})`;
                el.style.opacity = `${opacity.toFixed(3)}`;
                el.style.zIndex = `${10 - Math.round(d)}`;
                el.style.visibility = d >= 2 ? 'hidden' : 'visible';

                if (d < closestD) { closestD = d; closestI = i; }
            }

            centerIdxRef.current = closestI;
            scroll.last = scroll.current;
            rafRef.current = requestAnimationFrame(update);
        };

        // ── Pointer handlers (mouse + touch via Pointer API) ───────────────────
        const onPointerDown = (e: PointerEvent) => {
            isDownRef.current = true;
            didDragRef.current = false;
            dragDistRef.current = 0;
            dragVelocityRef.current = 0;
            window.clearTimeout(resumeTimer.current);
            dragStartRef.current = { y: e.clientY, scroll: scroll.target };
            lastDragYRef.current = e.clientY;
            container.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDownRef.current) return;
            const y = e.clientY;
            dragDistRef.current += Math.abs(y - lastDragYRef.current);
            // Drag up → content scrolls up (forward through list)
            const delta = dragStartRef.current.y - y;
            scroll.target = dragStartRef.current.scroll + delta * 0.8;
            dragVelocityRef.current = (lastDragYRef.current - y) * 0.003;
            lastDragYRef.current = y;
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!isDownRef.current) return;
            isDownRef.current = false;
            didDragRef.current = dragDistRef.current > 5;
            // Momentum
            scroll.target += dragVelocityRef.current * 60;
            resumeTimer.current = window.setTimeout(() => {
                dragVelocityRef.current = 0;
            }, 800);
            try { container.releasePointerCapture(e.pointerId); } catch { /* noop */ }
        };

        const onResize = () => computeLayout();

        // Bind
        window.addEventListener('resize', onResize);
        container.addEventListener('pointerdown', onPointerDown);
        container.addEventListener('pointermove', onPointerMove);
        container.addEventListener('pointerup', onPointerUp);
        container.addEventListener('pointercancel', onPointerUp);

        rafRef.current = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.clearTimeout(resumeTimer.current);
            window.removeEventListener('resize', onResize);
            container.removeEventListener('pointerdown', onPointerDown);
            container.removeEventListener('pointermove', onPointerMove);
            container.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('pointercancel', onPointerUp);
        };
    }, [N, autoScrollSpeed]);

    /* ─── Click handler ───────────────────────────────────────────────────────── */

    const handleClick = useCallback(() => {
        if (!onItemClick || didDragRef.current) return;
        const originalIdx = centerIdxRef.current % items.length;
        onItemClick(items[originalIdx].id);
    }, [onItemClick, items]);

    if (!effectiveItems.length) return null;

    return (
        <div
            ref={containerRef}
            className={`talent-carousel-v ${className}`.trim()}
            onClick={handleClick}
        >
            {effectiveItems.map((item, i) => (
                <div
                    key={`${item.id}-${i}`}
                    ref={el => { itemRefs.current[i] = el; }}
                    className="tc-v-item"
                >
                    <img src={item.image} alt="" draggable={false} />
                </div>
            ))}
        </div>
    );
}
