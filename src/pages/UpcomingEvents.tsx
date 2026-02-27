import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { Calendar, MapPin, ExternalLink, Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── 3D Tilt Card ──────────────────────────────────────────────────────────────
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { damping: 20, stiffness: 300 });
    const springY = useSpring(rotateY, { damping: 20, stiffness: 300 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        rotateX.set(-y * 12);
        rotateY.set(x * 12);
    };

    const handleLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{
                perspective: 800,
                rotateX: springX,
                rotateY: springY,
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
        >
            {children}
        </motion.div>
    );
};

// ─── Timeline Event Node ───────────────────────────────────────────────────────
const TimelineNode = ({ event, index, isLast }: { event: any; index: number; isLast: boolean }) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!nodeRef.current) return;
        gsap.fromTo(nodeRef.current,
            { opacity: 0, x: index % 2 === 0 ? -40 : 40 },
            {
                opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
                scrollTrigger: {
                    trigger: nodeRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            }
        );
    }, [index]);

    return (
        <div ref={nodeRef} className="relative flex items-start gap-6 pb-12 last:pb-0">
            {/* Timeline connector */}
            <div className="flex flex-col items-center flex-shrink-0">
                {/* Dot */}
                <motion.div
                    className="w-4 h-4 rounded-full border-2 z-10"
                    style={{
                        borderColor: '#D4AF37',
                        backgroundColor: '#0A0A0A',
                    }}
                    whileInView={{ scale: [0, 1.3, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                />
                {/* Line */}
                {!isLast && (
                    <motion.div
                        className="w-[2px] flex-1 mt-1"
                        style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)' }}
                        initial={{ scaleY: 0, transformOrigin: 'top' }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    />
                )}
            </div>

            {/* Event card with 3D tilt */}
            <TiltCard className="flex-1">
                <div
                    className="rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/5"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid rgba(212, 175, 55, 0.1)',
                    }}
                >
                    {/* Image — 16:9 on desktop, 1:1 on mobile */}
                    {event.image_url && (
                        <div className="relative w-full pb-[56.25%] sm:pb-[50%] overflow-hidden">
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 50%)' }}
                            />
                        </div>
                    )}

                    {!event.image_url && (
                        <div className="relative w-full pb-[30%] overflow-hidden" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Calendar className="h-10 w-10 opacity-20" style={{ color: '#D4AF37' }} />
                            </div>
                        </div>
                    )}

                    <div className="p-5 sm:p-6">
                        <h3
                            className="font-orbitron text-lg sm:text-xl font-bold tracking-wider mb-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {event.title}
                        </h3>

                        {event.description && (
                            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {event.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                            {event.event_date && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }}>
                                    <Calendar className="h-3 w-3" style={{ color: '#D4AF37' }} />
                                    {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
                                        month: 'long', day: 'numeric', year: 'numeric',
                                    })}
                                    {event.event_time && ` · ${event.event_time}`}
                                </span>
                            )}
                            {event.location && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }}>
                                    <MapPin className="h-3 w-3" style={{ color: '#D4AF37' }} />
                                    {event.location}
                                </span>
                            )}
                        </div>

                        {event.link_url && (
                            <motion.a
                                href={event.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase"
                                style={{
                                    backgroundColor: '#D4AF37',
                                    color: '#0A0A0A',
                                }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <ExternalLink className="h-3 w-3" />
                                Learn More
                            </motion.a>
                        )}
                    </div>
                </div>
            </TiltCard>
        </div>
    );
};

// ─── Page ──────────────────────────────────────────────────────────────────────
const UpcomingEvents = () => {
    const { data: events, isLoading } = useUpcomingEvents(true);
    const headingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!headingRef.current) return;
        gsap.fromTo(headingRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div ref={headingRef} className="text-center mb-12 md:mb-16">
                        <h1
                            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            Upcoming Events
                        </h1>
                        <div className="w-16 h-[2px] mx-auto" style={{ backgroundColor: 'var(--accent)' }} />
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Loader2 className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                            </motion.div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && (!events || events.length === 0) && (
                        <motion.div
                            className="text-center py-16"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Calendar className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--text-muted)' }} />
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                No Upcoming Events
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Check back soon for new events!
                            </p>
                        </motion.div>
                    )}

                    {/* Timeline */}
                    {events && events.length > 0 && (
                        <div className="relative">
                            {events.map((event, idx) => (
                                <TimelineNode
                                    key={event.id}
                                    event={event}
                                    index={idx}
                                    isLast={idx === events.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UpcomingEvents;
