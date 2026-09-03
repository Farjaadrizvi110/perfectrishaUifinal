import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Profile {
  id: string;
  gender: string;
  age: string;
  height: string;
  location: string;
  nationality: string;
  ethnicity: string;
  sect: string;
  education: string;
  occupation: string;
  maritalStatus: string;
  aboutMe: string;
  hobbies: string;
  plan: string;
  isPaid: boolean;
  createdAt: string;
}

export default function ProfilesPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
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
    const name = profile.gender === 'Male' ? 'Brother' : 'Sister';
    return name[0];
  };

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
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Back button */}
        <div className="flex justify-start mb-6">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/60 transition-all duration-300 hover:bg-maroon/5 hover:border-maroon/25 hover:text-maroon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </Link>
        </div>

        <div ref={headerRef} className="text-center mb-10">
          <span className="animate-item inline-block font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon mb-4 opacity-0">Browse Members</span>
          <h1 className="animate-item font-display font-normal text-deep-maroon opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Member Profiles</h1>
          <div className="animate-item w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-4 opacity-0" />
          <p className="animate-item font-body text-base text-deep-maroon/55 mt-4 max-w-[480px] mx-auto leading-relaxed opacity-0">Browse verified profiles of members looking for their perfect match.</p>
        </div>

        <div className="flex justify-center mb-8">
          <Link to="/join" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm font-semibold tracking-[0.08em] uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#FFFFFF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Your Profile
          </Link>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {genders.map((g) => (
            <button key={g} onClick={() => setFilter(g)} className="px-5 py-2 rounded-full font-body text-xs font-medium tracking-wide uppercase transition-all duration-300" style={{ background: filter === g ? 'linear-gradient(135deg, #800020, #4A0404)' : '#FFFFFF', color: filter === g ? '#FFFFFF' : '#4A0404', border: filter === g ? 'none' : '1px solid rgba(128, 0, 32, 0.15)' }}>
              {g}
            </button>
          ))}
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-maroon/5 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="font-display text-xl text-deep-maroon mb-2">No profiles yet</h3>
            <p className="font-body text-sm text-deep-maroon/50 mb-6">Be the first to add your profile.</p>
            <Link to="/join" className="inline-block px-8 py-3 rounded-full font-body text-sm font-semibold tracking-[0.08em] uppercase border border-maroon/20 text-maroon hover:bg-maroon hover:text-white transition-all duration-300">Add Profile</Link>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} onClick={() => setSelectedProfile(profile)} className="group rounded-2xl border border-maroon/8 bg-white p-6 cursor-pointer transition-all duration-400 hover:-translate-y-1 hover:shadow-lg hover:border-gold/20 opacity-0">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-lg text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
                    {getInitials(profile)}
                  </div>
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
                </div>
                {profile.aboutMe && <p className="font-body text-sm text-deep-maroon/55 leading-relaxed line-clamp-3 mb-4">{profile.aboutMe}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-maroon/5">
                  <span className="font-body text-xs text-deep-maroon/40">Member</span>
                  <span className="font-body text-xs font-medium text-maroon group-hover:text-gold transition-colors">View Profile &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(74, 4, 4, 0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedProfile(null)}>
          <div className="relative w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-maroon/5 flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>{getInitials(selectedProfile)}</div>
              <div>
                <h2 className="font-display text-2xl text-deep-maroon">{selectedProfile.gender === 'Male' ? 'Brother' : 'Sister'} Profile</h2>
                <p className="font-body text-sm text-deep-maroon/50">{selectedProfile.age} years • {selectedProfile.gender} • {selectedProfile.location}</p>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-maroon/10 via-gold/30 to-transparent mb-6" />
            <div className="space-y-4">
              {selectedProfile.height && <Detail label="Height" value={selectedProfile.height} />}
              {selectedProfile.nationality && <Detail label="Nationality" value={selectedProfile.nationality} />}
              {selectedProfile.ethnicity && <Detail label="Ethnicity" value={selectedProfile.ethnicity} />}
              {selectedProfile.sect && <Detail label="Sect" value={selectedProfile.sect} />}
              {selectedProfile.education && <Detail label="Education" value={selectedProfile.education} />}
              {selectedProfile.occupation && <Detail label="Occupation" value={selectedProfile.occupation} />}
              {selectedProfile.maritalStatus && <Detail label="Marital Status" value={selectedProfile.maritalStatus} />}
              {selectedProfile.hobbies && <Detail label="Hobbies" value={selectedProfile.hobbies} />}
              {selectedProfile.aboutMe && <Detail label="About Me" value={selectedProfile.aboutMe} />}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-body text-xs font-medium tracking-wide uppercase text-maroon mb-1">{label}</p>
      <p className="font-body text-sm text-deep-maroon/70">{value}</p>
    </div>
  );
}
