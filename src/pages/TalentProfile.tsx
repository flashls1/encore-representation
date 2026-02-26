import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useTalent } from "@/hooks/useData";
import { ArrowLeft, Star } from "lucide-react";

const TalentProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { data: talent, isLoading } = useTalent(id || '');

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
                    <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Talent Not Found
                    </h1>
                    <Link to="/" className="font-medium" style={{ color: 'var(--accent)' }}>
                        ← Back to Roster
                    </Link>
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

                    {/* Profile Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        {/* Headshot */}
                        <div>
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
                                        <span
                                            className="text-6xl font-bold opacity-30"
                                            style={{ color: 'var(--accent)' }}
                                        >
                                            {talent.first_name[0]}{talent.last_name[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <h1
                                className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider mb-2"
                                style={{ color: 'var(--accent)' }}
                            >
                                {displayName}
                            </h1>

                            {/* Roles/Characters */}
                            {roles.length > 0 && (
                                <div className="mb-6">
                                    <h2
                                        className="text-sm font-bold uppercase tracking-wider mb-3"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        Characters / Roles
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                                                style={{
                                                    backgroundColor: 'var(--badge-bg)',
                                                    border: '1px solid var(--badge-border)',
                                                    color: 'var(--badge-text)',
                                                }}
                                            >
                                                <Star className="h-3 w-3" />
                                                <span className="font-medium">{role.character_name}</span>
                                                {role.show_name && (
                                                    <span style={{ color: 'var(--text-muted)' }}>— {role.show_name}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bio */}
                            {talent.bio && (
                                <div className="mb-6">
                                    <h2
                                        className="text-sm font-bold uppercase tracking-wider mb-3"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        Biography
                                    </h2>
                                    <div
                                        className="prose prose-sm max-w-none leading-relaxed"
                                        style={{ color: 'var(--text-secondary)' }}
                                        dangerouslySetInnerHTML={{ __html: talent.bio }}
                                    />
                                </div>
                            )}

                            {/* Book CTA */}
                            <Link
                                to="/book"
                                className="inline-block px-8 py-3 text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105 mt-2"
                                style={{
                                    backgroundColor: 'var(--button-bg)',
                                    color: 'var(--button-text)',
                                }}
                            >
                                Book {talent.first_name} →
                            </Link>
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    {images.length > 0 && (
                        <section className="mt-12">
                            <h2
                                className="font-orbitron text-xl sm:text-2xl font-bold tracking-wider mb-6"
                                style={{ color: 'var(--accent)' }}
                            >
                                Gallery
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative pb-[100%] rounded-lg overflow-hidden"
                                        style={{ border: '1px solid var(--border)' }}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt={img.caption || displayName}
                                            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TalentProfile;
