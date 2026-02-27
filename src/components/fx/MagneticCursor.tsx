import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/**
 * MagneticCursor — a custom gold ring that tracks the mouse
 * and snaps/expands when hovering interactive elements.
 * Automatically hidden on touch devices.
 */
const MagneticCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const x = useSpring(cursorX, springConfig);
    const y = useSpring(cursorY, springConfig);

    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const sizeRef = useRef(12);

    useEffect(() => {
        // Detect touch-only devices — hide cursor on mobile
        const mql = window.matchMedia('(pointer: coarse)');
        if (mql.matches) {
            setIsTouch(true);
            return;
        }

        const handleMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleEnter = () => setIsVisible(true);
        const handleLeave = () => setIsVisible(false);

        // Detect interactive elements for the snap/expand effect
        const handleOverTarget = (e: Event) => {
            const target = e.target as HTMLElement;
            const interactive = target.closest('a, button, [role="button"], [data-magnetic]');
            setIsHovering(!!interactive);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseenter', handleEnter);
        window.addEventListener('mouseleave', handleLeave);
        document.addEventListener('mouseover', handleOverTarget);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseenter', handleEnter);
            window.removeEventListener('mouseleave', handleLeave);
            document.removeEventListener('mouseover', handleOverTarget);
        };
    }, [cursorX, cursorY, isVisible]);

    if (isTouch) return null;

    const size = isHovering ? 48 : 12;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
            style={{
                x,
                y,
                width: size,
                height: size,
                borderRadius: '50%',
                border: isHovering ? '2px solid #D4AF37' : 'none',
                backgroundColor: isHovering ? 'transparent' : '#D4AF37',
                transform: 'translate(-50%, -50%)',
                opacity: isVisible ? 1 : 0,
                transition: 'width 0.2s ease, height 0.2s ease, border 0.2s ease, background-color 0.2s ease, opacity 0.15s ease',
            }}
        />
    );
};

export default MagneticCursor;
