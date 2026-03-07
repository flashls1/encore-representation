import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

const Login = () => {
  const { user, isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) newErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    const { error, isAdmin: resolvedAdmin } = await signIn(formData.email, formData.password);
    if (error) {
      toast({ title: 'Sign In Failed', description: error.message || 'Please check your credentials.', variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
      navigate(resolvedAdmin ? '/admin' : '/', { replace: true });
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn();
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation />

      {/* Hero header section */}
      <section
        className="section-header py-16 md:py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, var(--header-gradient-start), var(--header-gradient-end))` }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: 'var(--accent-muted)' }}
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--accent)' }}>
            <Shield className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-3xl md:text-5xl tracking-wider mb-3 font-bold" style={{ fontFamily: "'Cinzel', Georgia, serif", color: 'var(--accent)' }}>
            Encore Access
          </h1>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Sign in to manage your talent roster and site content
          </p>
        </div>
      </section>

      {/* Login form section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-md mx-auto">

          {/* Form card */}
          <div
            className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: `0 8px 32px var(--shadow), 0 0 60px var(--glow)`,
            }}
          >
            {/* Subtle top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, transparent, var(--accent), transparent)` }}
            />

            {/* Sign in header */}
            <div className="flex items-center gap-2 mb-6">
              <LogIn className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Admin Sign In</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="signin-email"
                  className="block text-sm font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Email Address
                </label>
                <input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-base transition-all duration-200 outline-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: errors.email ? '2px solid var(--error)' : '1px solid var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--input-focus)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? 'var(--error)' : 'var(--input-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {errors.email && (
                  <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="signin-password"
                  className="block text-sm font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg text-base transition-all duration-200 outline-none"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: errors.password ? '2px solid var(--error)' : '1px solid var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--input-focus)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? 'var(--error)' : 'var(--input-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>{errors.password}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-lg text-base font-bold tracking-wide uppercase transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed glow-accent"
                style={{
                  backgroundColor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                }}
                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--button-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--button-bg)'; }}
              >
                {isLoading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Admin-only notice */}
          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Access restricted to authorized administrators only.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;