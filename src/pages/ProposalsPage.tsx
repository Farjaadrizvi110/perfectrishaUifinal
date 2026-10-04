import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { footerContent } from '@/content/seoContent';
import { useAuth } from '@/hooks/useAuth';
import type { AuthUserPayload } from '@/hooks/useAuth';

gsap.registerPlugin(ScrollTrigger);

interface CurrentMember extends AuthUserPayload {
  plan: string;
  profileId: string;
  userId: string;
  joinedAt: string;
}

const SAFE_PATTERN = /[&<>"']/g;
const esc = (s: any): string => (s === undefined || s === null ? '' : String(s).replace(SAFE_PATTERN, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] || c));

function normKey(v: any): string {
  return String(v || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\p{L}\p{N}@+.-]/gu, '');
}

export default function ProposalsPage() {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [filter, setFilter] = useState('All');
  const [isPaidMember, setIsPaidMember] = useState(false);
  const [memberInfo, setMemberInfo] = useState<CurrentMember | null>(null);
  const [loaded, setLoaded] = useState(false);

  const meProfileId = memberInfo?.profileId || (authUser?.profileId as string) || '';
  const meUserId = memberInfo?.userId || authUser?.id || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    (async () => {
      const token = api.getToken();
      if (!token) {
        if (!cancelled) {
          setIsPaidMember(false);
          setMemberInfo(null);
          setProfiles([]);
          setLoaded(true);
        }
        return;
      }
      try {
        const meData: any = await api.auth.me();
        if (!meData || !meData?.user) throw new Error('Invalid me response');
        if (meData.user.membershipStatus !== 'active') {
          throw new Error('Inactive membership');
        }
        if (cancelled) return;
        const regId = meData.registration?._id || meData.registration?.id || meData.user.registrationId || '';
        const pid = meData.profile?._id || meData.profile?.id || regId || '';
        const uid = meData.user?.id || meData.user?._id || '';
        const meEmail = normKey(meData.registration?.email || meData.profile?.email || '');
        const mePhone = normKey(meData.registration?.phone || meData.profile?.phone || '');
        const meFirstName = normKey(meData.registration?.firstName || meData.profile?.firstName || '');
        const meLastName = normKey(meData.registration?.lastName || meData.profile?.lastName || '');
        setIsPaidMember(true);
        const info: CurrentMember = {
          plan: meData.user.membershipTier ? String(meData.user.membershipTier).charAt(0).toUpperCase() + String(meData.user.membershipTier).slice(1) : 'Silver',
          profileId: String(pid || ''),
          userId: String(uid || ''),
          joinedAt: meData.user.approvedAt || meData.user.createdAt || '',
          id: String(uid || ''),
          role: meData.user.role || 'member',
          loginId: meData.user.loginId,
          username: meData.user.username,
          membershipTier: meData.user.membershipTier,
          membershipStatus: meData.user.membershipStatus,
          email: meEmail || undefined,
          phone: mePhone || undefined,
          firstName: meFirstName || undefined,
          lastName: meLastName || undefined,
          registrationId: regId || undefined,
        };
        setMemberInfo(info);
        const profilesData: any = await api.profiles.list();
        const list: any[] = Array.isArray(profilesData?.profiles) ? profilesData.profiles : [];
        const ownIds = new Set<string>();
        if (pid) ownIds.add(normKey(pid));
        if (regId) ownIds.add(normKey(regId));
        if (uid) ownIds.add(normKey(uid));
        // User cannot send proposal/inquiry about themselves.
        // Defend against multiple possible matches — not only _id.
        // This way even if backend filtering fails (or is bypassed) for any reason,
        // frontend refuses to display or allow interaction with the user's own profile.
        const others = list.filter((p: any) => {
          const pId = normKey(p && (p._id || p.id));
          if (pId && ownIds.has(pId)) return false;
          const pEmail = normKey(p.email);
          if (pEmail && meEmail && pEmail === meEmail) return false;
          const pPhone = normKey(p.phone);
          if (pPhone && mePhone && pPhone === mePhone) return false;
          const pFirst = normKey(p.firstName);
          const pLast = normKey(p.lastName);
          if (meFirstName && meLastName && pFirst === meFirstName && pLast === meLastName) {
            // When matching full name, also require location/age match to avoid two different "Sameer Khan" entries.
            const pAge = normKey(p.age);
            const meAge = normKey(meData.registration?.age || meData.profile?.age || '');
            const pLocation = normKey(p.location);
            const meLocation = normKey(meData.registration?.location || meData.profile?.location || '');
            if ((meAge && pAge && meAge === pAge) || (meLocation && pLocation && meLocation === pLocation)) {
              return false;
            }
          }
          return true;
        });
        setProfiles(others);
      } catch (e: any) {
        try { logout(); } catch {}
        if (!cancelled) {
          setIsPaidMember(false);
          setMemberInfo(null);
          setProfiles([]);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    const id1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (headerRef.current) {
          const items = headerRef.current.querySelectorAll('.animate-item');
          gsap.fromTo(items, { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
              scrollTrigger: { trigger: headerRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
            });
        }
        if (gridRef.current && isPaidMember) {
          const cards = gridRef.current.children;
          gsap.fromTo(cards, { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
              scrollTrigger: { trigger: gridRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
            });
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(id1);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [navigate, isPaidMember]);

  const genders = ['All', 'Male', 'Female'];
  const filteredProfiles = useMemo(() => (
    filter === 'All' ? profiles : profiles.filter((p: any) => p.gender === filter)
  ), [profiles, filter]);

  const getInitials = (profile: any): string => {
    const f = String(profile.firstName || '').trim().charAt(0).toUpperCase();
    const l = String(profile.lastName || '').trim().charAt(0).toUpperCase();
    if (f || l) return (f || '') + (l || '');
    return profile.gender === 'Male' ? 'B' : 'S';
  };

  const displayName = (profile: any): string => {
    const bits = [profile.firstName, profile.lastName].filter(Boolean) as string[];
    return bits.length ? bits.join(' ').trim() : (profile.gender === 'Male' ? 'Male Proposal' : 'Female Proposal');
  };

  const profileIdMatch = (profile: any): boolean => {
    if (!meProfileId && !meUserId) return false;
    const pId = String((profile && (profile._id || profile.id)) || '').trim();
    return (!!pId && !!meProfileId && pId === meProfileId);
  };

  if (!loaded) {
    return (
      <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', minHeight: '100vh' }}>
        <div className="relative z-10 max-w-[600px] mx-auto px-6 text-center">
          <div className="inline-block w-8 h-8 border-2 border-maroon/15 border-t-maroon rounded-full animate-spin mb-4" />
          <p className="font-body text-sm text-deep-maroon/50">Loading proposals…</p>
        </div>
      </section>
    );
  }

  if (!isPaidMember) {
    return (
      <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', paddingBottom: 'clamp(60px, 8vh, 100px)', minHeight: '100vh' }}>
        <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 right-0 w-[380px] opacity-[0.04] z-0 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 max-w-[600px] mx-auto px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-maroon/10 to-gold/10 flex items-center justify-center mx-auto mb-8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="font-display text-3xl text-deep-maroon mb-4">Members Only</h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-6" />
          <p className="font-body text-base text-deep-maroon/60 leading-relaxed mb-4">
            This section is exclusively for approved members. Please sign in with the Login ID and Password provided after your profile is approved.
          </p>
          <p className="font-body text-sm text-deep-maroon/45 leading-relaxed mb-8">
            Don't have credentials yet? Register your profile for free — our team will review and approve within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="px-10 py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-400 hover:scale-105 hover:shadow-xl text-center" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#FFFFFF' }}>Sign In</Link>
            <Link to="/join" className="px-10 py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase border border-maroon/20 text-maroon transition-all duration-400 hover:bg-maroon hover:text-white text-center">Register Now</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(180deg, rgba(253,251,247,0.96) 0%, rgba(255,255,255,0.92) 35%, rgba(253,249,241,0.92) 65%, rgba(253,251,247,0.96) 100%),
          url('/images/bg-floral.jpg')
        `,
        backgroundSize: 'auto, 560px auto',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundPosition: 'center, top right 40px',
        paddingTop: 'clamp(100px, 14vh, 160px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
        minHeight: '100vh',
      }}>
      {/* Subtle ornate bottom-left flourish */}
      <img src="/images/bg-floral.jpg" alt="" className="absolute bottom-0 left-0 w-[360px] opacity-[0.035] z-0 pointer-events-none rotate-[190deg]" aria-hidden="true" />
      {/* Gold gradient rim (top edge) */}
      <div className="absolute top-0 inset-x-0 h-px z-0" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.45) 50%, transparent 100%)' }} />

      <div className="relative z-10 max-w-[1140px] mx-auto px-6">
        {/* Top toolbar: Back / Home / Dashboard / Logout */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/70 bg-white/60 backdrop-blur transition-all duration-300 hover:bg-white hover:text-maroon hover:border-maroon/25 hover:shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
              Back
            </button>
            <Link to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/70 bg-white/60 backdrop-blur transition-all duration-300 hover:bg-white hover:text-maroon hover:border-maroon/25 hover:shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              View Website
            </Link>
            <Link to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-white"
              style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
              Go to My Dashboard
            </Link>
          </div>
          <Link to="/login"
            onClick={(e) => {
              try {
                e.preventDefault();
                logout();
                setTimeout(() => navigate('/login', { replace: true }), 30);
              } catch {}
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase border border-red-200 text-red-600 bg-white/60 backdrop-blur transition-all duration-300 hover:bg-red-50 hover:border-red-300 hover:shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </Link>
        </div>

        <div ref={headerRef} className="text-center mb-10">
          <span className="animate-item inline-block font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon mb-4 opacity-0">Exclusive {memberInfo?.plan || 'Member'} Access</span>
          <h1 className="animate-item font-display font-normal text-deep-maroon opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Proposals</h1>
          <div className="animate-item w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-4 opacity-0" />
          <p className="animate-item font-body text-base text-deep-maroon/55 mt-4 max-w-[520px] mx-auto leading-relaxed opacity-0">
            As a {memberInfo?.plan} member, browse all approved matches below. Your own profile is automatically hidden so you never accidentally inquire about yourself.
          </p>
        </div>

        <div className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="font-body text-sm font-medium text-deep-maroon">{memberInfo?.plan} Member</span>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {genders.map((g) => (
            <button key={g} type="button" onClick={() => setFilter(g)} className="px-5 py-2 rounded-full font-body text-xs font-medium tracking-wide uppercase transition-all duration-300" style={{ background: filter === g ? 'linear-gradient(135deg, #800020, #4A0404)' : '#FFFFFF', color: filter === g ? '#FFFFFF' : '#4A0404', border: filter === g ? 'none' : '1px solid rgba(128, 0, 32, 0.15)' }}>{g}</button>
          ))}
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-maroon/5 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="font-display text-xl text-deep-maroon mb-2">No other proposals yet</h3>
            <p className="font-body text-sm text-deep-maroon/50">More profiles will appear here as new members are approved.</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => {
              const isSelf = profileIdMatch(profile);
              return (
                <div key={(profile && (profile._id || profile.id)) || Math.random()}
                  onClick={() => !isSelf && setSelectedProfile(profile)}
                  className={`group rounded-2xl border border-maroon/8 bg-white p-6 transition-all duration-400 ${isSelf ? 'opacity-60 grayscale pointer-events-none border-dashed border-maroon/20' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-gold/20'}`}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-lg text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>{getInitials(profile)}</div>
                    <div>
                      <h3 className="font-display text-lg text-deep-maroon font-normal group-hover:text-maroon transition-colors">{displayName(profile)}</h3>
                      <p className="font-body text-xs text-deep-maroon/50">{profile.age} years • {profile.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full font-body text-[10px] font-medium tracking-wide uppercase bg-maroon/5 text-maroon">{profile.gender}</span>
                    {profile.education && <span className="px-3 py-1 rounded-full font-body text-[10px] font-medium tracking-wide uppercase bg-gold/10 text-gold-dark" style={{ color: '#8B6914' }}>{profile.education}</span>}
                    {profile.occupation && <span className="px-3 py-1 rounded-full font-body text-[10px] font-medium tracking-wide uppercase bg-cream text-deep-maroon/60">{profile.occupation}</span>}
                    {profile.maritalStatus && <span className="px-3 py-1 rounded-full font-body text-[10px] font-medium tracking-wide uppercase bg-maroon/5 text-maroon">{profile.maritalStatus}</span>}
                    {profile.isPaid && <span className="px-3 py-1 rounded-full font-body text-[10px] font-medium tracking-wide uppercase bg-gold/20 text-maroon border border-gold/30">{profile.plan}</span>}
                  </div>
                  {profile.aboutMe && <p className="font-body text-sm text-deep-maroon/55 leading-relaxed line-clamp-3 mb-4">{esc(profile.aboutMe)}</p>}
                  <div className="flex items-center justify-between pt-4 border-t border-maroon/5">
                    <span className="font-body text-xs text-deep-maroon/40">{profile.isPaid ? 'Premium Member' : 'Member'}</span>
                    <span className="font-body text-xs font-medium text-maroon group-hover:text-gold transition-colors">{isSelf ? '• Your profile' : 'View Proposal →'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(74, 4, 4, 0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedProfile(null)}>
          <div className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-maroon/5 flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>{getInitials(selectedProfile)}</div>
              <div>
                <h2 className="font-display text-2xl text-deep-maroon">{displayName(selectedProfile)}</h2>
                <p className="font-body text-sm text-deep-maroon/50">{selectedProfile.age} years • {selectedProfile.gender} • {selectedProfile.location}</p>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-maroon/10 via-gold/30 to-transparent mb-6" />

            <div className="space-y-6">
              {/* Personal */}
              <div>
                <h4 className="font-display text-sm text-maroon font-normal mb-3 pb-2 border-b border-maroon/5">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProfile.height && <Detail label="Height" value={selectedProfile.height} />}
                  {selectedProfile.dob && <Detail label="Date of Birth" value={selectedProfile.dob} />}
                  {selectedProfile.languages && <Detail label="Languages" value={selectedProfile.languages} />}
                  {selectedProfile.nationality && <Detail label="Nationality" value={selectedProfile.nationality} />}
                  {selectedProfile.ethnicity && <Detail label="Ethnicity" value={selectedProfile.ethnicity} />}
                  {selectedProfile.disability && <Detail label="Disability" value={selectedProfile.disability} />}
                </div>
              </div>

              {/* Religious */}
              <div>
                <h4 className="font-display text-sm text-maroon font-normal mb-3 pb-2 border-b border-maroon/5">Religious Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProfile.religion && <Detail label="Religion" value={selectedProfile.religion} />}
                  {selectedProfile.sect && <Detail label="Sect" value={selectedProfile.sect} />}
                  {selectedProfile.hijabi && <Detail label="Hijabi" value={selectedProfile.hijabi} />}
                  {selectedProfile.beardStyle && <Detail label="Beard Style" value={selectedProfile.beardStyle} />}
                  {selectedProfile.religiousExpectations && <Detail label="Religious Expectations" value={selectedProfile.religiousExpectations} />}
                </div>
              </div>

              {/* Education & Employment */}
              <div>
                <h4 className="font-display text-sm text-maroon font-normal mb-3 pb-2 border-b border-maroon/5">Education & Employment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProfile.education && <Detail label="Education" value={selectedProfile.education} />}
                  {selectedProfile.occupation && <Detail label="Occupation" value={selectedProfile.occupation} />}
                  {selectedProfile.annualIncome && <Detail label="Annual Income" value={selectedProfile.annualIncome} />}
                </div>
              </div>

              {/* Lifestyle */}
              <div>
                <h4 className="font-display text-sm text-maroon font-normal mb-3 pb-2 border-b border-maroon/5">Lifestyle</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProfile.smoker && <Detail label="Smoking" value={selectedProfile.smoker} />}
                  {selectedProfile.drivingLicence && <Detail label="Driving Licence" value={selectedProfile.drivingLicence} />}
                  {selectedProfile.willingToRelocate && <Detail label="Willing to Relocate" value={selectedProfile.willingToRelocate} />}
                  {selectedProfile.hobbies && <Detail label="Hobbies" value={selectedProfile.hobbies} />}
                </div>
              </div>

              {/* Marital */}
              <div>
                <h4 className="font-display text-sm text-maroon font-normal mb-3 pb-2 border-b border-maroon/5">Marital Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProfile.maritalStatus && <Detail label="Marital Status" value={selectedProfile.maritalStatus} />}
                  {selectedProfile.secondWife && <Detail label="Second Wife" value={selectedProfile.secondWife} />}
                </div>
              </div>

              {/* About */}
              {selectedProfile.aboutMe && <Detail label="About Me" value={selectedProfile.aboutMe} full />}

              {/* Looking For */}
              {selectedProfile.partnerDescription && (
                <div>
                  <h4 className="font-display text-sm text-maroon font-normal mb-3 pb-2 border-b border-maroon/5">What I am Looking For</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProfile.partnerEducation && <Detail label="Education Level" value={selectedProfile.partnerEducation} />}
                    {selectedProfile.partnerOccupation && <Detail label="Occupation" value={selectedProfile.partnerOccupation} />}
                    {selectedProfile.partnerSect && <Detail label="Sect" value={selectedProfile.partnerSect} />}
                    {selectedProfile.partnerReligiousPractice && <Detail label="Religious Practice" value={selectedProfile.partnerReligiousPractice} />}
                    {selectedProfile.partnerAgeRange && <Detail label="Age Range" value={selectedProfile.partnerAgeRange} />}
                    {selectedProfile.partnerEthnicity && <Detail label="Ethnicity" value={selectedProfile.partnerEthnicity} />}
                    {selectedProfile.partnerLivingArrangement && <Detail label="Living Arrangement" value={selectedProfile.partnerLivingArrangement} />}
                    {selectedProfile.partnerWillingRelocate && <Detail label="Willing to Relocate" value={selectedProfile.partnerWillingRelocate} />}
                    {selectedProfile.openToDivorcee && <Detail label="Open to Divorcee" value={selectedProfile.openToDivorcee} />}
                    {selectedProfile.openToWidow && <Detail label="Open to Widow/Widower" value={selectedProfile.openToWidow} />}
                    {selectedProfile.acceptChildren && <Detail label="Accept Children" value={selectedProfile.acceptChildren} />}
                  </div>
                  {selectedProfile.partnerDescription && <Detail label="Description" value={selectedProfile.partnerDescription} full />}
                  {selectedProfile.partnerIslamicValues && <Detail label="Islamic Values" value={selectedProfile.partnerIslamicValues} full />}
                </div>
              )}

              {selectedProfile.otherInfo && <Detail label="Other Information" value={selectedProfile.otherInfo} full />}

              {/* Contact — blurred + locked, click → WhatsApp manager request */}
              {(selectedProfile.email || selectedProfile.phone) && (() => {
                const isSelf = profileIdMatch(selectedProfile);
                return (
                  <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-gold/10 p-5">
                    <h4 className="font-display text-sm text-maroon font-normal mb-4 pb-2 border-b border-maroon/5 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      {isSelf ? 'Your Own Profile' : 'Contact Information (Locked)'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {selectedProfile.email && (
                        <div className="p-3 rounded-xl border border-maroon/10 bg-white">
                          <p className="font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-maroon/60 mb-1">Email</p>
                          <p className="font-body text-sm text-deep-maroon/80 select-none" style={{ filter: 'blur(6px)', letterSpacing: '0.15em' }}>••••••••••@•••••.com</p>
                        </div>
                      )}
                      {selectedProfile.phone && (
                        <div className="p-3 rounded-xl border border-maroon/10 bg-white">
                          <p className="font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-maroon/60 mb-1">Phone / WhatsApp</p>
                          <p className="font-body text-sm text-deep-maroon/80 select-none" style={{ filter: 'blur(6px)', letterSpacing: '0.15em' }}>+•• •••• ••••••</p>
                        </div>
                      )}
                    </div>
                    <p className="font-body text-[11px] text-deep-maroon/55 mb-4 leading-relaxed">
                      {isSelf
                        ? 'This is your own profile — you cannot send an inquiry to yourself. Please view another profile to request contact details.'
                        : 'Contact details are kept private for your safety. Click below to request this profile\'s details via our WhatsApp team — we will verify and share the number personally.'}
                    </p>
                  </div>
                );
              })()}

              <div className="w-full h-px bg-gradient-to-r from-maroon/10 via-gold/30 to-transparent" />

              <div className="flex flex-col sm:flex-row gap-3">
                {(() => {
                  const isSelf = profileIdMatch(selectedProfile);
                  return (
                    <>
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => {
                          if (isSelf) return;
                          const url = buildWhatsAppRequest(selectedProfile);
                          try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {}
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-body text-sm font-semibold tracking-[0.08em] uppercase transition-all ${isSelf ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500 border border-gray-200' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                        style={isSelf ? {} : { background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#FFFFFF' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        {isSelf ? 'This is Your Own Profile' : 'Request Contact via WhatsApp'}
                      </button>
                      <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 py-3 rounded-full font-body text-sm font-semibold tracking-[0.08em] uppercase border border-maroon/20 text-maroon hover:bg-maroon hover:text-white transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        My Dashboard
                      </Link>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value, full = false }: { label: string; value: any; full?: boolean }) {
  const v = value === undefined || value === null || value === '' ? '—' : String(value);
  return (
    <div className={full ? 'col-span-full' : ''}>
      <p className="font-body text-[10px] font-medium tracking-wide uppercase text-maroon/70 mb-0.5">{label}</p>
      <p className="font-body text-sm text-deep-maroon/80 whitespace-pre-wrap break-words">{esc(v)}</p>
    </div>
  );
}

/**
 * Build a wa.me deep link with the profile's full details so the
 * WhatsApp manager (+44 7359 859455) can review and share the contact number.
 * Self-profiles never reach this path; they are disabled at render time.
 */
function buildWhatsAppRequest(profile: any): string {
  const manager = String(footerContent.whatsapp || '+44 7359 859455').replace(/\s/g, '').replace(/^\+/, '');
  const profileId = String(profile._id || profile.id || 'N/A');
  const lines: string[] = [];
  lines.push('Assalamualaikum PerfectRishta team,');
  lines.push('');
  lines.push('I am interested in the profile below and request their contact details:');
  lines.push('');
  lines.push(`🔹 Profile ID: ${profileId}`);
  lines.push(`🔹 Full Name: ${[profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || (profile.gender ? `${profile.gender} profile` : 'N/A')}`);
  lines.push(`🔹 Gender: ${profile.gender || 'N/A'}`);
  lines.push(`🔹 Age: ${profile.age || 'N/A'}`);
  lines.push(`🔹 Location: ${profile.location || 'N/A'}`);
  lines.push(`🔹 Education: ${profile.education || 'N/A'}`);
  lines.push(`🔹 Occupation: ${profile.occupation || 'N/A'}`);
  lines.push(`🔹 Marital Status: ${profile.maritalStatus || 'N/A'}`);
  lines.push(`🔹 Plan: ${profile.plan || 'N/A'}`);
  if (profile.nationality) lines.push(`🔹 Nationality: ${profile.nationality}`);
  if (profile.sect) lines.push(`🔹 Sect: ${profile.sect}`);
  if (profile.height) lines.push(`🔹 Height: ${profile.height}`);
  lines.push('');
  lines.push('Please can you share the phone/WhatsApp number of this profile with me? Jazak Allah khair.');
  const text = lines.map(l => encodeURIComponent(l)).join('%0A');
  return `https://wa.me/${manager}?text=${text}`;
}
