import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAboutContent } from "@/hooks/useUpcomingEvents";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const { data: aboutContent } = useAboutContent();
    const headingRef = useRef<HTMLDivElement>(null);

    const pageTitle = aboutContent?.page_title || "About Encore Representation";
    const pageDescription = aboutContent?.page_description || "";
    const heroImage = aboutContent?.hero_image_url || "";
    const sections = Array.isArray(aboutContent?.sections) ? aboutContent.sections : [];

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
                <div className="max-w-4xl mx-auto">
                    {/* Heading */}
                    <div ref={headingRef} className="text-center mb-8">
                        <h1
                            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            {pageTitle}
                        </h1>
                        <div className="w-16 h-[2px] mx-auto" style={{ backgroundColor: 'var(--accent)' }} />
                    </div>

                    {/* Hero Image */}
                    {heroImage && (
                        <motion.div
                            className="mb-8 rounded-xl overflow-hidden"
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <img src={heroImage} alt={pageTitle} className="w-full max-h-[400px] object-cover" />
                        </motion.div>
                    )}

                    {/* Page description */}
                    {pageDescription && (
                        <motion.div
                            className="rounded-xl p-6 sm:p-8 mb-8"
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="prose prose-lg max-w-none leading-relaxed text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
                                {pageDescription.split('\n').map((para, i) => (
                                    <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Dynamic Sections */}
                    {sections.map((section, idx) => (
                        <motion.div
                            key={section.id || idx}
                            className="mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                        >
                            {section.type === 'text' && section.content && (
                                <div
                                    className="rounded-xl p-6 sm:p-8"
                                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                                >
                                    <div className="prose prose-lg max-w-none leading-relaxed text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
                                        {section.content.split('\n').map((para: string, i: number) => (
                                            <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {section.type === 'image' && section.media_url && (
                                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                                    <img src={section.media_url} alt={section.content || ''} className="w-full object-cover" />
                                    {section.content && (
                                        <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
                                            {section.content}
                                        </p>
                                    )}
                                </div>
                            )}

                            {section.type === 'video' && section.media_url && (
                                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                                    <video src={section.media_url} className="w-full" controls playsInline preload="metadata" />
                                    {section.content && (
                                        <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
                                            {section.content}
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* CTA */}
                    <motion.div
                        className="text-center mt-10"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.a
                            href="/book"
                            className="inline-block px-8 py-3 text-sm font-bold rounded-lg"
                            style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
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
