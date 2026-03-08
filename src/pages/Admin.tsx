import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ExternalLink, LogOut, LayoutDashboard, Users, Mail, Image, Settings, ShieldCheck, CalendarCheck, Sparkles,
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
  { id: "ui-effects", label: "UI Effects", icon: Sparkles, color: "#a855f7", component: AdminUIEffects },
  { id: "users", label: "Admin Users", icon: ShieldCheck, color: "#ef4444", component: AdminUsers },
];

// ─── Main Admin page ────────────────────────────────────────────────────────────
const Admin = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("home");

  const active = ADMIN_SECTIONS.find(s => s.id === activeSection) || ADMIN_SECTIONS[0];
  const ActiveComponent = active.component;

  return (
    <div className="h-screen flex flex-col overflow-hidden admin-dark-theme" style={{ backgroundColor: '#050505' }}>
      {/* Top Navigation */}
      <Navigation />

      {/* Admin Header Bar */}
      <div
        className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: '#000000',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          marginTop: '64px',
        }}
      >
        <div>
          <h1
            className="font-orbitron text-2xl md:text-3xl tracking-wide font-bold"
            style={{ color: '#d4af37' }}
          >
            ADMIN CMS
          </h1>
          <p className="text-xs" style={{ color: '#888888' }}>
            Welcome back, <span style={{ color: '#ffffff' }} className="font-medium">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              border: '1px solid #d4af37',
              color: '#d4af37',
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Site
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              border: '1px solid #ef4444',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main body: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">

        {/* ─── Left Sidebar ─── */}
        <aside
          className="flex-shrink-0 w-[240px] flex flex-col overflow-y-auto"
          style={{
            backgroundColor: '#000000',
            borderRight: '1px solid rgba(212, 175, 55, 0.15)',
          }}
        >
          {/* Sidebar label */}
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
                  onClick={() => setActiveSection(section.id)}
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
                  {/* Icon container with colored background */}
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
                  {/* Active indicator dot */}
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

          {/* Sidebar footer */}
          <div className="mt-auto px-5 py-4 border-t" style={{ borderColor: '#1a1a1a' }}>
            <p className="text-[10px]" style={{ color: '#444444' }}>
              Encore CMS v1.0
            </p>
          </div>
        </aside>

        {/* ─── Content Area ─── */}
        <main
          className="flex-1 overflow-y-auto p-6 md:p-8"
          style={{ backgroundColor: '#050505' }}
        >
          <div className="max-w-6xl mx-auto">
            <AdminErrorBoundary key={activeSection}>
              <ActiveComponent />
            </AdminErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;