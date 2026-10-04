import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, isAdmin, hydrateFromLoginResponse, loading: authLoading } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);
  const autoLoginTriedRef = useRef(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isLoggedIn, isAdmin, authLoading, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }
  }, []);

  const handleLoginIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginId(e.target.value);
  }, []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleLogin = async (e?: React.FormEvent, overrides?: { loginId?: string; password?: string }) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    const id = (overrides?.loginId ?? loginId).trim();
    const pw = overrides?.password ?? password;
    try {
      if (!id || !pw) throw new Error('Please enter both Login ID and Password');
      const result = await api.auth.login(id, pw);

      if (!result || !result.user) throw new Error('Invalid Login ID or Password');

      hydrateFromLoginResponse(result);

      if (result.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Login ID or Password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoginTriedRef.current) return;
    const urlLoginId = searchParams.get('loginId');
    const urlPassword = searchParams.get('password');
    if (urlLoginId && urlPassword) {
      autoLoginTriedRef.current = true;
      setLoginId(urlLoginId);
      setPassword(urlPassword);
      setShowPassword(true);
      void handleLogin(undefined, { loginId: urlLoginId, password: urlPassword });
    }
  }, [searchParams, authLoading, isLoggedIn]);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', paddingBottom: 'clamp(60px, 8vh, 100px)', minHeight: '100vh' }}>
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 right-0 w-[300px] opacity-[0.04] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-[440px] mx-auto px-6">
        <div className="flex justify-start mb-6">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/60 transition-all duration-300 hover:bg-maroon/5 hover:border-maroon/25 hover:text-maroon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </Link>
        </div>
        <div ref={formRef} className="rounded-3xl border border-maroon/8 bg-white shadow-xl p-8 md:p-10 opacity-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl text-deep-maroon font-light">
              Welcome <span className="font-medium text-gold">Back</span>
            </h1>
            <p className="font-body text-sm text-deep-maroon/50 mt-2">Sign in to view proposals and connect with matches</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-body text-sm font-medium text-deep-maroon/70 mb-2">Login ID</label>
              <input
                type="text"
                value={loginId}
                onChange={handleLoginIdChange}
                placeholder="e.g. PR-1234"
                required
                autoComplete="off"
                spellCheck={false}
                className="w-full px-4 py-3 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-deep-maroon/70 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password (verify paste)'}
                  title={showPassword ? 'Hide password' : 'Show password — verify it was typed or pasted correctly'}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPassword((s) => !s); } }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-maroon/70 hover:text-maroon hover:bg-maroon/5 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-1 focus:ring-offset-cream/10"
                >
                  {showPassword ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.45 21.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.17 4.19"/>
                      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1.5 font-body text-[11px] text-deep-maroon/40">
                Click 👁️ above to view the password — confirm it was pasted correctly.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="font-body text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#FFFFFF' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-maroon/8 text-center">
            <p className="font-body text-xs text-deep-maroon/45">
              Don't have an account?{' '}
              <Link to="/join" className="text-maroon font-semibold hover:underline">Register Now</Link>
              {' '}— it's free!
            </p>
            <p className="font-body text-[11px] text-deep-maroon/35 mt-3">
              After registration, our team will review and approve your profile within 48 hours. You'll receive your Login ID and Password via email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
