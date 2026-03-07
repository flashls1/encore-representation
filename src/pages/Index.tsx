import { useRef, useEffect, useMemo, useCallback, useState, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { useTalents, useUIEffect } from "@/hooks/useData";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import type { Talent } from "@/types/database";
import TalentCarousel from "@/ui-library/react-bits/effects/components/talent-carousel/TalentCarousel";
import EventsCarousel from "@/components/EventsCarousel";
import LightRays from "@/ui-library/react-bits/effects/backgrounds/light-rays/LightRays";
import Spotlights from "@/ui-library/react-bits/effects/backgrounds/spotlights/Spotlights";
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

  // Fetch background selection + individual effect configs
  const { config: carouselConfig } = useUIEffect('talent-carousel');
  const { config: lightRaysConfig } = useUIEffect('light-rays');
  const { config: spotlightsConfig } = useUIEffect('spotlights');

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
    <section className="px-3 md:px-[10px] mt-4 md:mt-2">
      {/* Carousel container — responsive, matches hero gold box on mobile */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl md:rounded-2xl"
        style={{
          height: 'clamp(380px, 65vh, 625px)',
          border: '1.5px solid #D4AF37',
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
        }}
      >
        {/* Layer 0: Switchable Background Effect — controlled via Admin UI Effects panel */}
        <div className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
          <SafeBackground>
            {carouselConfig.background === 'light-rays' && (
              <LightRays
                raysOrigin={lightRaysConfig.raysOrigin}
                raysColor={lightRaysConfig.raysColor}
                raysSpeed={lightRaysConfig.raysSpeed}
                lightSpread={lightRaysConfig.lightSpread}
                rayLength={lightRaysConfig.rayLength}
                pulsating={lightRaysConfig.pulsating}
                fadeDistance={lightRaysConfig.fadeDistance}
                saturation={lightRaysConfig.saturation}
                followMouse={lightRaysConfig.followMouse}
                mouseInfluence={lightRaysConfig.mouseInfluence}
                noiseAmount={lightRaysConfig.noiseAmount}
                distortion={lightRaysConfig.distortion}
              />
            )}
            {(carouselConfig.background === 'spotlights' || !carouselConfig.background) && (
              <Spotlights
                color={spotlightsConfig.color}
                accentColor={spotlightsConfig.accentColor}
                beamWidth={spotlightsConfig.beamWidth}
                intensity={spotlightsConfig.intensity}
                swaySpeed={spotlightsConfig.swaySpeed}
                swayAmount={spotlightsConfig.swayAmount}
                particleDensity={spotlightsConfig.particleDensity}
                haze={spotlightsConfig.haze}
                pulsing={spotlightsConfig.pulsing}
              />
            )}
            {carouselConfig.background === 'silk' && (
              <Silk color="#8B0000" speed={5} scale={1} noiseIntensity={1.5} rotation={0} />
            )}
            {carouselConfig.background === 'none' && null}
          </SafeBackground>
        </div>

        {/* Layer 1: Vertical Banner Carousel */}
        <div className="absolute inset-0 z-10">
          <TalentCarousel
            items={carouselItems}
            desktopSpeed={carouselConfig.desktopSpeed}
            mobileSpeed={carouselConfig.mobileSpeed}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Layer 2: Heading overlay — inside the container at the top */}
        <div className="absolute top-3 md:top-5 left-0 right-0 z-20 text-center pointer-events-none">
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
      </div>
    </section>
  );
};
// ─── Safe WebGL wrapper (WebGL may crash on some mobile GPUs) ────────────────

class SafeBackground extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Background effect crashed:', error, info);
  }
  render() {
    if (this.state.hasError) return <div className="absolute inset-0" style={{ backgroundColor: '#0A0A0A' }} />;
    return this.props.children;
  }
}

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

// ─── Events Carousel Section ─────────────────────────────────────────────────
const EventsCarouselSection = () => {
  const { data: events } = useUpcomingEvents(true);
  const { config: eventsConfig } = useUIEffect('events-carousel');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const carouselItems = useMemo(() => {
    if (!events) return [];
    return events
      .filter(e => e.image_url)
      .map(e => ({
        image: e.image_url,
        id: e.id,
        title: e.title,
      }));
  }, [events]);

  const handleEventClick = useCallback(() => {
    navigate('/events');
  }, [navigate]);

  if (!carouselItems.length) return null;

  return (
    <section className="px-3 md:px-[10px] mt-4 md:mt-2">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl md:rounded-2xl"
        style={{
          height: 'clamp(380px, 65vh, 625px)',
          border: '1.5px solid #D4AF37',
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
        }}
      >
        {/* Heading overlay */}
        <div className="absolute top-3 md:top-5 left-0 right-0 z-20 text-center pointer-events-none">
          <h2
            className="font-orbitron text-xl md:text-3xl tracking-wider font-bold mb-1 md:mb-2"
            style={{ color: '#D4AF37', textShadow: '0 0 20px rgba(212,175,55,0.3), 1px 1px 0 rgba(0,0,0,0.8)' }}
          >
            Events
          </h2>
          <div className="w-12 md:w-16 h-[2px] mx-auto mt-1 md:mt-2" style={{ backgroundColor: '#D4AF37' }} />
        </div>

        {/* Carousel */}
        <div className="absolute inset-0 z-10">
          <EventsCarousel
            items={carouselItems}
            desktopSpeed={eventsConfig.desktopSpeed}
            mobileSpeed={eventsConfig.mobileSpeed}
            onItemClick={handleEventClick}
          />
        </div>
      </div>
    </section>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const Index = () => {
  const { data: talents, isLoading } = useTalents();

  // Section refs for desktop snap-scroll
  const heroRef = useRef<HTMLDivElement>(null!);
  const talentRef = useRef<HTMLDivElement>(null!);
  const eventsRef = useRef<HTMLDivElement>(null!);
  const footerRef = useRef<HTMLDivElement>(null!);

  // Desktop snap scroll between sections
  useDesktopSnapScroll([heroRef, talentRef, eventsRef, footerRef]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <Navigation />

      {/* Section 0: Hero */}
      <div ref={heroRef}>
        <HeroSection />
      </div>

      {/* Section 1: Talent Roster */}
      <div ref={talentRef}>
        {isLoading ? (
          <section className="px-3 md:px-[10px] mt-2">
            <div className="text-center mb-4 md:mb-8">
              <div className="h-8 w-48 mx-auto rounded bg-white/5 animate-pulse" />
            </div>
            <div
              className="relative w-full overflow-hidden rounded-xl md:rounded-2xl animate-pulse"
              style={{
                height: 'clamp(380px, 65vh, 625px)',
                border: '1.5px solid rgba(212, 175, 55, 0.3)',
                backgroundColor: 'rgba(10, 10, 10, 0.9)',
              }}
            />
          </section>
        ) : talents && talents.length > 0 ? (
          <TalentCarouselSection talents={talents} />
        ) : null}
      </div>

      {/* Section 2: Events */}
      <div ref={eventsRef}>
        <EventsCarouselSection />
      </div>

      {/* Section 3: Footer */}
      <div ref={footerRef} className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default Index;