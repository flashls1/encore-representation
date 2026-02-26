import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useData";
import { Mail, Phone, ExternalLink } from "lucide-react";

const BookNow = () => {
    const { data: settings } = useSiteSettings();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Heading */}
                    <h1
                        className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                        style={{ color: 'var(--accent)' }}
                    >
                        Book Talent
                    </h1>
                    <div
                        className="w-24 h-1 mx-auto rounded-full mb-8"
                        style={{ backgroundColor: 'var(--accent)' }}
                    />

                    <p
                        className="text-lg mb-10 max-w-xl mx-auto"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Interested in booking one of our talented clients? Reach out to us and we'll connect you with the perfect talent for your project.
                    </p>

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
            </main>

            <Footer />
        </div>
    );
};

export default BookNow;
