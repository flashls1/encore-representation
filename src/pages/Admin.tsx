import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ExternalLink, LogOut, Home, Users, Mail, Image, Settings, ShieldCheck,
} from "lucide-react";

import AdminHomeContent from "@/components/admin/AdminHomeContent";
import AdminTalents from "@/components/admin/AdminTalents";
import AdminContact from "@/components/admin/AdminContact";
import AdminMediaLibrary from "@/components/admin/AdminMediaLibrary";
import AdminSiteSettings from "@/components/admin/AdminSiteSettings";
import AdminUsers from "@/components/admin/AdminUsers";
import { useState } from "react";

// ─── Sidebar sections ──────────────────────────────────────────────────────────
const ADMIN_SECTIONS = [
  { id: "home", label: "Home Content", icon: Home, color: "#f5d060", component: AdminHomeContent },
  { id: "talents", label: "Talents", icon: Users, color: "#d4af37", component: AdminTalents },
  { id: "contact", label: "Contact", icon: Mail, color: "#38bdf8", component: AdminContact },
  { id: "media", label: "Media", icon: Image, color: "#c084fc", component: AdminMediaLibrary },
  { id: "settings", label: "Settings", icon: Settings, color: "#94a3b8", component: AdminSiteSettings },
  { id: "users", label: "Admin Users", icon: ShieldCheck, color: "#ef4444", component: AdminUsers },
];

// ─── Main Admin page ────────────────────────────────────────────────────────────
const Admin = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("home");

  const active = ADMIN_SECTIONS.find(s => s.id === activeSection) || ADMIN_SECTIONS[0];
  const ActiveComponent = active.component;

  return (
    <div className="h-screen flex flex-col overflow-hidden admin-dark-theme" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Top Navigation */}
      <Navigation />

      {/* Admin Header Bar */}
      <div
        className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-b"
        style={{
          backgroundColor: '#000000',
          borderColor: 'var(--accent)',
          marginTop: '64px',
        }}
      >
        <div>
          <h1
            className="font-orbitron text-2xl md:text-3xl tracking-wide font-bold"
            style={{ color: 'var(--accent)' }}
          >
            ADMIN CMS
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Welcome back, <span style={{ color: 'var(--text-primary)' }} className="font-medium">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Site
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              border: '1px solid var(--error, #ef4444)',
              color: 'var(--error, #ef4444)',
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
          className="flex-shrink-0 w-[200px] flex flex-col overflow-y-auto border-r"
          style={{
            backgroundColor: '#000000',
            borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
          }}
        >
          <nav className="flex flex-col py-2 gap-0.5 px-2">
            {ADMIN_SECTIONS.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm font-medium transition-all duration-150"
                  style={{
                    backgroundColor: isActive
                      ? `color-mix(in srgb, ${section.color} 15%, transparent)`
                      : 'transparent',
                    color: isActive ? section.color : '#ffffff',
                    borderLeft: isActive ? `3px solid ${section.color}` : '3px solid transparent',
                  }}
                >
                  <section.icon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: section.color }}
                  />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ─── Content Area ─── */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;