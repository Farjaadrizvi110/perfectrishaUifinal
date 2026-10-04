import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { api, setToken } from '@/lib/api';

export interface AuthUserPayload {
  id: string;
  role: 'admin' | 'member' | string;
  loginId?: string;
  username?: string;
  membershipTier?: string;
  membershipStatus?: string;
  approvedAt?: string;
  lastLoginAt?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  plan?: string;
  profileId?: string;
  registrationId?: string;
}

const STORAGE_KEY = 'perfectrishta_current_user';

type Listener = () => void;
type StoreState = {
  user: AuthUserPayload | null;
  loading: boolean;
};

function readCache(): AuthUserPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as AuthUserPayload) : null;
  } catch {
    return null;
  }
}

function writeCache(user: AuthUserPayload | null) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

function extractFromMe(me: any): AuthUserPayload | null {
  if (!me || !me?.user) return null;
  const u = me.user;
  const registration = me.registration || {};
  const profile = me.profile || {};
  const firstName: string =
    String(registration.firstName || profile.firstName || u.firstName || '').trim();
  const lastName: string =
    String(registration.lastName || profile.lastName || u.lastName || '').trim();
  return {
    id: String(u.id || u._id || ''),
    role: String(u.role || 'member'),
    loginId: u.loginId ? String(u.loginId) : undefined,
    username: u.username ? String(u.username) : undefined,
    membershipTier: u.membershipTier ? String(u.membershipTier) : undefined,
    membershipStatus: u.membershipStatus ? String(u.membershipStatus) : undefined,
    approvedAt: u.approvedAt ? String(u.approvedAt) : undefined,
    lastLoginAt: u.lastLoginAt ? String(u.lastLoginAt) : undefined,
    firstName,
    lastName,
    email: String(registration.email || profile.email || u.email || '').trim() || undefined,
    phone: String(registration.phone || profile.phone || u.phone || '').trim() || undefined,
    plan: String(registration.plan || profile.plan || u.plan || 'Silver'),
    profileId: String(profile._id || profile.id || '').trim() || undefined,
    registrationId:
      String(registration._id || registration.id || u.registrationId || '').trim() || undefined,
  };
}

const listeners = new Set<Listener>();
let state: StoreState = (() => {
  const token = api.getToken();
  const cached = token ? readCache() : null;
  return { user: cached ?? null, loading: !!(token && !cached) };
})();

function getState(): StoreState {
  return state;
}

function setState(partial: Partial<StoreState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let refreshInFlight: Promise<AuthUserPayload | null> | null = null;
async function refreshInternal(): Promise<AuthUserPayload | null> {
  const token = api.getToken();
  if (!token) {
    writeCache(null);
    setState({ user: null, loading: false });
    return null;
  }
  try {
    const me = await api.auth.me();
    const mapped = extractFromMe(me);
    writeCache(mapped);
    setState({ user: mapped, loading: false });
    return mapped;
  } catch (e) {
    try { api.logout(); } catch {}
    writeCache(null);
    setState({ user: null, loading: false });
    return null;
  } finally {
    refreshInFlight = null;
  }
}

function logoutInternal() {
  try { api.logout(); } catch {}
  writeCache(null);
  setState({ user: null, loading: false });
}

function hydrateFromLoginResponseInternal(payload: any) {
  if (!payload?.token || !payload?.user) return;
  setToken(payload.token);
  const u = payload.user;
  const next: AuthUserPayload = {
    id: String(u.id || u._id || ''),
    role: String(u.role || 'member'),
    loginId: u.loginId ? String(u.loginId) : undefined,
    username: u.username ? String(u.username) : undefined,
    membershipTier: u.membershipTier ? String(u.membershipTier) : undefined,
    membershipStatus: u.membershipStatus ? String(u.membershipStatus) : undefined,
    firstName: String(u.firstName || '').trim() || undefined,
    lastName: String(u.lastName || '').trim() || undefined,
    approvedAt: u.approvedAt ? String(u.approvedAt) : undefined,
  };
  writeCache(next);
  setState({ user: next, loading: false });
  if (!refreshInFlight) refreshInFlight = refreshInternal();
  void refreshInFlight;
}

export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, getState, getState);
  const { user, loading } = snapshot;

  // Kick off refresh once if loading=true on mount.
  const [didInit, setDidInit] = useState(false);
  useEffect(() => {
    if (didInit) return;
    setDidInit(true);
    if (loading && !refreshInFlight) {
      refreshInFlight = refreshInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    if (!refreshInFlight) refreshInFlight = refreshInternal();
    return refreshInFlight;
  }, []);

  const logout = useCallback(() => {
    logoutInternal();
  }, []);

  const hydrateFromLoginResponse = useCallback((payload: any) => {
    hydrateFromLoginResponseInternal(payload);
  }, []);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  const displayName =
    (user?.firstName && user?.lastName)
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.loginId || user?.username || (isAdmin ? 'Admin' : 'Member');
  const initials = (() => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    if (user?.loginId) {
      return String(user.loginId).slice(0, 2).toUpperCase();
    }
    if (user?.username) {
      return String(user.username).slice(0, 2).toUpperCase();
    }
    return isAdmin ? 'AD' : 'ME';
  })();

  return {
    user,
    loading,
    refresh,
    logout,
    hydrateFromLoginResponse,
    isLoggedIn,
    isAdmin,
    isMember,
    displayName,
    initials,
  };
}
