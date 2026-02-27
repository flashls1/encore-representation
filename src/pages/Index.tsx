import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { useTalents } from "@/hooks/useData";
import type { Talent } from "@/types/database";

gsap.registerPlugin(ScrollTrigger);

// ─── Talent card (shared for all screen sizes) ─────────────────────────────────
const TalentCard = ({ talent, index }: { talent: Talent; index: number }) => {
  const topRoles = talent.talent_roles?.slice(0, 2) || [];
  const initials = talent.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <Link to={`/talent/${talent.id}`}>
      <motion.div
        className="group relative block overflow-hidden rounded-xl"
        style={{ border: '1px solid rgba(212, 175, 55, 0.15)', backgroundColor: '#0A0A0A' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.03, borderColor: 'rgba(212, 175, 55, 0.4)' }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 1:1 Square image */}
        <div className="relative w-full pb-[100%] overflow-hidden">
          {talent.headshot_url ? (
            <img
              src={talent.headshot_url}
              alt={talent.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: '#111' }}
            >
              <span className="text-4xl sm:text-5xl font-bold opacity-20" style={{ color: '#D4AF37' }}>
                {initials}
              </span>
            </div>
          )}

          {/* No overlay — images already contain talent name graphics */}
        </div>
      </motion.div>
    </Link>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const Index = () => {
  const { data: talents, isLoading } = useTalents();
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    gsap.fromTo(headingRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: headingRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
    );
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <Navigation />
      <HeroSection />

      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div ref={headingRef} className="text-center mb-12 md:mb-16">
            <h2
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl mb-3 tracking-wider font-bold"
              style={{ color: '#D4AF37' }}
            >
              Talent Roster
            </h2>
            <div className="w-16 h-[2px] mx-auto mt-4" style={{ backgroundColor: '#D4AF37' }} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="pb-[100%] rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
              ))}
            </div>
          ) : talents && talents.length > 0 ? (
            /* Grid: 3 columns on mobile, 4 on md+ */
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {talents.map((talent, i) => (
                <TalentCard key={talent.id} talent={talent} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
              >
                <span className="text-3xl" style={{ color: '#D4AF37' }}>★</span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>
                Roster Coming Soon
              </h3>
              <p style={{ color: '#888' }}>
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