import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAboutContent, type ContentSection } from "@/hooks/useUpcomingEvents";

gsap.registerPlugin(ScrollTrigger);

// ─── Alternating Section Card ────────────────────────────────────────────────
const AboutSection = ({ section, index }: { section: ContentSection; index: number }) => {
    const isImageLeft = index % 2 === 0;

    return (
        <motion.div
            className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8"
            style={{ flexDirection: isImageLeft ? undefined : undefined }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            {/* Image side */}
            <motion.div
                className={`w-full md:w-[45%] flex-shrink-0 ${isImageLeft ? 'md:order-1' : 'md:order-2'}`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
            >
                {section.media_url ? (
                    <div
                        className="rounded-xl overflow-hidden h-full"
                        style={{ border: '1.5px solid rgba(212, 175, 55, 0.3)' }}
                    >
                        <img
                            src={section.media_url}
                            alt={section.title || ''}
                            className="w-full h-full object-cover"
                            style={{ minHeight: '280px', maxHeight: '420px' }}
                        />
                    </div>
                ) : (
                    <div
                        className="rounded-xl h-full flex items-center justify-center"
                        style={{
                            border: '1.5px dashed rgba(212, 175, 55, 0.2)',
                            backgroundColor: 'rgba(17, 17, 17, 0.5)',
                            minHeight: '280px',
                        }}
                    >
                        <span style={{ color: '#888' }}>No image</span>
                    </div>
                )}
            </motion.div>

            {/* Text side */}
            <div className={`w-full md:w-[55%] flex flex-col justify-center ${isImageLeft ? 'md:order-2' : 'md:order-1'}`}>
                {section.title && (
                    <h3
                        className="font-orbitron text-xl md:text-2xl font-bold tracking-wide mb-3"
                        style={{ color: '#D4AF37' }}
                    >
                        {section.title}
                    </h3>
                )}
                <div
                    className="rounded-xl p-6 sm:p-8"
                    style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
                >
                    <div className="prose prose-lg max-w-none leading-relaxed text-base sm:text-lg" style={{ color: '#cccccc' }}>
                        {section.content?.split('\n').map((para, i) => (
                            <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Owner Hero Section ──────────────────────────────────────────────────────
const OwnerHero = ({ section }: { section: ContentSection }) => (
    <motion.div
        className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
    >
        {/* Owner photo — left */}
        <motion.div
            className="w-full md:w-[40%] flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            {section.media_url ? (
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: '2px solid rgba(212, 175, 55, 0.4)' }}
                >
                    <img
                        src={section.media_url}
                        alt={section.title || 'Owner'}
                        className="w-full object-cover"
                        style={{ maxHeight: '500px' }}
                    />
                </div>
            ) : (
                <div
                    className="rounded-xl flex items-center justify-center"
                    style={{
                        border: '2px dashed rgba(212, 175, 55, 0.3)',
                        backgroundColor: 'rgba(17, 17, 17, 0.5)',
                        minHeight: '350px',
                    }}
                >
                    <span style={{ color: '#888' }}>Upload owner photo</span>
                </div>
            )}
        </motion.div>

        {/* Owner name + bio — right */}
        <div className="w-full md:w-[60%] flex flex-col justify-center">
            {section.title && (
                <h2
                    className="font-orbitron text-2xl md:text-3xl font-bold tracking-wider mb-4"
                    style={{ color: '#ffffff' }}
                >
                    {section.title}
                </h2>
            )}
            <div
                className="rounded-xl p-6 sm:p-8"
                style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
            >
                <div className="prose prose-lg max-w-none leading-relaxed text-base sm:text-lg" style={{ color: '#cccccc' }}>
                    {section.content?.split('\n').map((para, i) => (
                        <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
const About = () => {
    const { data: aboutContent } = useAboutContent();
    const headingRef = useRef<HTMLDivElement>(null);

    const pageTitle = aboutContent?.page_title || "About Encore Representation";
    const sections = Array.isArray(aboutContent?.sections) ? aboutContent.sections : [];

    // Separate owner-hero from the rest
    const ownerHero = sections.find(s => s.type === 'owner-hero');
    const contentSections = sections.filter(s => s.type !== 'owner-hero');

    useEffect(() => {
        if (!headingRef.current) return;
        gsap.fromTo(headingRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Page Heading */}
                    <div ref={headingRef} className="text-center mb-12">
                        <h1
                            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                            style={{ color: '#D4AF37' }}
                        >
                            {pageTitle}
                        </h1>
                        <div className="w-16 h-[2px] mx-auto" style={{ backgroundColor: '#D4AF37' }} />
                    </div>

                    {/* Owner Hero (always first if present) */}
                    {ownerHero && (
                        <div className="mb-16">
                            <OwnerHero section={ownerHero} />
                        </div>
                    )}

                    {/* Alternating content sections */}
                    <div className="space-y-16">
                        {contentSections.map((section, idx) => (
                            <AboutSection key={section.id || idx} section={section} index={idx} />
                        ))}
                    </div>

                    {/* Empty state if no sections at all */}
                    {!ownerHero && contentSections.length === 0 && (
                        <div className="text-center py-20">
                            <p style={{ color: '#888' }}>
                                No content yet. Add sections in the Admin panel.
                            </p>
                        </div>
                    )}

                    {/* CTA */}
                    <motion.div
                        className="text-center mt-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.a
                            href="/book"
                            className="inline-block px-8 py-3 text-sm font-bold rounded-lg"
                            style={{ backgroundColor: '#D4AF37', color: '#000000' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Book Talent →
                        </motion.a>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
