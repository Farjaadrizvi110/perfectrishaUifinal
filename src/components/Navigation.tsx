import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPaidMember, setIsPaidMember] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const member = localStorage.getItem('perfectrishta_current_member');
    setIsPaidMember(!!member);
  }, [location.pathname]);

  const scrollToMembership = () => {
    const el = document.getElementById('membership');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

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
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-[1400px] mx-auto">
          <Link
            to="/"
            className="font-display text-2xl tracking-wide transition-colors duration-300"
            style={{ color: scrolled ? '#800020' : '#FFFFFF' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-light">Perfect</span>
            <span className="font-medium" style={{ color: scrolled ? '#D4AF37' : '#F3E5AB' }}>Rishta</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]"
              style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]"
              style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}
            >
              About Us
            </Link>
            {isPaidMember && (
              <Link
                to="/proposals"
                className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]"
                style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}
              >
                Proposals
              </Link>
            )}
            <Link
              to="/profiles"
              className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]"
              style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}
            >
              Profiles
            </Link>
            {isHome && (
              <button
                onClick={scrollToMembership}
                className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]"
                style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}
              >
                Pricing
              </button>
            )}
            <Link
              to="/login"
              className="font-body text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:tracking-[0.14em]"
              style={{ color: scrolled ? '#4A0404' : '#FFFFFF' }}
            >
              Login
            </Link>
            <Link
              to="/join"
              className="font-body text-xs font-semibold tracking-[0.1em] uppercase px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: scrolled ? '#800020' : 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.4)',
              }}
            >
              Register Now
            </Link>
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
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8" style={{ background: 'rgba(253, 251, 247, 0.98)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 text-maroon text-3xl">&times;</button>
          <Link to="/" onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mb-4 font-display text-4xl text-deep-maroon">
            <span className="font-light">Perfect</span>
            <span className="font-medium text-gold">Rishta</span>
          </Link>
          <Link to="/" onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-display text-3xl text-deep-maroon hover:text-maroon transition-colors duration-300">
            Home
          </Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="font-display text-3xl text-deep-maroon hover:text-maroon transition-colors duration-300">
            About Us
          </Link>
          {isPaidMember && (
            <Link to="/proposals" onClick={() => setMobileOpen(false)} className="font-display text-3xl text-deep-maroon hover:text-maroon transition-colors duration-300">
              Proposals
            </Link>
          )}
          <Link to="/profiles" onClick={() => setMobileOpen(false)} className="font-display text-3xl text-deep-maroon hover:text-maroon transition-colors duration-300">
            Profiles
          </Link>
          {isHome && (
            <button onClick={scrollToMembership} className="font-display text-3xl text-deep-maroon hover:text-maroon transition-colors duration-300">
              Pricing
            </button>
          )}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="font-display text-3xl text-deep-maroon hover:text-maroon transition-colors duration-300"
          >
            Login
          </Link>
          <Link
            to="/join"
            onClick={() => setMobileOpen(false)}
            className="mt-4 font-body text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 rounded-full bg-maroon text-white"
          >
            Register Now
          </Link>
        </div>
      )}
    </>
  );
}
