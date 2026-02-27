import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Talent Roster", path: "/roster" },
  { name: "About", path: "/about" },
  { name: "Events", path: "/events" },
  { name: "Booking & Contact", path: "/booking" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  return (
    <motion.nav
      className="fixed top-0 w-full z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)',
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* LEFT: Brand Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <motion.img
                src="/encore-logo.png"
                alt="Encore Representation"
                className="h-9 sm:h-10 w-auto"
                style={{
                  borderRadius: '22%',
                  border: '1.5px solid #D4AF37',
                }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              />
            </Link>
          </div>

          {/* CENTER: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
            <div className="flex items-center gap-1 relative">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                  style={{
                    color: isActive(item.path) ? 'var(--accent)' : 'var(--nav-text)',
                  }}
                  data-magnetic
                >
                  {item.name}
                </Link>
              ))}

              {/* Admin link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-md text-sm font-bold transition-all duration-300 whitespace-nowrap"
                  style={{
                    color: isActive('/admin') ? 'var(--accent)' : 'var(--warning)',
                    backgroundColor: isActive('/admin') ? 'var(--badge-bg)' : 'transparent',
                  }}
                  data-magnetic
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT: Sign In / Sign Out — pushed to far right */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                data-magnetic
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1.5"
                style={{
                  color: 'var(--accent)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
                data-magnetic
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}
          </div>

          {/* MOBILE: Hamburger */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: 'var(--accent)' }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden pb-4 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="rounded-lg mt-2 border overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                }}
              >
                {NAV_LINKS.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm font-medium transition-all duration-200 border-b last:border-b-0"
                      style={{
                        color: isActive(item.path) ? 'var(--accent)' : 'var(--text-primary)',
                        backgroundColor: isActive(item.path) ? 'var(--badge-bg)' : 'transparent',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Admin */}
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: NAV_LINKS.length * 0.05 + 0.1 }}
                  >
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm font-bold border-b"
                      style={{ color: 'var(--warning)', borderColor: 'var(--border)' }}
                    >
                      ⚡ Admin Dashboard
                    </Link>
                  </motion.div>
                )}

                {/* Mobile Auth */}
                <motion.div
                  className="p-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <User className="h-3 w-3" />
                        <span>{user.email}</span>
                        {isAdmin && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full"
                        style={{ borderColor: 'var(--border)', color: 'var(--error)' }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        className="w-full"
                        style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;