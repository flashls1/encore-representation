import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { useTalents, useUIEffect } from "@/hooks/useData";
import type { Talent } from "@/types/database";
import TalentCarousel from "@/ui-library/react-bits/effects/components/talent-carousel/TalentCarousel";
import Silk from "@/ui-library/react-bits/effects/backgrounds/silk/Silk";
import BlurText from "@/ui-library/react-bits/effects/text-animations/blur-text/BlurText";
import ShinyText from "@/ui-library/react-bits/effects/text-animations/shiny-text/ShinyText";

gsap.registerPlugin(ScrollTrigger);



// ─── Desktop Talent Carousel Section ─────────────────────────────────────────
const TalentCarouselSection = ({ talents }: { talents: Talent[] }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlurred, setIsBlurred] = useState(true);

  // Fetch admin UI settings for the two text effects
  const { config: blurConfig } = useUIEffect('blur-text');
  const { config: shinyConfig } = useUIEffect('shiny-text');

  // Build carousel items from talent data
  const carouselItems = useMemo(() => {
    return talents
      .filter(t => t.headshot_url)
      .map(t => ({
        image: t.headshot_url!,
        id: t.id,
      }));
  }, [talents]);

  // GSAP entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  const handleItemClick = (id: string) => {
    navigate(`/talent/${id}`);
  };

  if (!carouselItems.length) return null;

  return (
    <section className="px-2 md:px-[10px] mt-2">
      {/* Heading — responsive sizing */}
      <div className="text-center mb-4 md:mb-8">
        {isBlurred ? (
          <BlurText
            text="Talent Roster"
            delay={blurConfig.delay}
            animateBy={blurConfig.animateBy as 'words' | 'letters'}
            direction={blurConfig.direction as 'top' | 'bottom'}
            stepDuration={blurConfig.stepDuration}
            threshold={blurConfig.threshold}
            className="font-orbitron text-2xl md:text-4xl tracking-wider font-bold mb-2 md:mb-3"
            onAnimationComplete={() => setIsBlurred(false)}
          />
        ) : (
          <h2 className="font-orbitron text-2xl md:text-4xl tracking-wider font-bold mb-2 md:mb-3">
            <ShinyText
              text="Talent Roster"
              disabled={shinyConfig.disabled}
              speed={shinyConfig.speed}
              color={shinyConfig.color}
              shineColor={shinyConfig.shineColor}
              spread={shinyConfig.spread}
              yoyo={shinyConfig.yoyo}
              direction={shinyConfig.direction as 'left' | 'right'}
            />
          </h2>
        )}
        <div className="w-12 md:w-16 h-[2px] mx-auto mt-1 md:mt-2" style={{ backgroundColor: '#D4AF37' }} />
      </div>

      {/* Carousel container — responsive height */}
      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden"
        style={{
          width: 'calc(100vw - 16px)',
          height: 'clamp(380px, 65vh, 625px)',
          borderRadius: '12px',
          border: '1.5px solid #D4AF37',
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
        }}
      >
        {/* Layer 0: Silk Background (dark red pattern) */}
        <div className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
          <Silk color="#8B0000" speed={5} scale={1} noiseIntensity={1.5} rotation={0} />
        </div>

        {/* Layer 1: Vertical Banner Carousel */}
        <div className="absolute inset-0 z-10">
          <TalentCarousel
            items={carouselItems}
            autoScrollSpeed={0.8}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
    </section>
  );
};

// ─── Desktop snap-scroll hook ──────────────────────────────────────────────────
const useDesktopSnapScroll = (sectionRefs: React.RefObject<HTMLElement>[]) => {
  const isSnapping = useRef(false);
  const cooldownTimer = useRef<number>(0);

  const snapTo = useCallback((target: HTMLElement) => {
    if (isSnapping.current) return;
    isSnapping.current = true;

    // Use GSAP ScrollTo for smooth snap — works with Lenis
    gsap.to(window, {
      scrollTo: { y: target, offsetY: 0 },
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        // Cooldown prevents bounce-snapping from residual wheel events
        cooldownTimer.current = window.setTimeout(() => {
          isSnapping.current = false;
        }, 400);
      },
    });
  }, []);

  useEffect(() => {
    // Only enable on desktop (md+ = 768px)
    const mql = window.matchMedia('(min-width: 768px)');
    if (!mql.matches) return;

    // Dynamically import ScrollToPlugin (tree-shakes on mobile)
    import('gsap/ScrollToPlugin').then(({ ScrollToPlugin }) => {
      gsap.registerPlugin(ScrollToPlugin);
    });

    const getCurrentSectionIndex = (): number => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      for (let i = sectionRefs.length - 1; i >= 0; i--) {
        const el = sectionRefs[i].current;
        if (el && scrollY >= el.offsetTop - vh * 0.4) return i;
      }
      return 0;
    };

    const handleWheel = (e: WheelEvent) => {
      if (isSnapping.current) {
        e.preventDefault();
        return;
      }

      // Only snap on meaningful scroll (ignore tiny trackpad jitter)
      if (Math.abs(e.deltaY) < 30) return;

      const currentIdx = getCurrentSectionIndex();
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIdx = currentIdx + direction;

      if (nextIdx >= 0 && nextIdx < sectionRefs.length) {
        const target = sectionRefs[nextIdx].current;
        if (target) {
          e.preventDefault();
          snapTo(target);
        }
      }
    };

    // Passive: false so we can preventDefault during snap
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.clearTimeout(cooldownTimer.current);
    };
  }, [sectionRefs, snapTo]);
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const Index = () => {
  const { data: talents, isLoading } = useTalents();

  // Section refs for desktop snap-scroll
  const heroRef = useRef<HTMLDivElement>(null!);
  const talentRef = useRef<HTMLDivElement>(null!);
  const footerRef = useRef<HTMLDivElement>(null!);

  // Desktop snap scroll between sections
  useDesktopSnapScroll([heroRef, talentRef, footerRef]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <Navigation />

      {/* Section 0: Hero */}
      <div ref={heroRef}>
        <HeroSection />
      </div>

      {/* Section 1: Talent Roster */}
      <div ref={talentRef}>
        {/* Desktop: Rotating Talent Carousel */}
        {!isLoading && talents && talents.length > 0 && (
          <TalentCarouselSection talents={talents} />
        )}


      </div>

      {/* Section 2: Footer — 80px spacing from talent section */}
      <div ref={footerRef} className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default Index;