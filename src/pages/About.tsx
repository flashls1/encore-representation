import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAboutContent } from "@/hooks/useUpcomingEvents";
import { Loader2 } from "lucide-react";

const About = () => {
    const { data: aboutContent, isLoading } = useAboutContent();

    const pageTitle = aboutContent?.page_title || "About Encore Representation";
    const pageDescription = aboutContent?.page_description || "";
    const heroImage = aboutContent?.hero_image_url || "";
    const sections = Array.isArray(aboutContent?.sections) ? aboutContent.sections : [];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero heading */}
                    <div className="text-center mb-8">
                        <h1
                            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            {pageTitle}
                        </h1>
                        <div
                            className="w-24 h-1 mx-auto rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        />
                    </div>

                    {/* Hero Image */}
                    {heroImage && (
                        <div className="mb-8 rounded-xl overflow-hidden">
                            <img src={heroImage} alt={pageTitle} className="w-full max-h-[400px] object-cover" />
                        </div>
                    )}

                    {/* Page description */}
                    {pageDescription && (
                        <div
                            className="rounded-xl p-6 sm:p-8 mb-8"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            <div
                                className="prose prose-lg max-w-none leading-relaxed text-base sm:text-lg"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {pageDescription.split('\n').map((para, i) => (
                                    <p key={i} className={i > 0 ? 'mt-4' : ''}>
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dynamic Sections */}
                    {sections.map((section, idx) => (
                        <div key={section.id || idx} className="mb-6">
                            {section.type === 'text' && section.content && (
                                <div
                                    className="rounded-xl p-6 sm:p-8"
                                    style={{
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    <div
                                        className="prose prose-lg max-w-none leading-relaxed text-base sm:text-lg"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        {section.content.split('\n').map((para: string, i: number) => (
                                            <p key={i} className={i > 0 ? 'mt-4' : ''}>
                                                {para}
                                            </p>
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
                                    <video
                                        src={section.media_url}
                                        className="w-full"
                                        controls
                                        playsInline
                                        preload="metadata"
                                    />
                                    {section.content && (
                                        <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
                                            {section.content}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* CTA */}
                    <div className="text-center mt-10">
                        <a
                            href="/book"
                            className="inline-block px-8 py-3 text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                            style={{
                                backgroundColor: 'var(--button-bg)',
                                color: 'var(--button-text)',
                            }}
                        >
                            Book Talent →
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
