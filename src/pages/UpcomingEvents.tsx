import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { Calendar, MapPin, ExternalLink, Loader2 } from "lucide-react";

const UpcomingEvents = () => {
    const { data: events, isLoading } = useUpcomingEvents(true);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1
                            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            Upcoming Events
                        </h1>
                        <div
                            className="w-24 h-1 mx-auto rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        />
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && (!events || events.length === 0) && (
                        <div className="text-center py-16">
                            <Calendar className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--text-muted)' }} />
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                No Upcoming Events
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Check back soon for new events!
                            </p>
                        </div>
                    )}

                    {/* Events Grid — mobile-first: 1 col → 2 col → 3 col */}
                    {events && events.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                                    style={{
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    {/* 1:1 Image */}
                                    <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                                        {event.image_url ? (
                                            <img
                                                src={event.image_url}
                                                alt={event.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center"
                                                style={{ backgroundColor: 'var(--bg-elevated)' }}
                                            >
                                                <Calendar className="h-12 w-12" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3
                                            className="font-bold text-base sm:text-lg mb-1 line-clamp-2"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {event.title}
                                        </h3>

                                        {event.description && (
                                            <p
                                                className="text-sm mb-3 line-clamp-2"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                {event.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {event.event_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric',
                                                    })}
                                                    {event.event_time && ` · ${event.event_time}`}
                                                </span>
                                            )}
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>

                                        {event.link_url && (
                                            <a
                                                href={event.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105"
                                                style={{
                                                    backgroundColor: 'var(--button-bg)',
                                                    color: 'var(--button-text)',
                                                }}
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Learn More
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UpcomingEvents;
