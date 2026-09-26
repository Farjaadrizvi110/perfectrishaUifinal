import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

/**
 * Task 5 + Task 6: No guest user access to profiles.
 * Visitors without token → /login.
 * Authenticated users → /proposals (the premium-gated browse page).
 * Rejected users never appear since /api/profiles only surfaces isActive: true
 *   and Profile docs are never created for rejected registrations.
 */
export default function ProfilesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = api.getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    navigate('/proposals', { replace: true });
  }, [navigate]);

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
