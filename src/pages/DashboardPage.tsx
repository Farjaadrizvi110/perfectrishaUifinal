import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { footerContent } from '@/content/seoContent';
import { useAuth } from '@/hooks/useAuth';

gsap.registerPlugin(ScrollTrigger);

interface MeData {
  user: {
    id: string;
    loginId?: string;
    username?: string;
    role: string;
    membershipTier: string;
    membershipStatus: string;
    approvedAt?: string;
    lastLoginAt?: string;
  };
  registration: any;
  profile?: any;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout, refresh, loading: authLoading, isAdmin, isLoggedIn } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    (async () => {
      if (authLoading) return;
      if (!isLoggedIn) {
        setTimeout(() => navigate('/login', { replace: true }), 0);
        return;
      }
      if (isAdmin) {
        setTimeout(() => navigate('/admin', { replace: true }), 0);
        return;
      }
      try {
        const updated = (await refresh()) as any;
        if (cancelled) return;
        const data: any = updated ? { user: updated as any, registration: {}, profile: {} } : null;
        if (!data) throw new Error('No me data');
        // If data.user doesn't carry names/contact, re-fetch full via api.auth.me (useAuth refresh returns user-level info)
        const full = (await import('@/lib/api')).api.auth.me();
        const meFull = (await full) as MeData;
        if (cancelled) return;
        if (meFull?.user?.role === 'admin') {
          setTimeout(() => navigate('/admin', { replace: true }), 0);
          return;
        }
        setMe(meFull);
      } catch {
        logout();
        setTimeout(() => navigate('/login', { replace: true }), 20);
        return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Animate AFTER paint (requestAnimationFrame twice) so layout is fully ready and opacity classes (removed defaults) don't flicker.
    const id1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (headerRef.current) {
          const items = headerRef.current.querySelectorAll('.animate-item');
          gsap.fromTo(items, { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
              scrollTrigger: { trigger: headerRef.current, start: 'top 90%', toggleActions: 'play none none reverse' }
            });
        }
        if (heroRef.current) {
          gsap.fromTo(heroRef.current, { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: 0.05, ease: 'power3.out' });
        }
        if (cardRef.current) {
          gsap.fromTo(cardRef.current, { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out',
              scrollTrigger: { trigger: cardRef.current, start: 'top 90%', toggleActions: 'play none none reverse' }
            });
        }
      });
    });

    return () => { cancelled = true; cancelAnimationFrame(id1); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [navigate, authLoading, isLoggedIn, isAdmin, refresh, logout]);

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate('/login', { replace: true }), 20);
  };

  const reg = me?.registration;
  const prof = me?.profile;
  const user = me?.user;

  /** Helper: prefer registration field but fall back to Profile
   *  (for members approved before Registration schema carried names). */
  const f = (key: string): any => {
    const a = (reg && typeof reg === 'object' && (reg as any)[key]);
    if (a !== undefined && a !== null && a !== '') return a;
    const b = (prof && typeof prof === 'object' && (prof as any)[key]);
    if (b !== undefined && b !== null && b !== '') return b;
    return undefined;
  };

  const planColor = useMemo(() => {
    const tier = (user?.membershipTier || 'silver').toLowerCase();
    if (tier === 'gold') return '#D4AF37';
    if (tier === 'platinum') return '#B8B8B8';
    if (tier === 'silver') return '#C0C0C0';
    return '#C0C0C0';
  }, [user?.membershipTier]);

  const tierLabel = useMemo(() => {
    const tier = (user?.membershipTier || 'silver').toLowerCase();
    return tier === 'none' ? 'Silver' : tier.charAt(0).toUpperCase() + tier.slice(1);
  }, [user?.membershipTier]);

  const applicantName = useMemo(() => {
    const first = f('firstName');
    const last = f('lastName');
    const bits = [first, last].filter(Boolean) as string[];
    if (bits.length) return bits.join(' ');
    const g = f('gender');
    return g === 'Female' ? 'Female Profile' : 'Male Profile';
  }, [reg, prof]);

  const initials = useMemo(() => {
    const first = f('firstName') || '';
    const last = f('lastName') || '';
    if (first || last) {
      const gen = (first as string).trim().charAt(0) + (last as string).trim().charAt(0);
      if (gen) return gen.toUpperCase();
    }
    return f('gender') === 'Female' ? 'S' : 'B';
  }, [reg, prof]);

  const genderVal = f('gender');
  const avatarBg = (genderVal === 'Female'
    ? 'linear-gradient(135deg, #b8860b, #f5c6cb)'
    : 'linear-gradient(135deg, #800020, #4A0404)') as string;

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', minHeight: '100vh' }}>
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <p className="font-body text-sm text-deep-maroon/50">Loading your dashboard…</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)',
        paddingTop: 'clamp(100px, 14vh, 160px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
        minHeight: '100vh',
      }}
    >
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 right-0 w-[300px] opacity-[0.04] z-0 pointer-events-none" />
      <div className="relative z-10 max-w-[980px] mx-auto px-6">
        {/* Back / Logout row */}
        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/60 transition-all duration-300 hover:bg-maroon/5 hover:border-maroon/25 hover:text-maroon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </Link>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-red-200 text-red-600 transition-all duration-300 hover:bg-red-50 hover:border-red-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>

        <div ref={headerRef} className="text-center mb-8">
          <span className="animate-item inline-block font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon mb-4 opacity-0">My Account</span>
          <h1 className="animate-item font-display font-normal text-deep-maroon opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Welcome Back</h1>
          <div className="animate-item w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-4 opacity-0" />
          <p className="animate-item font-body text-base text-deep-maroon/55 mt-4 max-w-[520px] mx-auto leading-relaxed opacity-0">
            Your profile is live. Manage it below and browse proposals matched with you, In Sha Allah.
          </p>
        </div>

        {/* ──── TASK 2: MY UPLOADED PROFILE CARD (Top of dashboard, user can SEE exactly what he submitted + what matches see) ──── */}
        <div
          ref={heroRef}
          className="rounded-3xl border border-maroon/8 bg-white shadow-xl overflow-hidden mb-8"
          style={{ boxShadow: '0 30px 60px -20px rgba(128,0,32,0.15)' }}
        >
          {/* Banner */}
          <div className="relative h-28 sm:h-36 overflow-hidden" style={{ background: `linear-gradient(135deg, #800020cc, #4A0404cc), url('/images/bg-floral.jpg') center/cover` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80" />
          </div>

          <div className="px-6 sm:px-10 pb-8 sm:pb-10">
            {/* Avatar + status row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-14 sm:-mt-16 relative z-10">
              {/* Avatar placeholder (upload profile picture visual) */}
              <div className="relative shrink-0">
                <div
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex items-center justify-center select-none"
                  style={{ background: avatarBg }}
                  title={applicantName || 'My profile photo'}
                >
                  <span className="font-display text-4xl sm:text-5xl text-white/95 drop-shadow">{initials}</span>
                </div>
                {/* status dot */}
                <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border border-maroon/10">
                  <span className="w-4 h-4 rounded-full bg-green-500" />
                </span>
              </div>

              <div className="flex-1 min-w-0 pb-2 sm:pb-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="font-display text-2xl sm:text-[1.75rem] text-deep-maroon break-words">{applicantName || 'My Profile'}</h2>
                  <span className="px-3 py-1 rounded-full font-body text-[11px] font-semibold uppercase tracking-wider" style={{ background: `${planColor}22`, color: '#4A0404', border: `1px solid ${planColor}55` }}>
                    {tierLabel}
                  </span>
                  {user?.membershipStatus === 'active' && (
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-body text-[11px] font-semibold uppercase tracking-wider border border-green-200">
                      ● Approved
                    </span>
                  )}
                </div>
                <p className="font-body text-sm text-deep-maroon/60 break-words">
                  {f('gender') || '—'}, {(f('age') || '—')} years · {f('location') || 'Location not set'} · {f('education') || 'Education pending'}
                </p>
                <p className="font-body text-xs text-deep-maroon/40 mt-1.5">
                  Login ID: <span className="font-semibold select-all">{user?.loginId || user?.username || '—'}</span>
                  {user?.approvedAt && <> · Approved: {new Date(user.approvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 shrink-0">
                <Link
                  to="/proposals"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-400 hover:scale-[1.02] hover:shadow-2xl whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#FFFFFF' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Browse Proposals
                </Link>
                <a
                  href={`https://wa.me/${footerContent.whatsapp.replace(/\s/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Assalamualaikum team Perfect Rishta,\nI would like to update my profile (${user?.loginId || ''}).\nName: ${applicantName}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase border border-gold/40 text-maroon transition-all duration-300 hover:bg-gold/5 whitespace-nowrap"
                >
                  ✏️ Update via WhatsApp
                </a>
              </div>
            </div>

            {/* 4 quick stats */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <StatCell label="Plan" value={tierLabel || 'Silver'} accent={planColor} />
              <StatCell label="Age" value={f('age') ? `${f('age')} yrs` : '—'} accent="#800020" />
              <StatCell label="Location" value={String(f('location') || '—').split(',')[0]} accent="#D4AF37" />
              <StatCell label="Profile" value="Live & Public" accent="#15803d" />
            </div>
          </div>
        </div>

        {/* ──── Detailed profile ──── */}
        <div ref={cardRef} className="rounded-3xl border border-maroon/8 bg-white shadow-xl p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-3 mb-7 pb-5 border-b border-maroon/8 flex-wrap">
            <SectionHeadingInline title="My Profile Details" />
            <span className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/5 border border-gold/20 text-[11px] font-semibold uppercase tracking-wider text-maroon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              Visible to Premium Members
            </span>
          </div>

          {/* Contact */}
          <SectionHeading title="Contact" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <InfoCell label="Full Name" value={applicantName || '—'} icon="flag" />
            <InfoCell label="Email" value={f('email') || '—'} icon="mail" />
            <InfoCell label="Phone" value={f('phone') || '—'} icon="phone" />
            <InfoCell label="Location" value={f('location') || '—'} icon="pin" />
            <InfoCell label="Nationality" value={f('nationality') || '—'} />
          </div>

          {/* Personal */}
          <SectionHeading title="Personal" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <InfoCell label="Gender" value={f('gender') || '—'} />
            <InfoCell label="Age" value={f('age') ? `${f('age')} years` : '—'} />
            <InfoCell label="Height" value={f('height') || '—'} />
            <InfoCell label="Marital Status" value={f('maritalStatus') || '—'} />
            <InfoCell label="Languages" value={f('languages') || '—'} />
            {f('disability') && <InfoCell label="Disability" value={f('disability')} />}
          </div>

          {/* Religious */}
          <SectionHeading title="Religious" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <InfoCell label="Religion" value={f('religion') || 'Islam'} />
            <InfoCell label="Sect" value={f('sect') || '—'} />
            <InfoCell label="Religious Practice" value={f('religiousExpectations') || 'Practice regularly'} />
            {f('hijabi') && f('hijabi') !== 'N/A' && <InfoCell label="Hijabi / Modesty" value={f('hijabi')} />}
            {f('beardStyle') && f('beardStyle') !== 'N/A' && <InfoCell label="Beard / Sunnah" value={f('beardStyle')} />}
          </div>

          {/* Education & Work */}
          <SectionHeading title="Education & Work" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <InfoCell label="Education" value={f('education') || '—'} />
            <InfoCell label="Occupation" value={f('occupation') || '—'} />
            {f('annualIncome') && <InfoCell label="Annual Income" value={f('annualIncome')} />}
            <InfoCell label="Smoker" value={f('smoker') || 'No'} />
          </div>

          {/* About Me */}
          {f('aboutMe') && (
            <>
              <SectionHeading title="About Me" />
              <div className="mb-8 p-5 rounded-2xl border border-maroon/5 bg-gradient-to-br from-cream/40 to-white">
                <p className="font-body text-sm text-deep-maroon/75 leading-relaxed whitespace-pre-line">{f('aboutMe')}</p>
              </div>
            </>
          )}

          {/* Partner Preferences */}
          <SectionHeading title="What I'm Looking For" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InfoCell label="Preferred Education" value={f('partnerEducation') || '—'} />
            <InfoCell label="Preferred Age" value={f('partnerAgeRange') || '—'} />
            <InfoCell label="Preferred Sect" value={f('partnerSect') || '—'} />
            <InfoCell label="Preferred Ethnicity" value={f('partnerEthnicity') || '—'} />
            <InfoCell label="Living Arrangement" value={f('partnerLivingArrangement') || '—'} />
            <InfoCell label="Willing to Relocate" value={f('partnerWillingRelocate') || f('willingToRelocate') || 'Flexible'} />
            <InfoCell label="Open to Divorcee" value={f('openToDivorcee') || 'No'} />
            <InfoCell label="Open to Widow(er)" value={f('openToWidow') || 'No'} />
          </div>
          {f('partnerDescription') && (
            <div className="mt-2 mb-8 p-5 rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/5 to-white">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-maroon mb-2">Additional Preferences</p>
              <p className="font-body text-sm text-deep-maroon/75 leading-relaxed whitespace-pre-line">{f('partnerDescription')}</p>
            </div>
          )}

          {/* Update CTA */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-gold/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm text-maroon font-medium mb-1">Need to change anything on your profile?</p>
              <p className="font-body text-xs text-deep-maroon/55 leading-relaxed">
                For any edits, contact our team on WhatsApp during UK office hours (9am–7pm GMT). Your privacy & data is fully protected.
              </p>
            </div>
            <a
              href={`https://wa.me/${footerContent.whatsapp.replace(/\s/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Assalamualaikum PerfectRishta team,\nMy Login ID is ${user?.loginId || ''}.\nName: ${applicantName}\n\nI need help updating my profile.`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase transition-all hover:scale-105 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 0 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="p-4 rounded-2xl border border-maroon/5 bg-white shadow-sm relative overflow-hidden">
      <span className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: accent }} />
      <p className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-maroon/60 mb-1 pl-1">{label}</p>
      <p className="font-display text-base text-deep-maroon pl-1 truncate">{value}</p>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-maroon to-deep-maroon flex items-center justify-center flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
      </span>
      <h3 className="font-display text-sm text-maroon font-medium tracking-wide uppercase">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-maroon/10 to-transparent" />
    </div>
  );
}

function SectionHeadingInline({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-yellow-700 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A0404" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
      </span>
      <h3 className="font-display text-base sm:text-lg text-deep-maroon font-semibold">{title}</h3>
    </div>
  );
}

function InfoCell({ label, value, icon }: { label: string; value: string; icon?: 'mail' | 'phone' | 'pin' | 'flag' }) {
  return (
    <div className="p-3.5 rounded-xl border border-maroon/5 bg-gradient-to-br from-cream/20 to-white flex items-start gap-3">
      {icon === 'mail' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      )}
      {icon === 'phone' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      )}
      {icon === 'pin' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      )}
      {icon === 'flag' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-maroon/60 mb-1">{label}</p>
        <p className="font-body text-sm text-deep-maroon/80 break-words leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
