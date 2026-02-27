import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useHomeContent, useSiteSettings } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";

// ─── Hero background: video (if set) or image fallback ────────────────────────
const HeroBackground = ({
  videoUrl,
  imageUrl,
}: {
  videoUrl: string | null | undefined;
  imageUrl: string;
}) => (
  <div className="absolute inset-0 z-0">
    {videoUrl ? (
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = 'none';
        }}
      />
    ) : imageUrl ? (
      <img
        src={imageUrl}
        alt="Encore Representation"
        className="w-full h-full object-cover"
        loading="eager"
      />
    ) : null}
    {/* Dark overlay */}
    <div
      className="absolute inset-0"
      style={{ background: 'rgba(0, 0, 0, 0.55)' }}
    />
    {/* Gradient fade to page background */}
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(to bottom, transparent 60%, var(--bg-primary))` }}
    />
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────
const HeroSection = () => {
  const { data: homeContent, isLoading: homeLoading, refetch } = useHomeContent();
  const { data: siteSettings } = useSiteSettings();

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('home_content_hero')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'home_content' },
        () => refetch()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  // Don't render while loading
  const heroImage = homeLoading ? '' : (homeContent?.hero_image_url || '');
  const heroVideoUrl = homeLoading ? null : (homeContent?.hero_video_url || null);

  // Auto-detect: if hero_image_url is actually a video, treat it as video
  const isImageAVideo = heroImage && /\.(mp4|webm|mov)(\?|$)/i.test(heroImage);
  const effectiveVideoUrl = heroVideoUrl || (isImageAVideo ? heroImage : null);
  const effectiveImageUrl = isImageAVideo ? '' : heroImage;


  const heroTitle = homeContent?.hero_title || "ENCORE REPRESENTATION";
  const heroSubtitle = homeContent?.hero_subtitle || "Premier Talent Representation";
  const ctaPrimaryText = homeContent?.cta_primary_text;
  const ctaPrimaryUrl = homeContent?.cta_primary_url;
  const ctaSecondaryText = homeContent?.cta_secondary_text;
  const ctaSecondaryUrl = homeContent?.cta_secondary_url;

  const isInternalUrl = (url: string) => url.startsWith('/') || url.startsWith('#');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroBackground videoUrl={effectiveVideoUrl} imageUrl={effectiveImageUrl} />

      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl animate-float opacity-20"
          style={{ background: 'var(--accent)', top: '10%', left: '10%' }}
        />
        <div
          className="absolute w-48 h-48 rounded-full blur-3xl animate-float opacity-15"
          style={{ background: 'var(--accent-muted)', bottom: '20%', right: '15%', animationDelay: '1.5s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          {/* Title */}
          <h1
            className="font-orbitron text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 tracking-wider font-bold"
            style={{
              color: 'var(--accent)',
              textShadow: '0 0 40px var(--glow), 3px 3px 0 rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8)',
            }}
          >
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <div
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
            style={{
              color: 'rgba(255, 255, 255, 0.92)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 3px rgba(0, 0, 0, 0.6)',
            }}
          >
            {heroSubtitle.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            {ctaPrimaryText && ctaPrimaryUrl && (
              isInternalUrl(ctaPrimaryUrl) ? (
                <Link
                  to={ctaPrimaryUrl}
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 glow-accent inline-block"
                  style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                >
                  {ctaPrimaryText}
                </Link>
              ) : (
                <a
                  href={ctaPrimaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 glow-accent inline-block"
                  style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                >
                  {ctaPrimaryText}
                </a>
              )
            )}

            {ctaSecondaryText && ctaSecondaryUrl && (
              isInternalUrl(ctaSecondaryUrl) ? (
                <Link
                  to={ctaSecondaryUrl}
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 inline-block"
                  style={{
                    border: '2px solid var(--accent)',
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {ctaSecondaryText}
                </Link>
              ) : (
                <a
                  href={ctaSecondaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 inline-block"
                  style={{
                    border: '2px solid var(--accent)',
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {ctaSecondaryText}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 rounded-full flex justify-center" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
            <div className="w-1 h-3 rounded-full mt-2" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
