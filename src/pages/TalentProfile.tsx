import { useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useTalent } from "@/hooks/useData";
import { ArrowLeft, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TalentProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { data: talent, isLoading } = useTalent(id || '');
    const nameRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!nameRef.current || !talent) return;
        gsap.fromTo(nameRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 }
        );
    }, [talent]);

    if (isLoading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Navigation />
                <div className="pt-24 px-4 max-w-5xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 rounded mb-6" style={{ backgroundColor: 'var(--skeleton)' }} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="pb-[100%] rounded-xl" style={{ backgroundColor: 'var(--skeleton)' }} />
                            <div className="space-y-4">
                                <div className="h-10 rounded w-3/4" style={{ backgroundColor: 'var(--skeleton)' }} />
                                <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--skeleton)' }} />
                                <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--skeleton)' }} />
                                <div className="h-4 rounded w-2/3" style={{ backgroundColor: 'var(--skeleton)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!talent) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Navigation />
                <div className="pt-24 px-4 max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Talent Not Found</h1>
                    <Link to="/" className="font-medium" style={{ color: 'var(--accent)' }}>← Back to Roster</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const displayName = `${talent.first_name} ${talent.last_name}`;
    const roles = talent.talent_roles || [];
    const images = talent.talent_images || [];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Back link */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Roster
                        </Link>
                    </motion.div>

                    {/* Profile Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        {/* Headshot */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div
                                className="relative w-full pb-[100%] rounded-xl overflow-hidden"
                                style={{
                                    border: '2px solid var(--border)',
                                    boxShadow: '0 8px 32px var(--shadow)',
                                }}
                            >
                                {talent.headshot_url ? (
                                    <img
                                        src={talent.headshot_url}
                                        alt={displayName}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ backgroundColor: 'var(--bg-elevated)' }}
                                    >
                                        <span className="text-6xl font-bold opacity-30" style={{ color: 'var(--accent)' }}>
                                            {talent.first_name[0]}{talent.last_name[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Info */}
                        <div>
                            <h1
                                ref={nameRef}
                                className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider mb-2"
                                style={{ color: 'var(--accent)', opacity: 0 }}
                            >
                                {displayName}
                            </h1>

                            {/* Roles */}
                            {roles.length > 0 && (
                                <motion.div
                                    className="mb-6"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
                                        Characters / Roles
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((role, i) => (
                                            <motion.div
                                                key={role.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                                                style={{
                                                    backgroundColor: 'var(--badge-bg)',
                                                    border: '1px solid var(--badge-border)',
                                                    color: 'var(--badge-text)',
                                                }}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                                            >
                                                <Star className="h-3 w-3" />
                                                <span className="font-medium">{role.character_name}</span>
                                                {role.show_name && (
                                                    <span style={{ color: 'var(--text-muted)' }}>— {role.show_name}</span>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Bio */}
                            {talent.bio && (
                                <motion.div
                                    className="mb-6"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                >
                                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>Biography</h2>
                                    <div
                                        className="prose prose-sm max-w-none leading-relaxed"
                                        style={{ color: 'var(--text-secondary)' }}
                                        dangerouslySetInnerHTML={{ __html: talent.bio }}
                                    />
                                </motion.div>
                            )}

                            {/* Book CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="inline-block"
                                >
                                    <Link
                                        to="/book"
                                        className="inline-block px-8 py-3 text-sm font-bold rounded-lg mt-2"
                                        style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                                    >
                                        Book {talent.first_name} →
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    {images.length > 0 && (
                        <motion.section
                            className="mt-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2
                                className="font-orbitron text-xl sm:text-2xl font-bold tracking-wider mb-6"
                                style={{ color: 'var(--accent)' }}
                            >
                                Gallery
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {images.map((img, i) => (
                                    <motion.div
                                        key={img.id}
                                        className="relative pb-[100%] rounded-lg overflow-hidden"
                                        style={{ border: '1px solid var(--border)' }}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                        whileHover={{ scale: 1.03 }}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt={img.caption || displayName}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            loading="lazy"
                                        />
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
