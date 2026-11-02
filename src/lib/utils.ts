import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const productionRewriteHosts = new Set([
  'perfectrishta.co.uk',
  'perfectrisha-uifinal-fordomain.vercel.app',
]);

export function resolvePublicSiteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (typeof window === 'undefined') {
    return normalizedPath;
  }

  const hostname = window.location.hostname.toLowerCase();
  return productionRewriteHosts.has(hostname)
    ? `https://www.perfectrishta.co.uk${normalizedPath}`
    : normalizedPath;
}

export function navigateToPublicSite(path: string) {
  window.location.href = resolvePublicSiteUrl(path);
}
