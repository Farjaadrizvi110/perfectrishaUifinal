import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, isMember, displayName, initials, logout, loading } = useAuth();

  const isHome = location.pathname === '/';

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setMobileOpen(false); }, [location.pathname]);

  const scrollToMembership = () => {
    const el = document.getElementById('membership');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const doLogout = (e?: any) => {
    try { e?.preventDefault?.(); } catch {}
    setMenuOpen(false);
    setMobileOpen(false);
    logout();
    setTimeout(() => navigate('/login', { replace: true }), 20);
  };

  const userMenuButtonAria = 'Open user menu';

  const showProposals = (isMember && user?.membershipStatus === 'active');

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-[100] transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 20px rgba(128, 0, 32, 0.08)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-[1400px] mx-auto gap-3">
          <Link
            to="/"
            className="font-display text-2xl tracking-wide transition-colors duration-300 flex-shrink-0"
            style={{ color: scrolled ? '#800020' : '#FFFFFF' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-light">Perfect</span>
            <span className="font-medium" style={{ color: scrolled ? '#D4AF37' : '#F3E5AB' }}>Rishta</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]" style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Home
            </Link>
            <Link to="/about" className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]" style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}>
              About Us
            </Link>
            {showProposals && (
              <Link to="/proposals" className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]" style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}>
                Proposals
              </Link>
            )}
            <Link to="/profiles" className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]" style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}>
              Profiles
            </Link>
            {isHome && (
              <button onClick={scrollToMembership} className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]" style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}>
                Pricing
              </button>
            )}
            {!isLoggedIn && !loading && (
              <>
                <Link to="/login" className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]" style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}>
                  Login
                </Link>
                <Link to="/join" className="font-body text-xs font-semibold tracking-[0.1em] uppercase px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                  style={{
                    background: scrolled ? '#800020' : 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.4)',
                  }}
                >
                  Register Now
                </Link>
              </>
            )}
            {isLoggedIn && !loading && (
              <div className="relative">
                <button
                  type="button"
                  aria-label={userMenuButtonAria}
                  onClick={() => setMenuOpen((v) => !v)}
                  onBlur={(e) => {
                    const related = e.relatedTarget as HTMLElement | null;
                    if (related && related.closest('[data-user-menu]')) return;
                    setTimeout(() => setMenuOpen(false), 120);
                  }}
                  className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: scrolled ? 'rgba(128,0,32,0.08)' : 'rgba(255,255,255,0.16)',
                    border: scrolled ? '1px solid rgba(128,0,32,0.12)' : '1px solid rgba(255,255,255,0.25)',
                    color: scrolled ? '#4A0404' : '#FFFFFF',
                  }}
                >
                  <span className="w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-semibold"
                    style={{
                      background: scrolled ? 'linear-gradient(135deg, #800020, #4A0404)' : 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(212,175,55,0.9))',
                      color: scrolled ? '#FFFFFF' : '#800020',
                    }}
                  >
                    {initials}
                  </span>
                  <span className="font-body text-[12px] font-semibold tracking-wide max-w-[140px] truncate">{displayName}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {menuOpen && (
                  <div data-user-menu className="absolute right-0 mt-3 w-[250px] rounded-2xl border border-maroon/10 bg-white shadow-2xl overflow-hidden z-[150]" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="px-5 py-4 border-b border-maroon/10 bg-gradient-to-br from-maroon/[0.04] to-gold/[0.04]">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-[15px] text-deep-maroon leading-tight truncate">{displayName}</p>
                          <p className="font-body text-[11px] text-deep-maroon/55 uppercase tracking-[0.08em] mt-0.5">
                            {isAdmin ? 'Admin' : user?.loginId ? `Member · ${user.loginId}` : 'Signed in'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      {isAdmin && (
                        <Link to="/admin" className="block px-5 py-2.5 font-body text-[13px] text-deep-maroon/85 hover:bg-maroon/[0.04] hover:text-maroon transition-colors">
                          Admin Dashboard
                        </Link>
                      )}
                      {isMember && (
                        <>
                          <Link to="/dashboard" className="block px-5 py-2.5 font-body text-[13px] text-deep-maroon/85 hover:bg-maroon/[0.04] hover:text-maroon transition-colors">
                            My Dashboard
                          </Link>
                          {showProposals && (
                            <Link to="/proposals" className="block px-5 py-2.5 font-body text-[13px] text-deep-maroon/85 hover:bg-maroon/[0.04] hover:text-maroon transition-colors">
                              Browse Proposals
                            </Link>
                          )}
                        </>
                      )}
                      <button type="button" onClick={doLogout} className="w-full text-left px-5 py-2.5 font-body text-[13px] text-red-600 hover:bg-red-50 transition-colors border-t border-maroon/5 mt-2">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 transition-all duration-300" style={{ background: scrolled ? '#800020' : '#FFFFFF' }} />
            <span className="block w-6 h-0.5 transition-all duration-300" style={{ background: scrolled ? '#800020' : '#FFFFFF' }} />
            <span className="block w-6 h-0.5 transition-all duration-300" style={{ background: scrolled ? '#800020' : '#FFFFFF' }} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-6 px-8 overflow-y-auto" style={{ background: 'rgba(253, 251, 247, 0.98)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 text-maroon text-3xl">&times;</button>
          <Link to="/" onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mb-4 font-display text-4xl text-deep-maroon">
            <span className="font-light">Perfect</span>
            <span className="font-medium text-gold">Rishta</span>
          </Link>
          {isLoggedIn && !loading && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-gold/30 bg-gold/5 mb-2">
              <span className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
                {initials}
              </span>
              <div className="min-w-0 max-w-[200px]">
                <p className="font-display text-[15px] text-deep-maroon truncate">{displayName}</p>
                <p className="font-body text-[11px] text-deep-maroon/55 uppercase tracking-wider">{isAdmin ? 'Admin' : 'Signed in'}</p>
              </div>
            </div>
          )}
          <Link to="/" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">Home</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">About Us</Link>
          {showProposals && (
            <Link to="/proposals" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">Proposals</Link>
          )}
          <Link to="/profiles" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">Profiles</Link>
          {isHome && (
            <button onClick={scrollToMembership} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">Pricing</button>
          )}
          {!isLoggedIn && !loading && (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">Login</Link>
              <Link to="/join" onClick={() => setMobileOpen(false)} className="mt-2 font-body text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 rounded-full bg-maroon text-white">
                Register Now
              </Link>
            </>
          )}
          {isLoggedIn && !loading && (
            <>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">Admin Dashboard</Link>
              )}
              {isMember && (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-deep-maroon hover:text-maroon transition-colors duration-300">My Dashboard</Link>
              )}
              <button type="button" onClick={doLogout} className="mt-4 w-full max-w-[280px] py-3 rounded-full border border-red-200 text-red-600 bg-white font-body text-sm font-semibold tracking-[0.1em] uppercase hover:bg-red-50">
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
