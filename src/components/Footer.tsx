import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useData";

gsap.registerPlugin(ScrollTrigger);

// ─── Social Icon Link (official brand images, Apple-style rounded + gold border) ─
const SocialLink = ({ href, src, label }: { href: string; src: string; label: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    title={label}
    className="block"
    style={{
      width: 46,
      height: 46,
      padding: 2,
      borderRadius: 12,
      border: '2px solid #D4AF37',
      backgroundColor: 'rgba(10, 10, 10, 0.6)',
    }}
    whileHover={{ scale: 1.12, borderColor: '#FFD700' }}
    whileTap={{ scale: 0.95 }}
  >
    <img
      src={src}
      alt={label}
      className="block w-full h-full object-cover"
      style={{ borderRadius: 8 }}
      loading="lazy"
    />
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

  // Build social links array from settings — only show icons that have URLs
  const socialLinks = [
    settings?.instagram_url && { href: settings.instagram_url, src: '/social-icons/instagram.png', label: 'Instagram' },
    settings?.facebook_url && { href: settings.facebook_url, src: '/social-icons/facebook.png', label: 'Facebook' },
    settings?.tiktok_url && { href: settings.tiktok_url, src: '/social-icons/tiktok.png', label: 'TikTok' },
    settings?.twitter_url && { href: settings.twitter_url, src: '/social-icons/x.png', label: 'X' },
    (settings as any)?.youtube_url && { href: (settings as any).youtube_url, src: '/social-icons/youtube.png', label: 'YouTube' },
  ].filter(Boolean) as { href: string; src: string; label: string }[];

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
              <div className="flex gap-3 flex-wrap pt-1">
                {socialLinks.map((s) => (
                  <SocialLink key={s.label} href={s.href} src={s.src} label={s.label} />
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