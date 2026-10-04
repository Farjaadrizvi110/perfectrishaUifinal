import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import morgan from "morgan";
import compression from "compression";
import mongoose from "mongoose";
import { mongoSanitize } from "./middleware/sanitize.js";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/database.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const app = express();

// ── Trust proxy (Vercel / Cloudflare / reverse proxy X-Forwarded-*) ──
// Vercel Platform sets "X-Forwarded-For", "X-Forwarded-Proto", "X-Forwarded-Host".
// express-rate-limit v7+ VALIDATES trust proxy settings: if XFF header is set
// and trust proxy === false (default) it throws ValidationError causes 401/500.
// Fix: trust 127.0.0.1 loopback + unlimited hops on managed platforms VERCEL=true
// or NODE_ENV=production. On localhost dev it still works trust proxy doesn't
// affect direct socket address ip resolution.
app.set(
  "trust proxy",
  process.env.VERCEL
    ? true
    : process.env.NODE_ENV === "production"
      ? true
      : "loopback",
);

// ── CloudLinux Alt-Node mount prefix workaround ──
// cPanel Setup Node.js App mounts at URL prefix but some configs do NOT strip it from req.url before passing to Express.
// Normalise "/perfectrishtaback-end/api/health -> "/api/health" so our routes match regardless.
app.use((req, _res, next) => {
  const mounts = [
    "/perfectrishtaback-end",
    "/node-api-internal",
    "/node-api-internal-v2",
  ];
  for (const m of mounts) {
    if (req.url.startsWith(m + "/") || req.url === m) {
      req.url = req.url.slice(m.length) || "/";
      break;
    }
  }
  next();
});

// ── Security & core middleware ──
app.use(helmet());
const CORS_ORIGINS = new Set(
  [
    process.env.CLIENT_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "https://perfectrishta.co.uk",
    "https://www.perfectrishta.co.uk",
    "http://perfectrishta.co.uk",
    "http://www.perfectrishta.co.uk",
  ]
    .filter(Boolean)
    .map((o) => String(o).replace(/\/$/, "")),
);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || CORS_ORIGINS.has(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize);
app.use(hpp());
app.use(compression());
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Rate limit all API routes ──
app.use("/api", apiLimiter);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongoConnected: mongoose.connection.readyState === 1,
    mongoDbName: mongoose.connection.name || null,
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

// ── Diagnostics endpoint (rewrites / env / boot without DB) ──
app.get("/api/diag", (req, res) => {
  try {
    const bootInfo = {
      platform: process.platform,
      nodeVersion: process.versions.node,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_PROJECT_PRODUCTION_URL:
          process.env.VERCEL_PROJECT_PRODUCTION_URL,
        MONGODB_URI_SET: !!process.env.MONGODB_URI,
        MONGODB_URI_LEN: (process.env.MONGODB_URI || "").length,
        MONGODB_URI_PREFIX: (process.env.MONGODB_URI || "").slice(0, 14),
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
        ADMIN_USERNAME: process.env.ADMIN_USERNAME || "<missing-env>",
        ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || "<missing-env>",
        CLIENT_URL: process.env.CLIENT_URL || undefined,
      },
      corsOrigins: Array.from(CORS_ORIGINS),
    };
    res.json({
      diag: true,
      reqUrl: req.url,
      reqOriginalUrl: req.originalUrl || req.url,
      reqMethod: req.method,
      reqPath: req.path,
      boot: bootInfo,
      headers: Object.fromEntries(
        Object.entries(req.headers || {}).filter(
          ([k]) =>
            !k.toLowerCase().includes("authorization") &&
            !k.toLowerCase().includes("cookie"),
        ),
      ),
    });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
});

// ── Route mounting ──
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profiles", profileRoutes);

// ── 404 + error handler (must be last) ──
app.use(notFound);
app.use(errorHandler);

// ── Boot (skip auto-start when imported by tests) ──
const PORT = process.env.PORT || 5000;

let bootPromise = null;
export async function startServer() {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    await connectDB();
    await seedAdmin();
    if (process.env.VERCEL || process.env.NODE_ENV === "test") {
      console.log(
        `[Server] PerfectRishta API initialized (${process.env.NODE_ENV || "development"}, no listen in serverless/test mode)`,
      );
      return;
    }
    app.listen(PORT, () => {
      console.log(`[Server] PerfectRishta API running on port ${PORT}`);
      console.log(
        `[Server] Environment: ${process.env.NODE_ENV || "development"}`,
      );
    });
  })();
  return bootPromise;
}

// Only auto-start when run directly (not imported by vitest)
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
