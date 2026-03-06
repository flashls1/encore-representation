import { useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useTalent } from "@/hooks/useData";
import { ArrowLeft, Star, Mic, Film, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── Role Card (for voice actors) ────────────────────────────────────────────
const RoleCard = ({ role, index }: { role: any; index: number }) => (
    <motion.div
        className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3"
        style={{
            backgroundColor: 'rgba(212, 175, 55, 0.04)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
        }}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
        whileHover={{
            borderColor: 'rgba(212, 175, 55, 0.4)',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
        }}
    >
        <div className="flex items-center gap-2.5">
            {/* Left: Mic icon */}
            <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.12)' }}
            >
                <Mic className="h-3.5 w-3.5" style={{ color: '#D4AF37' }} />
            </div>

            {/* Center: Character info */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm sm:text-base leading-tight" style={{ color: '#ffffff' }}>
                    {role.character_name}
                </p>
                {role.role_name && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>
                        {role.role_name}
                    </p>
                )}
            </div>

            {/* Right: Optional character image — 1:1 square, rounded, gold border */}
            {role.image_url && (
                <img
                    src={role.image_url}
                    alt={role.character_name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                    style={{ border: '1.5px solid rgba(212, 175, 55, 0.35)' }}
                />
            )}
        </div>
    </motion.div>
);

// ─── Main TalentProfile Page ─────────────────────────────────────────────────
const TalentProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { data: talent, isLoading } = useTalent(id || '');
    const nameRef = useRef<HTMLHeadingElement>(null);
    const bioRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!nameRef.current || !talent) return;
        gsap.fromTo(nameRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 }
        );
    }, [talent]);

    useEffect(() => {
        if (!bioRef.current || !talent) return;
        gsap.fromTo(bioRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.4 }
        );
    }, [talent]);

    if (isLoading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
                <Navigation />
                <div className="pt-24 px-4 max-w-5xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 rounded mb-6" style={{ backgroundColor: '#1a1a1a' }} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="pb-[100%] rounded-xl" style={{ backgroundColor: '#1a1a1a' }} />
                            <div className="space-y-4">
                                <div className="h-10 rounded w-3/4" style={{ backgroundColor: '#1a1a1a' }} />
                                <div className="h-4 rounded w-full" style={{ backgroundColor: '#1a1a1a' }} />
                                <div className="h-4 rounded w-full" style={{ backgroundColor: '#1a1a1a' }} />
                                <div className="h-4 rounded w-2/3" style={{ backgroundColor: '#1a1a1a' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!talent) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
                <Navigation />
                <div className="pt-24 px-4 max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Talent Not Found</h1>
                    <Link to="/" className="font-medium" style={{ color: '#D4AF37' }}>← Back to Roster</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const roles = talent.talent_roles || [];
    const images = talent.talent_images || [];
    const initials = talent.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    const firstName = talent.name.split(' ')[0] || talent.name;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Back link */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
                            style={{ color: '#888' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Roster
                        </Link>
                    </motion.div>

                    {/* ─── Hero Section: Banner + Name ─────────────────────────────── */}
                    <motion.div
                        className="flex justify-center mb-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {talent.headshot_url ? (
                            <div
                                className="inline-block rounded-xl overflow-hidden"
                                style={{ border: '2px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 8px 40px rgba(212, 175, 55, 0.08)', maxWidth: '100%' }}
                            >
                                <img
                                    src={talent.headshot_url}
                                    alt={talent.name}
                                    className="block"
                                    style={{ maxWidth: '100%', maxHeight: '500px', width: 'auto', height: 'auto' }}
                                />
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-center rounded-xl"
                                style={{
                                    width: '500px', height: '300px',
                                    backgroundColor: '#111',
                                    border: '2px solid #222',
                                }}
                            >
                                <span className="text-6xl font-bold opacity-30" style={{ color: '#D4AF37' }}>{initials}</span>
                            </div>
                        )}
                    </motion.div>

                    <h1
                        ref={nameRef}
                        className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-2 text-center"
                        style={{ color: '#D4AF37', opacity: 0 }}
                    >
                        {talent.name}
                    </h1>

                    {/* Thin accent divider */}
                    <div className="w-12 h-[2px] mx-auto mb-10" style={{ backgroundColor: '#D4AF37' }} />

                    {/* ─── Roles / Characters Section ─────────────────────────────── */}
                    {roles.length > 0 && (
                        <motion.section
                            className="mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <Star className="h-4 w-4" style={{ color: '#D4AF37' }} />
                                <h2
                                    className="font-orbitron text-lg sm:text-xl font-bold uppercase tracking-wider"
                                    style={{ color: '#D4AF37' }}
                                >
                                    Notable Roles & Characters
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {roles.map((role, i) => (
                                    <RoleCard key={role.id} role={role} index={i} />
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* ─── Biography Section ──────────────────────────────────────── */}
                    {talent.bio && (
                        <motion.section
                            ref={bioRef}
                            className="mb-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <Sparkles className="h-4 w-4" style={{ color: '#D4AF37' }} />
                                <h2
                                    className="font-orbitron text-lg sm:text-xl font-bold uppercase tracking-wider"
                                    style={{ color: '#D4AF37' }}
                                >
                                    Biography
                                </h2>
                            </div>
                            <div
                                className="rounded-xl p-6 sm:p-8 md:p-10"
                                style={{
                                    backgroundColor: '#111111',
                                    border: '1px solid #222',
                                }}
                            >
                                <div
                                    className="prose prose-lg max-w-none leading-relaxed"
                                    style={{
                                        color: '#cccccc',
                                        fontSize: '1.05rem',
                                        lineHeight: '1.8',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: talent.bio }}
                                />
                            </div>
                        </motion.section>
                    )}

                    {/* ─── Book CTA ───────────────────────────────────────────────── */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                            <Link
                                to="/booking"
                                className="inline-block px-10 py-3.5 text-sm font-bold rounded-lg tracking-wide uppercase"
                                style={{ backgroundColor: '#D4AF37', color: '#0A0A0A' }}
                            >
                                Book {firstName} →
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* ─── Photo Gallery ───────────────────────────────────────────── */}
                    {images.length > 0 && (
                        <motion.section
                            className="mt-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Film className="h-4 w-4" style={{ color: '#D4AF37' }} />
                                <h2
                                    className="font-orbitron text-lg sm:text-xl font-bold uppercase tracking-wider"
                                    style={{ color: '#D4AF37' }}
                                >
                                    Gallery
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {images.map((img, i) => (
                                    <motion.div
                                        key={img.id}
                                        className="relative pb-[100%] rounded-lg overflow-hidden"
                                        style={{ border: '1px solid rgba(212, 175, 55, 0.15)' }}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                        whileHover={{ scale: 1.03 }}
                                    >
                                        <img src={img.image_url} alt={img.caption || talent.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TalentProfile;
