import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBookContent } from "@/hooks/useUpcomingEvents";
import { useSiteSettings } from "@/hooks/useData";
import { Mail, Phone, ExternalLink, Loader2 } from "lucide-react";

const BookNow = () => {
    const { data: bookContent, isLoading } = useBookContent();
    const { data: settings } = useSiteSettings();

    const pageTitle = bookContent?.page_title || "Book Talent";
    const pageDescription = bookContent?.page_description || "";
    const heroImage = bookContent?.hero_image_url || "";
    const sections = Array.isArray(bookContent?.sections) ? bookContent.sections : [];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1
                            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            {pageTitle}
                        </h1>
                        <div
                            className="w-24 h-1 mx-auto rounded-full mb-6"
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
                        <p
                            className="text-base sm:text-lg mb-8 max-w-xl mx-auto text-center"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {pageDescription}
                        </p>
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
                                    <video src={section.media_url} className="w-full" controls playsInline preload="metadata" />
                                    {section.content && (
                                        <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
                                            {section.content}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {settings?.contact_email && (
                            <a
                                href={`mailto:${settings.contact_email}`}
                                className="flex items-center gap-3 p-5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: 'var(--badge-bg)' }}
                                >
                                    <Mail className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Email Us</p>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{settings.contact_email}</p>
                                </div>
                            </a>
                        )}

                        {settings?.contact_phone && (
                            <a
                                href={`tel:${settings.contact_phone}`}
                                className="flex items-center gap-3 p-5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: 'var(--badge-bg)' }}
                                >
                                    <Phone className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Call Us</p>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{settings.contact_phone}</p>
                                </div>
                            </a>
                        )}
                    </div>

                    {/* Full contact form CTA */}
                    <div className="text-center">
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                            style={{
                                backgroundColor: 'var(--button-bg)',
                                color: 'var(--button-text)',
                            }}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Send Us a Message
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookNow;
