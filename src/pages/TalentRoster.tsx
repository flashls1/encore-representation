import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useTalents } from "@/hooks/useData";
import type { Talent } from "@/types/database";

gsap.registerPlugin(ScrollTrigger);

// ─── Talent card ────────────────────────────────────────────────────────────────
const RosterCard = ({ talent, index }: { talent: Talent; index: number }) => {
    const initials = talent.name.split(' ').map(w => w[0]).join('').slice(0, 2);

    return (
        <Link to={`/talent/${talent.id}`}>
            <motion.div
                className="group relative block overflow-hidden rounded-lg"
                style={{ border: '1px solid rgba(212, 175, 55, 0.12)', backgroundColor: '#0A0A0A' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04, borderColor: 'rgba(212, 175, 55, 0.4)' }}
                whileTap={{ scale: 0.97 }}
            >
                {/* Square image — stretches to fill available space */}
                <div className="relative w-full pb-[100%] overflow-hidden">
                    {talent.headshot_url ? (
                        <img
                            src={talent.headshot_url}
                            alt={talent.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: '#111' }}
                        >
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold opacity-20" style={{ color: '#D4AF37' }}>
                                {initials}
                            </span>
                        </div>
                    )}
                    {/* No overlay — images already contain talent name graphics */}
                </div>
            </motion.div>
        </Link>
    );
};

// ─── Talent Roster Page ─────────────────────────────────────────────────────────
// Goal: fit all talent in ONE desktop viewport (no scroll needed)
const TalentRoster = () => {
    const { data: talents, isLoading } = useTalents();
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!headingRef.current) return;
        gsap.fromTo(headingRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
        );
    }, []);

    // Dynamically choose column count to fit all talent in viewport
    // For desktop: use more columns to compress grid so it fits in one screen
    const count = talents?.length || 0;
    let gridClass = 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    if (count > 24) gridClass = 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10';
    else if (count > 16) gridClass = 'grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8';
    else if (count > 12) gridClass = 'grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7';

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0A0A0A' }}>
            <Navigation />

            {/* Main content — uses flex-1 + viewport height calculation to maximize grid space */}
            <main className="flex-1 flex flex-col pt-20 pb-4 px-4">
                <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col">
                    {/* Heading — compact */}
                    <div className="text-center mb-4 md:mb-6">
                        <h1
                            ref={headingRef}
                            className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider"
                            style={{ color: '#D4AF37' }}
                        >
                            Talent Roster
                        </h1>
                        <div className="w-12 h-[2px] mx-auto mt-2" style={{ backgroundColor: '#D4AF37' }} />
                    </div>

                    {isLoading ? (
                        <div className={`grid ${gridClass} gap-2 sm:gap-3`}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="pb-[100%] rounded-lg animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
                            ))}
                        </div>
                    ) : talents && talents.length > 0 ? (
                        <div className={`grid ${gridClass} gap-2 sm:gap-3 flex-1`}>
                            {talents.map((talent, i) => (
                                <RosterCard key={talent.id} talent={talent} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 flex-1 flex items-center justify-center">
                            <div>
                                <div
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                                    style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                                >
                                    <span className="text-2xl" style={{ color: '#D4AF37' }}>★</span>
                                </div>
                                <h3 className="text-lg font-bold mb-1" style={{ color: '#ffffff' }}>
                                    Roster Coming Soon
                                </h3>
                                <p className="text-sm" style={{ color: '#888' }}>
                                    Our talent roster is being curated.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TalentRoster;
