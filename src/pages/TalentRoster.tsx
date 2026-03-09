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
                style={{ border: '1.5px solid #D4AF37', backgroundColor: '#0A0A0A' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04, borderColor: 'rgba(212, 175, 55, 0.4)' }}
                whileTap={{ scale: 0.97 }}
            >
                {/* Image — natural size, border hugs the image directly */}
                {talent.headshot_url ? (
                    <img
                        src={talent.headshot_url}
                        alt={talent.name}
                        className="block w-full h-auto transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="flex items-center justify-center"
                        style={{ backgroundColor: '#111', aspectRatio: '5 / 3' }}
                    >
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold opacity-20" style={{ color: '#D4AF37' }}>
                            {initials}
                        </span>
                    </div>
                )}
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

    // Dynamic column count for banner-shaped (5:3) images
    // More columns = smaller cards = more fit on one viewport
    const count = talents?.length || 0;
    let gridClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4';
    if (count > 16) gridClass = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    else if (count > 12) gridClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    else if (count > 8) gridClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4';

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
                        <div className={`grid ${gridClass} gap-2`}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="rounded-lg animate-pulse h-28 md:h-36" style={{ backgroundColor: '#1a1a1a' }} />
                            ))}
                        </div>
                    ) : talents && talents.length > 0 ? (
                        <div className={`grid ${gridClass} gap-2 flex-1`}>
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
