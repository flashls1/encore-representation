import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Events", path: "/events" },
  { name: "Book Now", path: "/book" },
  { name: "Contact", path: "/contact" },
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

  return (
    <nav
      className="fixed top-0 w-full z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* LEFT: Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <span
                className="font-orbitron text-xl sm:text-2xl font-bold tracking-wider transition-all duration-300 group-hover:scale-105"
                style={{ color: 'var(--accent)' }}
              >
                ENCORE
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
            <div className="flex items-center gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap"
                  style={{
                    color: isActive(item.path) ? 'var(--accent)' : 'var(--nav-text)',
                    backgroundColor: isActive(item.path) ? 'var(--badge-bg)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.color = 'var(--nav-text-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.color = 'var(--nav-text)';
                    }
                  }}
                >
                  {item.name}
                </Link>
              ))}

              {/* Admin link if admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-md text-sm font-bold transition-all duration-300 whitespace-nowrap"
                  style={{
                    color: isActive('/admin') ? 'var(--accent)' : 'var(--warning)',
                    backgroundColor: isActive('/admin') ? 'var(--badge-bg)' : 'transparent',
                  }}
                >
                  Admin
                </Link>
              )}

              {/* Auth */}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <LogOut className="h-3 w-3" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1"
                  style={{ color: 'var(--nav-text)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--nav-text-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--nav-text)'; }}
                >
                  <User className="h-3 w-3" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT: empty spacer for balance on desktop */}
          <div className="hidden lg:flex flex-shrink-0 w-20" />

          {/* MOBILE: Hamburger */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: 'var(--accent)' }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 animate-in slide-in-from-top-2 duration-200">
            <div
              className="rounded-lg mt-2 border overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.path}
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
              ))}

              {/* Admin link for mobile */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm font-bold border-b"
                  style={{
                    color: 'var(--warning)',
                    borderColor: 'var(--border)',
                  }}
                >
                  ⚡ Admin Dashboard
                </Link>
              )}

              {/* Mobile Auth */}
              <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <User className="h-3 w-3" />
                      <span>{user.email}</span>
                      {isAdmin && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: 'var(--badge-bg)',
                            color: 'var(--badge-text)',
                          }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--error)',
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      className="w-full"
                      style={{
                        backgroundColor: 'var(--button-bg)',
                        color: 'var(--button-text)',
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;