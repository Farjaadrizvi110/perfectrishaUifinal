/**
 * PerfectRishta API client — connects frontend to backend.
 * Uses Vite proxy in dev (/api → http://localhost:5000)
 * and direct URL in production via VITE_API_URL env.
 */

const PRODUCTION_BACKEND_FALLBACK = "https://perfectrisha-backend.vercel.app/api";

function sanitizeBaseUrl(raw: string | undefined): string {
  if (!raw) {
    if (import.meta.env.MODE === "production") {
      console.info(
        "[api.ts] VITE_API_URL not set in production; using built-in production fallback:",
        PRODUCTION_BACKEND_FALLBACK,
      );
      return PRODUCTION_BACKEND_FALLBACK;
    }
    return "/api";
  }
  let url = String(raw).trim();
  while (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  const LEGACY_PREFIXES = [
    "/perfectrishtaback-end/api",
    "/perfectrishtabackend/api",
    "/perfectrishta-back-end/api",
    "/perfectrishtaback-end",
    "/perfectrishtabackend",
    "/perfectrishta-back-end",
  ];
  for (const p of LEGACY_PREFIXES) {
    if (url === p) return "/api";
    if (url.startsWith(`${p}/`)) return `/api${url.slice(p.length)}`;
  }
  if (!url) {
    if (import.meta.env.MODE === "production") return PRODUCTION_BACKEND_FALLBACK;
    return "/api";
  }
  if (url === "/api" || url.startsWith("/api/")) return url;
  // Allow trusted remote backends on Vercel / custom domain when user wants separate backend deploy
  try {
    const u = new URL(url);
    const allowedHostPatterns = [
      ".vercel.app",
      "perfectrishta.co.uk",
      "www.perfectrishta.co.uk",
      "localhost",
      "127.0.0.1",
    ];
    const hostOk = allowedHostPatterns.some(
      (p) => u.hostname === p || u.hostname.endsWith(p),
    );
    // If URL path includes cPanel mount → strip but keep host
    let pathName = u.pathname;
    for (const p of LEGACY_PREFIXES) {
      if (pathName.startsWith(p)) {
        pathName = `/api${pathName.slice(p.length)}`;
        break;
      }
    }
    if (
      pathName === "/" ||
      (!pathName.endsWith("/api") && !pathName.startsWith("/api/"))
    ) {
      if (!pathName.endsWith("/api")) {
        pathName = pathName.replace(/\/$/, "") + "/api";
      }
    }
    if (hostOk) {
      return `${u.protocol}//${u.host}${pathName}`;
    }
    if (import.meta.env.MODE === "production") return PRODUCTION_BACKEND_FALLBACK;
    return "/api";
  } catch {
    if (import.meta.env.MODE === "production" && !url) return PRODUCTION_BACKEND_FALLBACK;
    return url || "/api";
  }
}

const BASE_URL = sanitizeBaseUrl(import.meta.env.VITE_API_URL);

if (typeof window !== "undefined") {
  console.debug("[api.ts] Computed BASE_URL:", BASE_URL);
}

export function getToken(): string | null {
  return localStorage.getItem("perfectrishta_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('perfectrishta_token', token);
  else {
    localStorage.removeItem('perfectrishta_token');
    localStorage.removeItem('perfectrishta_current_member');
    localStorage.removeItem('perfectrishta_current_user');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }

  return data as T;
}

export const api = {
  // ── Auth ──
  auth: {
    register: (formData: Record<string, any>) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(formData) }),

    login: (loginId: string, password: string) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginId, password }),
      }),

    adminLogin: (username: string, password: string) =>
      request<{ token: string; user: any }>('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    me: () => request<{ user: any; registration: any }>('/auth/me'),
  },

  // ── Admin ──
  admin: {
    getRegistrations: (status?: string) =>
      request(`/admin/registrations${status ? `?status=${status}` : ''}`),

    getRegistration: (id: string) => request(`/admin/registrations/${id}`),

    approve: (id: string, payload?: { loginId?: string; password?: string }) =>
      request<{ credentials: { loginId: string; password: string }; profileId: string; userId: string }>(
        `/admin/registrations/${id}/approve`,
        { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }
      ),

    reject: (id: string, reason?: string) =>
      request(`/admin/registrations/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    updateRegistration: (id: string, patch: Record<string, any>) =>
      request<{ message: string; updatedFields: string[] }>(`/admin/registrations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),

    deleteRegistration: (id: string) =>
      request<{ message: string; name?: string; email?: string; statusBeforeDelete: string }>(
        `/admin/registrations/${id}`,
        { method: 'DELETE' }
      ),

    getMembers: () => request('/admin/members'),

    updateMembership: (id: string, tier: string, status: string) =>
      request(`/admin/members/${id}/membership`, {
        method: 'PATCH',
        body: JSON.stringify({ tier, status }),
      }),

    getStats: () => request('/admin/stats'),

    getProfile: (id: string) =>
      request<{ profile: any; registration: any; user: any }>(`/admin/profiles/${id}`),

    updateProfile: (id: string, patch: Record<string, any>) =>
      request<{ message: string; updatedFields: string[] }>(`/admin/profiles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),

    deleteProfile: (id: string) =>
      request<{ message: string; deleted: { profile: boolean; user: boolean; registration: boolean }; loginIdRemoved: string | null }>(
        `/admin/profiles/${id}`,
        { method: 'DELETE' }
      ),
  },

  // ── Profiles (premium only) ──
  profiles: {
    list: (gender?: string) =>
      request(`/profiles${gender ? `?gender=${gender}` : ''}`),

    get: (id: string) => request(`/profiles/${id}`),
  },

  // ── Token management ──
  setToken,
  getToken,
  logout: () => setToken(null),
};

export default api;
