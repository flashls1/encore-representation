import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useHomeContent } from "@/hooks/useData";

const About = () => {
    const { data: homeContent } = useHomeContent();

    const aboutTitle = homeContent?.about_title || "About Encore Representation";
    const aboutDescription = homeContent?.about_description ||
        "Encore Representation is a premier talent representation agency dedicated to connecting exceptional talent with extraordinary opportunities. Our team works tirelessly to ensure each client receives personalized attention and strategic career guidance.";

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero heading */}
                    <div className="text-center mb-12">
                        <h1
                            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            {aboutTitle}
                        </h1>
                        <div
                            className="w-24 h-1 mx-auto rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        />
                    </div>

                    {/* Body */}
                    <div
                        className="rounded-xl p-6 sm:p-8 md:p-10"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        <div
                            className="prose prose-lg max-w-none leading-relaxed text-base sm:text-lg"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {aboutDescription.split('\n').map((para, i) => (
                                <p key={i} className={i > 0 ? 'mt-4' : ''}>
                                    {para}
                                </p>
                            ))}
                        </div>
                    </div>

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
