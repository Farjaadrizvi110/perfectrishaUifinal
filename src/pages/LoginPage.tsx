import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useRef, useEffect } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const users = JSON.parse(localStorage.getItem('perfectrishta_users') || '[]');
    const user = users.find((u: any) => u.loginId === loginId && u.password === password);

    setTimeout(() => {
      if (user) {
        localStorage.setItem('perfectrishta_current_member', JSON.stringify({
          loginId: user.loginId,
          name: user.name,
          plan: user.plan,
          profileId: user.profileId,
          approvedAt: user.approvedAt,
          loggedInAt: new Date().toISOString(),
        }));
        navigate('/proposals');
      } else {
        setError('Invalid Login ID or Password. Please check your credentials and try again.');
      }
      setLoading(false);
    }, 800);
  };

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
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. PR-1234"
                required
                className="w-full px-4 py-3 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-deep-maroon/70 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
              />
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
