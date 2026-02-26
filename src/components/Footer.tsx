import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useData";

const Footer = () => {
  const { data: settings } = useSiteSettings();

  return (
    <footer
      className="relative"
      style={{
        backgroundColor: 'var(--footer-bg)',
        borderTop: '1px solid var(--footer-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <span
                className="font-orbitron text-xl font-bold tracking-wider"
                style={{ color: 'var(--accent)' }}
              >
                ENCORE
              </span>
            </Link>
            <p className="text-sm" style={{ color: 'var(--footer-text)' }}>
              Premier talent representation. Connecting exceptional talent with extraordinary opportunities.
            </p>
            <div className="flex gap-3">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--footer-text)' }} className="hover:opacity-80 transition-opacity">
                  IG
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--footer-text)' }} className="hover:opacity-80 transition-opacity">
                  FB
                </a>
              )}
              {settings?.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--footer-text)' }} className="hover:opacity-80 transition-opacity">
                  X
                </a>
              )}
              {settings?.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--footer-text)' }} className="hover:opacity-80 transition-opacity">
                  TikTok
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
              Quick Links
            </h3>
            <nav className="flex flex-col gap-1.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/book', label: 'Book Now' },
                { to: '/contact', label: 'Contact' },
                { to: '/login', label: 'Admin Login' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--footer-text)' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
              Contact
            </h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--footer-text)' }}>
              {settings?.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                </div>
              )}
              {settings?.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{settings.contact_phone}</span>
                </div>
              )}
              <Link to="/contact" className="inline-block font-medium" style={{ color: 'var(--accent)' }}>
                Contact Form →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs gap-2"
          style={{ borderTop: '1px solid var(--footer-border)', color: 'var(--footer-text)' }}
        >
          <p>© {new Date().getFullYear()} Encore Representation. All rights reserved.</p>
        </div>
      </div>

      {/* Accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: 'var(--accent)' }} />
    </footer>
  );
};

export default Footer;