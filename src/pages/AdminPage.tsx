import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useRef } from 'react';

interface PendingProfile {
  id: string;
  gender: string;
  age: string;
  location: string;
  education: string;
  occupation: string;
  maritalStatus: string;
  aboutMe: string;
  plan: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export default function AdminPage() {
  const listRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [generatedCred, setGeneratedCred] = useState<{ loginId: string; password: string } | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = () => {
    const stored = JSON.parse(localStorage.getItem('perfectrishta_profiles') || '[]');
    setProfiles(stored);
    const users = JSON.parse(localStorage.getItem('perfectrishta_users') || '[]');
    setApprovedUsers(users);
  };

  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(listRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
    }
  }, [activeTab, profiles]);

  const generateCredentials = () => {
    const loginId = 'PR-' + Math.floor(1000 + Math.random() * 9000);
    const password = Math.random().toString(36).slice(-8);
    return { loginId, password };
  };

  const handleApprove = (profile: PendingProfile) => {
    setApproving(profile.id);
    const cred = generateCredentials();

    setTimeout(() => {
      // Update profile status
      const updated = profiles.map(p => p.id === profile.id ? { ...p, status: 'approved' as const } : p);
      setProfiles(updated);
      localStorage.setItem('perfectrishta_profiles', JSON.stringify(updated));

      // Create user account
      const users = JSON.parse(localStorage.getItem('perfectrishta_users') || '[]');
      const newUser = {
        loginId: cred.loginId,
        password: cred.password,
        profileId: profile.id,
        name: profile.aboutMe ? profile.aboutMe.split(' ').slice(0, 3).join(' ') : 'Member',
        plan: profile.plan,
        approvedAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('perfectrishta_users', JSON.stringify(users));
      setApprovedUsers(users);

      setGeneratedCred(cred);
      setApproving(null);
    }, 1200);
  };

  const pendingProfiles = profiles.filter(p => p.status !== 'approved');
  const approvedProfiles = profiles.filter(p => p.status === 'approved');

  return (
    <section className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', paddingBottom: 'clamp(60px, 8vh, 100px)', minHeight: '100vh' }}>
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 right-0 w-[300px] opacity-[0.04] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        <div className="flex justify-start mb-6">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/60 transition-all duration-300 hover:bg-maroon/5 hover:border-maroon/25 hover:text-maroon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl text-deep-maroon font-light">Admin <span className="font-medium text-gold">Dashboard</span></h1>
          <p className="font-body text-sm text-deep-maroon/50 mt-2">Manage profile registrations and member approvals</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => { setActiveTab('pending'); setGeneratedCred(null); }}
            className="px-6 py-2.5 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase transition-all duration-300"
            style={{
              background: activeTab === 'pending' ? '#800020' : 'rgba(128,0,32,0.06)',
              color: activeTab === 'pending' ? '#fff' : '#800020',
            }}
          >
            Pending ({pendingProfiles.length})
          </button>
          <button
            onClick={() => { setActiveTab('approved'); setGeneratedCred(null); }}
            className="px-6 py-2.5 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase transition-all duration-300"
            style={{
              background: activeTab === 'approved' ? '#800020' : 'rgba(128,0,32,0.06)',
              color: activeTab === 'approved' ? '#fff' : '#800020',
            }}
          >
            Approved ({approvedProfiles.length})
          </button>
        </div>

        {/* Generated Credentials Banner */}
        {generatedCred && (
          <div className="mb-8 p-6 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/5 to-gold/10 text-center">
            <p className="font-body text-xs tracking-[0.15em] uppercase text-deep-maroon/50 mb-2">Credentials Generated</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <div className="px-5 py-2.5 rounded-xl bg-white border border-gold/20">
                <span className="font-body text-[11px] text-deep-maroon/40 block">Login ID</span>
                <span className="font-body text-lg font-semibold text-deep-maroon tracking-wider">{generatedCred.loginId}</span>
              </div>
              <div className="px-5 py-2.5 rounded-xl bg-white border border-gold/20">
                <span className="font-body text-[11px] text-deep-maroon/40 block">Password</span>
                <span className="font-body text-lg font-semibold text-deep-maroon tracking-wider">{generatedCred.password}</span>
              </div>
            </div>
            <p className="font-body text-xs text-deep-maroon/50">Share these credentials with the member so they can log in and view proposals.</p>
          </div>
        )}

        {/* Profile List */}
        <div ref={listRef} className="space-y-4">
          {activeTab === 'pending' && pendingProfiles.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-maroon/8 bg-white">
              <p className="font-body text-sm text-deep-maroon/40">No pending registrations</p>
            </div>
          )}
          {activeTab === 'approved' && approvedProfiles.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-maroon/8 bg-white">
              <p className="font-body text-sm text-deep-maroon/40">No approved members yet</p>
            </div>
          )}

          {(activeTab === 'pending' ? pendingProfiles : approvedProfiles).map((profile) => (
            <div key={profile.id} className="rounded-2xl border border-maroon/8 bg-white shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
                <span className="font-display text-lg text-gold">{profile.gender === 'Male' ? 'B' : 'S'}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-body text-sm font-semibold text-deep-maroon">{profile.gender}, {profile.age}</h3>
                  <span className="px-2.5 py-0.5 rounded-full font-body text-[10px] font-medium" style={{ background: profile.plan === 'Silver' ? '#C0C0C0' : profile.plan === 'Gold' ? '#D4AF37' : '#E5E4E2', color: '#4A0404' }}>{profile.plan}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-body text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {profile.status === 'approved' ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <p className="font-body text-xs text-deep-maroon/50 mt-1">{profile.location} &middot; {profile.education || 'N/A'} &middot; {profile.occupation || 'N/A'}</p>
                <p className="font-body text-[11px] text-deep-maroon/35 mt-1">Registered: {new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>

              {/* Actions */}
              {activeTab === 'pending' && (
                <button
                  onClick={() => handleApprove(profile)}
                  disabled={approving === profile.id}
                  className="px-6 py-2.5 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase transition-all duration-300 hover:scale-105 disabled:opacity-50 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#fff' }}
                >
                  {approving === profile.id ? 'Approving...' : 'Approve'}
                </button>
              )}
              {activeTab === 'approved' && (
                <div className="shrink-0 text-right">
                  {(() => {
                    const user = approvedUsers.find((u: any) => u.profileId === profile.id);
                    return user ? (
                      <div className="text-xs">
                        <span className="font-body text-deep-maroon/50">ID: </span>
                        <span className="font-body font-semibold text-deep-maroon">{user.loginId}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
