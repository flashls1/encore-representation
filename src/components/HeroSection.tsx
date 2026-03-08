import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useHomeContent, useSiteSettings } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";

// ─── Kinetic gold flare background ──────────────────────────────────────────────
const KineticFlares = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
    {/* Large slow-moving primary flare */}
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12]"
      style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)', top: '-10%', left: '-5%' }}
      animate={{ x: [0, 80, -40, 0], y: [0, 50, -30, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Secondary muted flare */}
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.08]"
      style={{ background: 'radial-gradient(circle, #C5A059 0%, transparent 70%)', bottom: '5%', right: '-5%' }}
      animate={{ x: [0, -60, 30, 0], y: [0, -40, 60, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
    />
    {/* Subtle center pulse */}
    <motion.div
      className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.06]"
      style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.1, 0.06] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

// ─── Hero background: video or image ──────────────────────────────────────────
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
        className="w-full h-full object-contain md:object-cover"
        style={{ backgroundColor: '#0A0A0A' }}
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = 'none';
        }}
      />
    ) : imageUrl ? (
      <img
        src={imageUrl}
        alt="Encore Representation"
        className="w-full h-full object-contain md:object-cover"
        style={{ backgroundColor: '#0A0A0A' }}
        loading="eager"
      />
    ) : null}
    {/* Dark overlay */}
    <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.55)' }} />
    {/* Gradient fade to page background */}
    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 60%, var(--bg-primary))` }} />
  </div>
);

// ─── GSAP staggered text reveal ─────────────────────────────────────────────
const RevealText = ({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const letters = containerRef.current.querySelectorAll('.reveal-letter');
    gsap.fromTo(letters,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.04,
        delay: 0.3,
      }
    );
  }, [text]);

  // Split text into words, then letters — preserving spaces between words
  const words = text.split(' ');

  return (
    <h1 ref={containerRef} className={className} style={style}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split('').map((char, ci) => (
            <span key={ci} className="inline-block overflow-hidden">
              <span className="reveal-letter inline-block">{char}</span>
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const HeroSection = () => {
  const { data: homeContent, isLoading: homeLoading, refetch } = useHomeContent();
  const { data: siteSettings } = useSiteSettings();
  const subtitleRef = useRef<HTMLDivElement>(null);

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

  // Animate subtitle after title
  useEffect(() => {
    if (!subtitleRef.current) return;
    gsap.fromTo(subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 1.0 }
    );
  }, [homeContent]);

  const heroImage = homeLoading ? '' : (homeContent?.hero_image_url || '');
  const heroVideoUrl = homeLoading ? null : (homeContent?.hero_video_url || null);
  const isImageAVideo = heroImage && /\.(mp4|webm|mov)(\?|$)/i.test(heroImage);
  const effectiveVideoUrl = heroVideoUrl || (isImageAVideo ? heroImage : null);
  const effectiveImageUrl = isImageAVideo ? '' : heroImage;

  const heroTitle = homeContent?.hero_title || "ENCORE REPRESENTATION";
  const heroSubtitle = homeContent?.hero_subtitle || "Premier Talent Representation";
  const heroTextVisible = homeContent?.hero_text_visible ?? true;
  const ctaOffsetTop = parseInt(homeContent?.cta_offset_top || '0') || 0;
  const ctaPrimaryText = homeContent?.cta_primary_text;
  const ctaPrimaryUrl = homeContent?.cta_primary_url;
  const ctaSecondaryText = homeContent?.cta_secondary_text;
  const ctaSecondaryUrl = homeContent?.cta_secondary_url;

  const isInternalUrl = (url: string) => url.startsWith('/') || url.startsWith('#');

  const ctaMotion = {
    whileHover: { scale: 1.06 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  };

  return (
    <section className="relative md:min-h-screen flex items-start md:items-center justify-center overflow-hidden pt-16 md:pt-0">
      {/* Desktop: full bleed background */}
      <div className="hidden md:block">
        <HeroBackground videoUrl={effectiveVideoUrl} imageUrl={effectiveImageUrl} />
        <KineticFlares />
      </div>

      {/* Mobile: bordered hero container */}
      <div className="md:hidden w-full px-3 pt-2">
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ border: '1.5px solid #D4AF37', aspectRatio: '16/9' }}
        >
          {effectiveVideoUrl ? (
            <video
              src={effectiveVideoUrl}
              autoPlay muted loop playsInline
              className="w-full h-full object-contain"
              style={{ backgroundColor: '#0A0A0A' }}
              onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
            />
          ) : effectiveImageUrl ? (
            <img
              src={effectiveImageUrl}
              alt="Encore Representation"
              className="w-full h-full object-contain"
              style={{ backgroundColor: '#0A0A0A' }}
              loading="eager"
            />
          ) : null}
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.45)' }} />
          {/* Bottom gradient */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.9))' }} />

          {/* Mobile text overlay — positioned at bottom of video */}
          {heroTextVisible && (
            <div className="absolute bottom-3 left-0 right-0 px-3 text-center z-10">
              <h1
                className="text-xl font-bold uppercase mb-1"
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  color: '#D4AF37',
                  letterSpacing: '0.06em',
                  textShadow: '0 0 20px rgba(212,175,55,0.4), 1px 1px 0 rgba(0,0,0,0.8)',
                }}
              >
                {heroTitle}
              </h1>
              <p
                className="text-xs font-medium leading-snug"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                }}
              >
                {heroSubtitle}
              </p>
            </div>
          )}
        </div>

        {/* Mobile CTA buttons — side by side below video */}
        <motion.div
          className="flex flex-row justify-center items-center gap-3 mt-5 mb-1 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {ctaPrimaryText && ctaPrimaryUrl && (
            isInternalUrl(ctaPrimaryUrl) ? (
              <Link
                to={ctaPrimaryUrl}
                className="px-5 py-2.5 text-sm font-bold rounded-lg glow-accent inline-block"
                style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
              >
                {ctaPrimaryText}
              </Link>
            ) : (
              <a
                href={ctaPrimaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-sm font-bold rounded-lg glow-accent inline-block"
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
                className="px-5 py-2.5 text-sm font-bold rounded-lg inline-block"
                style={{
                  border: '2px solid var(--accent)',
                  color: 'var(--accent)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                {ctaSecondaryText}
              </Link>
            ) : (
              <a
                href={ctaSecondaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-sm font-bold rounded-lg inline-block"
                style={{
                  border: '2px solid var(--accent)',
                  color: 'var(--accent)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                {ctaSecondaryText}
              </a>
            )
          )}
        </motion.div>
      </div>

      {/* Desktop content overlay — unchanged */}
      <div className="hidden md:block relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title — GSAP staggered reveal */}
        {heroTextVisible && (
          <RevealText
            text={heroTitle}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 font-bold uppercase"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              color: 'var(--accent)',
              letterSpacing: '0.08em',
              textShadow: '0 0 60px var(--glow), 2px 2px 0 rgba(0,0,0,0.7)',
            }}
          />
        )}

        {/* Subtitle — fade up after title */}
        {heroTextVisible && (
          <div
            ref={subtitleRef}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
            style={{
              color: 'rgba(255, 255, 255, 0.92)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 3px rgba(0, 0, 0, 0.6)',
              opacity: 0,
            }}
          >
            {heroSubtitle.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons — Framer Motion spring hover */}
        <motion.div
          className="flex flex-row justify-center items-center gap-4"
          style={ctaOffsetTop > 0 ? { marginTop: `${ctaOffsetTop}px` } : undefined}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {ctaPrimaryText && ctaPrimaryUrl && (
            isInternalUrl(ctaPrimaryUrl) ? (
              <motion.div {...ctaMotion}>
                <Link
                  to={ctaPrimaryUrl}
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg glow-accent inline-block"
                  style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                >
                  {ctaPrimaryText}
                </Link>
              </motion.div>
            ) : (
              <motion.div {...ctaMotion}>
                <a
                  href={ctaPrimaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg glow-accent inline-block"
                  style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                >
                  {ctaPrimaryText}
                </a>
              </motion.div>
            )
          )}

          {ctaSecondaryText && ctaSecondaryUrl && (
            isInternalUrl(ctaSecondaryUrl) ? (
              <motion.div {...ctaMotion}>
                <Link
                  to={ctaSecondaryUrl}
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg inline-block"
                  style={{
                    border: '2px solid var(--accent)',
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {ctaSecondaryText}
                </Link>
              </motion.div>
            ) : (
              <motion.div {...ctaMotion}>
                <a
                  href={ctaSecondaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 text-lg sm:text-xl font-bold rounded-lg inline-block"
                  style={{
                    border: '2px solid var(--accent)',
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {ctaSecondaryText}
                </a>
              </motion.div>
            )
          )}
        </motion.div>
      </div>

    </section>
  );
};

export default HeroSection;
