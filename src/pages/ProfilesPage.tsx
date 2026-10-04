import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

/**
 * Task 5 + Task 6: No guest user access to profiles.
 * Visitors without token → /login.
 * Authenticated users → /proposals (the premium-gated browse page).
 * Rejected users never appear since /api/profiles only surfaces isActive: true
 *   and Profile docs are never created for rejected registrations.
 */
export default function ProfilesPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    const go = async () => {
      const token = api.getToken();
      if (!token) {
        logout();
        setTimeout(() => navigate('/login', { replace: true }), 0);
        return;
      }
      try {
        // Validate the token actually works BEFORE sending member to proposals.
        // If backend returns 401 → wipe token immediately so member cannot see proposals.
        const me: any = await api.auth.me();
        if (!me || !me.user || me.user.membershipStatus !== 'active') {
          logout();
          setTimeout(() => navigate('/login', { replace: true }), 0);
          return;
        }
        navigate('/proposals', { replace: true });
      } catch (e: any) {
        logout();
        setTimeout(() => navigate('/login', { replace: true }), 20);
      }
    };
    go();
  }, [navigate, logout]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)',
        paddingTop: 'clamp(100px, 14vh, 160px)',
        minHeight: '100vh',
      }}
    >
      <div className="max-w-[900px] mx-auto px-6 text-center">
        <p className="font-body text-sm text-deep-maroon/50">Redirecting…</p>
      </div>
    </section>
  );
}
