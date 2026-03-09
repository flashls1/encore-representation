import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useData";

gsap.registerPlugin(ScrollTrigger);

// ─── SVG Social Icons (sharp, brand-accurate) ──────────────────────────────────
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.28 0 .56.04.82.12V9.01a6.41 6.41 0 0 0-.82-.05C6.09 8.96 3.5 11.55 3.5 14.89A5.89 5.89 0 0 0 9.49 20.5c3.26 0 5.89-2.64 5.89-5.89V8.57a8.32 8.32 0 0 0 4.62 1.4V6.69h-.41Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
  </svg>
);

// ─── Social Icon Link ───────────────────────────────────────────────────────────
const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: React.FC; label: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    title={label}
    className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
    style={{
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      border: '1px solid rgba(212, 175, 55, 0.25)',
      color: '#D4AF37',
    }}
    whileHover={{
      scale: 1.15,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      borderColor: 'rgba(212, 175, 55, 0.5)',
    }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon />
  </motion.a>
);

// ─── Footer ─────────────────────────────────────────────────────────────────────
const Footer = () => {
  const { data: settings } = useSiteSettings();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    gsap.fromTo(footerRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }, []);

  // Build social links array from settings
  const socialLinks = [
    settings?.instagram_url && { href: settings.instagram_url, icon: InstagramIcon, label: 'Instagram' },
    settings?.facebook_url && { href: settings.facebook_url, icon: FacebookIcon, label: 'Facebook' },
    settings?.tiktok_url && { href: settings.tiktok_url, icon: TikTokIcon, label: 'TikTok' },
    settings?.twitter_url && { href: settings.twitter_url, icon: XIcon, label: 'X' },
    (settings as any)?.youtube_url && { href: (settings as any).youtube_url, icon: YouTubeIcon, label: 'YouTube' },
  ].filter(Boolean) as { href: string; icon: React.FC; label: string }[];

  return (
    <footer
      ref={footerRef}
      className="relative"
      style={{ backgroundColor: 'var(--footer-bg)', borderTop: '1px solid var(--footer-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand + Social Icons */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span
                className="text-base font-semibold tracking-wider"
                style={{ fontFamily: "'Cinzel', Georgia, serif", color: 'var(--accent)' }}
              >
                Encore Representation
              </span>
            </Link>
            <p className="text-sm" style={{ color: 'var(--footer-text)' }}>
              Premier talent representation. Connecting exceptional talent with extraordinary opportunities.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-2.5 flex-wrap pt-1">
                {socialLinks.map((s) => (
                  <SocialLink key={s.label} href={s.href} icon={s.icon} label={s.label} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>Quick Links</h3>
            <nav className="flex flex-col gap-1.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/events', label: 'Events' },
                { to: '/book', label: 'Book Now' },
                { to: '/contact', label: 'Contact' },
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
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>Contact</h3>
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