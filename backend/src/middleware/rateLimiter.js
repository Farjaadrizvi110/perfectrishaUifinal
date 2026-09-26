import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

export const isTestEnv = process.env.NODE_ENV === "test";
export const isDevEnv = process.env.NODE_ENV !== "production" && !isTestEnv;

// Skip callback for rate-limit / slow-down packages.
// MUST be a function (not a boolean) for express-rate-limit v7 strictness.
export const skipInTest = () => isTestEnv;

function makeSkip(localOpt) {
  if (localOpt && typeof localOpt === "function") return localOpt;
  return skipInTest;
}

/**
 * General API rate limiter — 80 requests / 15 min per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: skipInTest,
});

/**
 * Auth rate limiter — 15 attempts / 15 min per IP.
 * Aggressive brute-force + credential-stuffing prevention.
 * Pairs with 5-attempt per-account lockout (User schema).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many auth attempts. Account temporarily locked. Try again in 15 minutes.",
  },
  skip: skipInTest,
});

/**
 * Registration limiter — 25 submissions / hour per IP.
 * Prevents form-spam bots and duplicate signup floods.
 * (Family members sharing IP can register legitimately without hitting wall.)
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts. Please try again later." },
  skip: skipInTest,
});

/**
 * Progressive slow-down — adds delay after 5th rapid request within 30s.
 * Anti-bot friction: 6th request = 500ms, 7th = 1000ms, up to 5s cap.
 * Real humans don't notice; rapid-fire scrapers get terrible latency.
 */
export const slowDownMiddleware = slowDown({
  windowMs: 30 * 1000,
  delayAfter: 5,
  delayMs: (hits) => Math.min(hits * 500, 5000),
  maxDelayMs: 5000,
  skip: skipInTest,
});
