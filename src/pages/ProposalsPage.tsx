import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CurrentMember {
  plan: string;
  profileId: string;
  joinedAt: string;
}

export default function ProposalsPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [filter, setFilter] = useState('All');
  const [isPaidMember, setIsPaidMember] = useState(false);
  const [memberInfo, setMemberInfo] = useState<CurrentMember | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const member = localStorage.getItem('perfectrishta_current_member');
    if (member) {
      setIsPaidMember(true);
      setMemberInfo(JSON.parse(member));
    }
    const stored = JSON.parse(localStorage.getItem('perfectrishta_profiles') || '[]');
    setProfiles(stored.reverse());

    if (headerRef.current) {
      const items = headerRef.current.querySelectorAll('.animate-item');
      gsap.fromTo(items, { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
        });
    }
    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(cards, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  const genders = ['All', 'Male', 'Female'];
  const filteredProfiles = filter === 'All' ? profiles : profiles.filter(p => p.gender === filter);

  const getInitials = (profile: any) => {
    return profile.gender === 'Male' ? 'B' : 'S';
  };

  if (!isPaidMember) {
    return (
      <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', paddingBottom: 'clamp(60px, 8vh, 100px)', minHeight: '100vh' }}>
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
    <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', paddingBottom: 'clamp(60px, 8vh, 100px)', minHeight: '100vh' }}>
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 right-0 w-[300px] opacity-[0.04] z-0 pointer-events-none" />
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <div ref={headerRef} className="text-center mb-10">
          <span className="animate-item inline-block font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon mb-4 opacity-0">Exclusive Access</span>
          <h1 className="animate-item font-display font-normal text-deep-maroon opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Proposals</h1>
          <div className="animate-item w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-4 opacity-0" />
          <p className="animate-item font-body text-base text-deep-maroon/55 mt-4 max-w-[480px] mx-auto leading-relaxed opacity-0">As a {memberInfo?.plan} member, you have full access to view and connect with all proposals.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="font-body text-sm font-medium text-deep-maroon">{memberInfo?.plan} Member</span>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {genders.map((g) => (
            <button key={g} onClick={() => setFilter(g)} className="px-5 py-2 rounded-full font-body text-xs font-medium tracking-wide uppercase transition-all duration-300" style={{ background: filter === g ? 'linear-gradient(135deg, #800020, #4A0404)' : '#FFFFFF', color: filter === g ? '#FFFFFF' : '#4A0404', border: filter === g ? 'none' : '1px solid rgba(128, 0, 32, 0.15)' }}>{g}</button>
          ))}
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-maroon/5 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="font-display text-xl text-deep-maroon mb-2">No proposals yet</h3>
            <p className="font-body text-sm text-deep-maroon/50">Profiles will appear here once members join.</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} onClick={() => setSelectedProfile(profile)} className="group rounded-2xl border border-maroon/8 bg-white p-6 cursor-pointer transition-all duration-400 hover:-translate-y-1 hover:shadow-lg hover:border-gold/20 opacity-0">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-lg text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>{getInitials(profile)}</div>
                  <div>
                    <h3 className="font-display text-lg text-deep-maroon font-normal group-hover:text-maroon transition-colors">{profile.gender === 'Male' ? 'Brother' : 'Sister'} Profile</h3>
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
                {profile.aboutMe && <p className="font-body text-sm text-deep-maroon/55 leading-relaxed line-clamp-3 mb-4">{profile.aboutMe}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-maroon/5">
                  <span className="font-body text-xs text-deep-maroon/40">{profile.isPaid ? 'Premium Member' : 'Member'}</span>
                  <span className="font-body text-xs font-medium text-maroon group-hover:text-gold transition-colors">View Proposal &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Detail Modal for Paid Members */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(74, 4, 4, 0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedProfile(null)}>
          <div className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-maroon/5 flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>{getInitials(selectedProfile)}</div>
              <div>
                <h2 className="font-display text-2xl text-deep-maroon">{selectedProfile.gender === 'Male' ? 'Brother' : 'Sister'} Proposal</h2>
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

              <div className="w-full h-px bg-gradient-to-r from-maroon/10 via-gold/30 to-transparent" />

              <div className="flex flex-col sm:flex-row gap-3">
                <a href={`mailto:${selectedProfile.email}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-body text-sm font-semibold tracking-[0.08em] uppercase transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#FFFFFF' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Send Proposal
                </a>
                {selectedProfile.phone && (
                  <a href={`tel:${selectedProfile.phone}`} className="flex items-center justify-center gap-2 py-3 rounded-full font-body text-sm font-semibold tracking-[0.08em] uppercase border border-maroon/20 text-maroon hover:bg-maroon hover:text-white transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-full' : ''}>
      <p className="font-body text-[10px] font-medium tracking-wide uppercase text-maroon/70 mb-0.5">{label}</p>
      <p className="font-body text-sm text-deep-maroon/80">{value}</p>
    </div>
  );
}
