import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ExternalLink, LogOut, LayoutDashboard, Users, Mail, Image, Settings, ShieldCheck, CalendarCheck, Sparkles, Menu, X,
} from "lucide-react";

import AdminSiteContent from "@/components/admin/AdminSiteContent";
import AdminTalents from "@/components/admin/AdminTalents";
import AdminContact from "@/components/admin/AdminContact";
import AdminMediaLibrary from "@/components/admin/AdminMediaLibrary";
import AdminSiteSettings from "@/components/admin/AdminSiteSettings";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminUIEffects from "@/components/admin/AdminUIEffects";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";
import { useState } from "react";

// ─── Sidebar sections ──────────────────────────────────────────────────────────
const ADMIN_SECTIONS = [
  { id: "home", label: "Site Content", icon: LayoutDashboard, color: "#f5d060", component: AdminSiteContent },
  { id: "talents", label: "Talent", icon: Users, color: "#d4af37", component: AdminTalents },
  { id: "bookings", label: "Bookings", icon: CalendarCheck, color: "#22c55e", component: AdminBookings },
  { id: "contact", label: "Contact", icon: Mail, color: "#38bdf8", component: AdminContact },
  { id: "media", label: "Media", icon: Image, color: "#c084fc", component: AdminMediaLibrary },
  { id: "settings", label: "Settings", icon: Settings, color: "#94a3b8", component: AdminSiteSettings },
  { id: "ui-effects", label: "Effects", icon: Sparkles, color: "#a855f7", component: AdminUIEffects },
  { id: "users", label: "Users", icon: ShieldCheck, color: "#ef4444", component: AdminUsers },
];

// ─── Main Admin page ────────────────────────────────────────────────────────────
const Admin = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState(() => {
    // Restore last active section from sessionStorage
    try { return sessionStorage.getItem('admin_active_section') || 'home'; }
    catch { return 'home'; }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll on iOS to prevent rubber-band bounce
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = 'hidden';
    html.style.position = 'fixed';
    html.style.width = '100%';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.height = '100%';
    return () => {
      html.style.overflow = '';
      html.style.position = '';
      html.style.width = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      body.style.height = '';
    };
  }, []);

  const active = ADMIN_SECTIONS.find(s => s.id === activeSection) || ADMIN_SECTIONS[0];
  const ActiveComponent = active.component;

  const switchSection = (id: string) => {
    setActiveSection(id);
    try { sessionStorage.setItem('admin_active_section', id); } catch { /* noop */ }
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden admin-dark-theme" style={{ backgroundColor: '#050505', overscrollBehavior: 'none', touchAction: 'pan-x pan-y' }}>
      {/* Top Navigation */}
      <Navigation />

      {/* ─── Admin Header Bar ─── */}
      <div
        className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
        style={{
          backgroundColor: '#000000',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          marginTop: '64px',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 rounded-lg"
            style={{ color: '#d4af37' }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="min-w-0">
            <h1
              className="font-orbitron text-lg md:text-3xl tracking-wide font-bold"
              style={{ color: '#d4af37' }}
            >
              ADMIN CMS
            </h1>
            <p className="text-xs truncate" style={{ color: '#888888' }}>
              <span className="hidden sm:inline">Welcome back, </span>
              <span style={{ color: '#ffffff' }} className="font-medium">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              border: '1px solid #d4af37',
              color: '#d4af37',
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
            }}
          >
            <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span className="hidden sm:inline">View Site</span>
            <span className="sm:hidden">Site</span>
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              border: '1px solid #ef4444',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            }}
          >
            <LogOut className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>

      {/* Main body: Sidebar (desktop) / Content */}
      <div className="flex flex-1 min-h-0 relative">

        {/* ─── Mobile Slide-Over Menu ─── */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-40">
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Slide-in panel */}
            <aside
              className="absolute left-0 top-0 bottom-0 w-[250px] flex flex-col overflow-y-auto z-50"
              style={{
                backgroundColor: '#000000',
                borderRight: '1px solid rgba(212, 175, 55, 0.2)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#555555' }}>
                  Navigation
                </p>
              </div>
              <nav className="flex flex-col py-1 gap-0.5 px-3 flex-1">
                {ADMIN_SECTIONS.map((section) => {
                  const isActive = section.id === activeSection;
                  return (
                    <button
                      key={section.id}
                      onClick={() => switchSection(section.id)}
                      className="group flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200 relative"
                      style={{
                        backgroundColor: isActive ? `${section.color}18` : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? `3px solid ${section.color}` : '3px solid transparent',
                      }}
                    >
                      <span
                        className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0"
                        style={{ backgroundColor: isActive ? `${section.color}25` : `${section.color}12` }}
                      >
                        <section.icon className="h-4 w-4" style={{ color: section.color }} />
                      </span>
                      <span>{section.label}</span>
                      {isActive && (
                        <span
                          className="absolute right-3 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: section.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="px-5 py-4 border-t" style={{ borderColor: '#1a1a1a' }}>
                <p className="text-[10px]" style={{ color: '#444444' }}>Encore CMS v1.0</p>
              </div>
            </aside>
          </div>
        )}

        {/* ─── Desktop Left Sidebar ─── */}
        <aside
          className="hidden md:flex flex-shrink-0 w-[240px] flex-col overflow-y-auto"
          style={{
            backgroundColor: '#000000',
            borderRight: '1px solid rgba(212, 175, 55, 0.15)',
          }}
        >
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#555555' }}>
              Navigation
            </p>
          </div>

          <nav className="flex flex-col py-1 gap-0.5 px-3">
            {ADMIN_SECTIONS.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  onClick={() => switchSection(section.id)}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-200 relative"
                  style={{
                    backgroundColor: isActive
                      ? `${section.color}18`
                      : 'transparent',
                    color: isActive ? '#ffffff' : '#888888',
                    borderLeft: isActive ? `3px solid ${section.color}` : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = `${section.color}0D`;
                      e.currentTarget.style.color = '#cccccc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#888888';
                    }
                  }}
                >
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? `${section.color}25` : `${section.color}12`,
                    }}
                  >
                    <section.icon
                      className="h-4 w-4"
                      style={{ color: section.color }}
                    />
                  </span>
                  <span className="truncate">{section.label}</span>
                  {isActive && (
                    <span
                      className="absolute right-3 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: section.color }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto px-5 py-4 border-t" style={{ borderColor: '#1a1a1a' }}>
            <p className="text-[10px]" style={{ color: '#444444' }}>
              Encore CMS v1.0
            </p>
          </div>
        </aside>

        {/* ─── Content Area ─── */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8"
          style={{ backgroundColor: '#050505', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          <div className="max-w-6xl mx-auto">
            <AdminErrorBoundary key={activeSection}>
              <ActiveComponent />
            </AdminErrorBoundary>
          </div>
        </main>
      </div>

      {/* ─── Mobile Bottom Tab Bar ─── */}
      <div
        className="md:hidden flex-shrink-0 flex items-center justify-around"
        style={{
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          overflowX: 'hidden',
        }}
      >
        {ADMIN_SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <button
              key={section.id}
              onClick={() => switchSection(section.id)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-150"
              style={{
                flex: '1 1 0%',
                minWidth: 0,
                color: isActive ? section.color : '#666666',
                borderTop: isActive ? `2px solid ${section.color}` : '2px solid transparent',
                backgroundColor: isActive ? `${section.color}08` : 'transparent',
              }}
            >
              <section.icon className="h-4 w-4" />
              <span className="text-[9px] font-medium leading-none truncate w-full text-center px-0.5">
                {section.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;