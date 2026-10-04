import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

export const isTestEnv = process.env.NODE_ENV === "test";
export const isDevEnv = process.env.NODE_ENV !== "production" && !isTestEnv;
export const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

/**
 * On Vercel / reverse proxy platforms we EXPLICITLY resolve client IP from
 * the leftmost comma-separated value of "x-forwarded-for" (standard Vercel
 * injects XFF). This avoids express-rate-limit v7+ strict XFF validation
 * that throws ValidationError "ERR_ERL_UNEXPECTED_X_FORWARDED_FOR" if trust
 * proxy wasn't propagated before middleware runs. We use our own explicit
 * resolver that NEVER throws and never falls back to req.ip (rate-limit
 * internal validator).
 */
function resolveClientIpFromXFF(req) {
  const raw = req.headers?.["x-forwarded-for"];
  if (typeof raw === "string" && raw.length > 0) {
    const leftmost = raw.split(",")[0]?.trim();
    if (leftmost && leftmost.length > 0) return leftmost;
  }
  if (typeof raw === "object" && raw && raw[0]) {
    const leftmost = String(raw[0]).split(",")[0]?.trim();
    if (leftmost) return leftmost;
  }
  // Fallback chain if no XFF (localhost direct)
  const socket = (req.socket || req.connection);
  const ipStr =
    (req.ip && String(req.ip)) ||
    (socket && socket.remoteAddress) ||
    "127.0.0.1";
  return String(ipStr).split(",")[0].trim() || "127.0.0.1";
}

// Skip callback for rate-limit / slow-down packages.
export const skipInTest = () => isTestEnv;

function makeSkip(localOpt) {
  if (localOpt && typeof localOpt === "function") return localOpt;
  // On non-production environments, also trust loopback so rapid clicks never wall.
  const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1", undefined, ""]);
  return (req) => {
    if (isTestEnv) return true;
    if (!isDevEnv) return false;
    const ip = resolveClientIpFromXFF(req);
    return (
      LOOPBACK.has(ip) ||
      LOOPBACK.has(
        String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(),
      )
    );
  };
}

const common = {
  keyGenerator: resolveClientIpFromXFF,
  skip: skipInTest,
  legacyHeaders: false,
  standardHeaders: true,
};

/**
 * General API rate limiter — 120 requests / 15 min per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { error: "Too many requests, please try again later." },
  ...common,
  skip: makeSkip(),
});

/**
 * Auth rate limiter — 20 attempts / 15 min per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error:
      "Too many auth attempts. Temporarily restricted. Try again in 15 minutes.",
  },
  ...common,
  skip: makeSkip(),
});

/**
 * Registration limiter — 30 submissions / hour per IP.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: "Too many registration attempts. Please try again later." },
  ...common,
  skip: makeSkip(),
});

/**
 * Progressive slow-down — adds delay after 8th rapid request within 30s.
 */
export const slowDownMiddleware = slowDown({
  windowMs: 30 * 1000,
  delayAfter: 8,
  delayMs: (hits) => Math.min(hits * 500, 5000),
  maxDelayMs: 5000,
  // slow-down keyGenerator works the same: avoid internal req.ip checks.
  keyGenerator: resolveClientIpFromXFF,
  skip: skipInTest,
});
