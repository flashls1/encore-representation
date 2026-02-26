import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TalentCard from "@/components/TalentCard";
import Footer from "@/components/Footer";
import { useTalents } from "@/hooks/useData";

const Index = () => {
  const { data: talents, isLoading } = useTalents();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation />
      <HeroSection />

      {/* Talent Roster Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl mb-3 tracking-wider font-bold"
              style={{ color: 'var(--accent)' }}
            >
              Talent Roster
            </h2>
            <p style={{ color: 'var(--text-muted)' }} className="text-lg max-w-2xl mx-auto">
              Meet the exceptional talent we represent
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden animate-pulse"
                  style={{ backgroundColor: 'var(--skeleton)' }}
                >
                  <div className="pb-[100%]" />
                  <div className="p-3">
                    <div
                      className="h-4 rounded w-3/4 mb-1"
                      style={{ backgroundColor: 'var(--skeleton-shine)' }}
                    />
                    <div
                      className="h-3 rounded w-1/2"
                      style={{ backgroundColor: 'var(--skeleton-shine)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : talents && talents.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 stagger-children">
              {talents.map((talent) => (
                <div key={talent.id} className="animate-fade-in-up">
                  <TalentCard talent={talent} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'var(--badge-bg)' }}
              >
                <span className="text-3xl" style={{ color: 'var(--accent)' }}>★</span>
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
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