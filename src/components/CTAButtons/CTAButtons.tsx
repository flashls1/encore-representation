import { Link } from 'react-router-dom';
import styles from './CTAButtons.module.css';

/** ─── Shared types ──────────────────────────────────────── */
interface CTAButtonProps {
    label: string;
    href: string;
    /** 'desktop' uses larger padding/font; 'mobile' uses compact sizing */
    size?: 'desktop' | 'mobile';
    /** Additional CSS class names */
    className?: string;
}

/** Returns true if the URL is an internal (SPA) route */
const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#');

/* ═══════════════════════════════════════════════════════════
   PRIMARY CTA — Gold Gradient + Arrow + Shine Sweep
   ═══════════════════════════════════════════════════════════ */
export const PrimaryCTA = ({ label, href, size = 'desktop', className = '' }: CTAButtonProps) => {
    const sizeClass = size === 'mobile' ? styles.mobileSize : styles.desktopSize;
    const classes = `${styles.ctaBase} ${styles.primary} ${sizeClass} ${className}`;

    const content = (
        <>
            <span>{label}</span>
            <span className={styles.arrowIcon} aria-hidden="true">
                <svg
                    width={size === 'mobile' ? 16 : 20}
                    height={size === 'mobile' ? 16 : 20}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.5 10H15.5M15.5 10L10.5 5M15.5 10L10.5 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
        </>
    );

    if (isInternal(href)) {
        return (
            <Link to={href} className={classes} aria-label={label}>
                {content}
            </Link>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            aria-label={label}
        >
            {content}
        </a>
    );
};

/* ═══════════════════════════════════════════════════════════
   SECONDARY CTA — Glassmorphism Frosted Glass
   ═══════════════════════════════════════════════════════════ */
export const SecondaryCTA = ({ label, href, size = 'desktop', className = '' }: CTAButtonProps) => {
    const sizeClass = size === 'mobile' ? styles.mobileSize : styles.desktopSize;
    const classes = `${styles.ctaBase} ${styles.secondary} ${sizeClass} ${className}`;

    if (isInternal(href)) {
        return (
            <Link to={href} className={classes} aria-label={label}>
                {label}
            </Link>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            aria-label={label}
        >
            {label}
        </a>
    );
};

/* ═══════════════════════════════════════════════════════════
   CONTAINER — Layout wrapper for the CTA pair
   ═══════════════════════════════════════════════════════════ */
interface CTAContainerProps {
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
    size?: 'desktop' | 'mobile';
    className?: string;
}

export const CTAButtonsContainer = ({
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
    size = 'desktop',
    className = '',
}: CTAContainerProps) => {
    const containerClass = size === 'mobile' ? styles.containerMobile : styles.container;

    return (
        <div className={`${containerClass} ${className}`}>
            <PrimaryCTA label={primaryLabel} href={primaryHref} size={size} />
            {secondaryLabel && secondaryHref && (
                <SecondaryCTA label={secondaryLabel} href={secondaryHref} size={size} />
            )}
        </div>
    );
};

export default CTAButtonsContainer;
