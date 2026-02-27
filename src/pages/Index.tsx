import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { useTalents } from "@/hooks/useData";
import type { Talent } from "@/types/database";

gsap.registerPlugin(ScrollTrigger);

// ─── Cursor-tracking portrait (desktop only) ──────────────────────────────────
const FloatingPortrait = ({ talent, mouseX, mouseY }: {
  talent: Talent | null;
  mouseX: number;
  mouseY: number;
}) => {
  const x = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const y = useSpring(mouseY, { damping: 30, stiffness: 200 });

  useEffect(() => { x.set(mouseX); }, [mouseX]);
  useEffect(() => { y.set(mouseY); }, [mouseY]);

  return (
    <AnimatePresence>
      {talent && talent.headshot_url && (
        <motion.div
          className="fixed pointer-events-none z-40"
          style={{ x, y, translateX: '-50%', translateY: '-50%' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div
            className="w-[300px] h-[380px] rounded-xl overflow-hidden shadow-2xl"
            style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}
          >
            <img
              src={talent.headshot_url}
              alt={`${talent.first_name} ${talent.last_name}`}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Interactive talent name row (desktop) ──────────────────────────────────────
const TalentRow = ({
  talent,
  index,
  onHover,
  onLeave,
}: {
  talent: Talent;
  index: number;
  onHover: () => void;
  onLeave: () => void;
}) => {
  const displayName = `${talent.first_name} ${talent.last_name}`;
  const topRoles = talent.talent_roles?.slice(0, 2) || [];

  return (
    <Link to={`/talent/${talent.id}`}>
      <motion.div
        className="group flex items-center justify-between py-5 px-6 border-b cursor-pointer"
        style={{ borderColor: 'rgba(212, 175, 55, 0.08)' }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ x: 12, backgroundColor: 'rgba(212, 175, 55, 0.04)' }}
      >
        {/* Number */}
        <span
          className="font-mono text-xs w-8 flex-shrink-0 opacity-30"
          style={{ color: 'var(--accent)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Name */}
        <span
          className="font-orbitron text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-wider flex-1 transition-colors duration-300"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="group-hover:text-[#D4AF37] transition-colors duration-300">
            {displayName}
          </span>
        </span>

        {/* Roles */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {topRoles.map((r, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
              }}
            >
              {r.character_name}
            </span>
          ))}
        </div>

        {/* Arrow */}
        <motion.span
          className="ml-4 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
          style={{ color: 'var(--accent)' }}
        >
          →
        </motion.span>
      </motion.div>
    </Link>
  );
};

// ─── Mobile talent card (preserved responsive grid) ────────────────────────────
const MobileTalentCard = ({ talent }: { talent: Talent }) => {
  const displayName = `${talent.first_name} ${talent.last_name}`;
  const topRoles = talent.talent_roles?.slice(0, 2) || [];

  return (
    <Link to={`/talent/${talent.id}`}>
      <motion.div
        className="group relative block overflow-hidden rounded-xl"
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
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
              <span className="text-4xl font-bold opacity-30" style={{ color: 'var(--accent)' }}>
                {talent.first_name[0]}{talent.last_name[0]}
              </span>
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-sm leading-tight" style={{ color: '#ffffff' }}>
              {displayName}
            </h3>
            {topRoles.length > 0 && (
              <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--accent)' }}>
                {topRoles.map(r => r.character_name).join(' • ')}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const Index = () => {
  const { data: talents, isLoading } = useTalents();
  const [hoveredTalent, setHoveredTalent] = useState<Talent | null>(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  // Track mouse position for floating portrait
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX + 30, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // GSAP scroll-triggered section heading
  useEffect(() => {
    if (!headingRef.current) return;
    gsap.fromTo(headingRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      }
    );
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation />
      <HeroSection />

      {/* Talent Roster Section */}
      <section ref={sectionRef} className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div ref={headingRef} className="text-center mb-12 md:mb-16">
            <h2
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl mb-3 tracking-wider font-bold"
              style={{ color: 'var(--accent)' }}
            >
              Talent Roster
            </h2>
            <div className="w-16 h-[2px] mx-auto mt-4" style={{ backgroundColor: 'var(--accent)' }} />
          </div>

          {isLoading ? (
            /* Loading skeleton */
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton)' }} />
              ))}
            </div>
          ) : talents && talents.length > 0 ? (
            <>
              {/* Desktop: Interactive name list with cursor-tracking portrait */}
              <div className="hidden lg:block">
                <div className="border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.08)' }}>
                  {talents.map((talent, i) => (
                    <TalentRow
                      key={talent.id}
                      talent={talent}
                      index={i}
                      onHover={() => setHoveredTalent(talent)}
                      onLeave={() => setHoveredTalent(null)}
                    />
                  ))}
                </div>
                <FloatingPortrait
                  talent={hoveredTalent}
                  mouseX={mousePos.x}
                  mouseY={mousePos.y}
                />
              </div>

              {/* Mobile/Tablet: Responsive grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:hidden">
                {talents.map((talent) => (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <MobileTalentCard talent={talent} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'var(--badge-bg)' }}
              >
                <span className="text-3xl" style={{ color: 'var(--accent)' }}>★</span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Roster Coming Soon
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Our talent roster is being curated. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;