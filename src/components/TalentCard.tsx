import { Link } from "react-router-dom";
import type { Talent } from "@/types/database";

interface TalentCardProps {
    talent: Talent;
}

const TalentCard = ({ talent }: TalentCardProps) => {
    const displayName = `${talent.first_name} ${talent.last_name}`;
    const topRoles = talent.talent_roles?.slice(0, 2) || [];

    return (
        <Link
            to={`/talent/${talent.id}`}
            className="group relative block overflow-hidden rounded-xl transition-all duration-300"
            style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-card)',
            }}
        >
            {/* 1:1 Aspect Ratio Container */}
            <div className="relative w-full pb-[100%] overflow-hidden">
                {talent.headshot_url ? (
                    <img
                        src={talent.headshot_url}
                        alt={displayName}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--bg-elevated)' }}
                    >
                        <span
                            className="text-4xl font-bold opacity-30"
                            style={{ color: 'var(--accent)' }}
                        >
                            {talent.first_name[0]}{talent.last_name[0]}
                        </span>
                    </div>
                )}

                {/* Gradient overlay — always visible on mobile, hover on desktop */}
                <div
                    className="absolute inset-0 transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
                    }}
                />

                {/* Name overlay — always visible on mobile, hover on desktop */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300 md:opacity-0 md:group-hover:opacity-100">
                    <h3
                        className="font-bold text-sm sm:text-base leading-tight"
                        style={{ color: '#ffffff' }}
                    >
                        {displayName}
                    </h3>
                    {topRoles.length > 0 && (
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--accent)' }}>
                            {topRoles.map(r => r.character_name).join(' • ')}
                        </p>
                    )}
                </div>
            </div>

            {/* Desktop: Name below card (hidden on hover since overlay shows) */}
            <div
                className="hidden md:block md:group-hover:hidden p-3"
                style={{ borderTop: '1px solid var(--border)' }}
            >
                <h3
                    className="font-semibold text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {displayName}
                </h3>
                {topRoles.length > 0 && (
                    <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {topRoles.map(r => r.character_name).join(' • ')}
                    </p>
                )}
            </div>
        </Link>
    );
};

export default TalentCard;
