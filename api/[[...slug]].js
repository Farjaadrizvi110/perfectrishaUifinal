// Vercel catchall serverless API handler. Imports the Express app directly.
// Same repo / same origin monorepo serverless handler.
// CRITICAL: Vercel rewrites /api/(.*) -> /api/[[...slug]] BUT the function
// receives original request path "/api/auth/login". Express routes are
// mounted already at "/api/*" (see backend/src/server.js L74-L90), so we
// MUST pass the FULL path including /api prefix to Express (no stripping).
// This matches exactly the local :5000 server pattern so dev=prod parity.

let appOrFactory;
let booted = false;
let bootError = null;

export default async function handler(req, res) {
  // Fix Vercel CORS preflight OPTIONS (bypasses Express)
  if (req.method && req.method.toUpperCase() === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    res.status(204).end("");
    return;
  }
  if (!appOrFactory) {
    try {
      const mod = await import("../backend/src/server.js");
      appOrFactory = mod;
    } catch (err) {
      console.error("[Vercel API] Import backend/src/server.js FATAL:");
      console.error((err && err.stack) || err);
      bootError = err;
    }
  }
  if (!booted && appOrFactory && !bootError) {
    try {
      const start = appOrFactory.startServer;
      if (typeof start === "function") await start();
      booted = true;
      console.log("[Vercel API] startServer() booted=true on cold start");
    } catch (err) {
      console.error("[Vercel API] startServer() error:", err);
      bootError = err;
    }
  }
  if (bootError) {
    res.status(500).json({
      error: "API boot failed",
      detail: String(bootError?.message || bootError),
      stack:
        process.env.NODE_ENV === "production"
          ? undefined
          : bootError?.stack || undefined,
      boot: bootInfo(req),
    });
    return;
  }
  try {
    const expressApp =
      (appOrFactory && appOrFactory.app) ||
      (appOrFactory && appOrFactory.default) ||
      appOrFactory;
    if (!expressApp || typeof expressApp !== "function") {
      throw new Error(
        `Backend Express app export not a function typeof ${typeof expressApp}. Exports keys: ${Object.keys(appOrFactory || {}).join(",")}`,
      );
    }
    // Diagnostics endpoint to inspect request/rewrites/env without DB.
    if (req.url && req.url.startsWith("/api/diag")) {
      res.status(200).json({
        diag: true,
        reqUrl: req.url,
        reqOriginalUrl: req.originalUrl || req.url,
        reqMethod: req.method,
        reqPath: req.path,
        boot: bootInfo(req),
        headers: Object.fromEntries(
          Object.entries(req.headers || {}).filter(
            ([k]) =>
              !k.toLowerCase().includes("authorization") &&
              !k.toLowerCase().includes("cookie"),
          ),
        ),
      });
      return;
    }
    return expressApp(req, res, (_err) => {
      if (!res.headersSent) {
        res.status(404).json({
          error: "Route not found",
          detail: "Express route did not match",
          req: {
            url: req.url,
            method: req.method,
            originalUrl: req.originalUrl,
          },
          boot: bootInfo(req),
        });
      }
    });
  } catch (err) {
    console.error("[Vercel API] express handler invoke error:", err);
    res.status(500).json({
      error: "handler invoke error",
      detail: String(err?.message || err),
      stack: err?.stack,
    });
  }
}

function bootInfo(req) {
  try {
    return {
      platform: process.platform,
      nodeVersion: process.versions.node,
      cwd: process.cwd(),
      handlerFileDir: new URL(".", import.meta.url).pathname,
      filesList: listBackendFilesSafe(),
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
        VITE_API_URL: process.env.VITE_API_URL || undefined,
      },
      reqMatchApiPrefix: !!(req && req.url && req.url.startsWith("/api")),
    };
  } catch (e) {
    return { error: String((e && e.message) || e) };
  }
}

function listBackendFilesSafe() {
  // ESM handler cannot call CommonJS require() if module system pure ESM on
  // new Vercel node runtimes. Skip gracefully; use env vars for diagnostics.
  const r =
    (typeof globalThis !== "undefined" && globalThis.require) ||
    (typeof require !== "undefined" ? require : undefined);
  if (r) {
    try {
      const fsPkg = r("node:fs");
      const pathPkg = r("node:path");
      const dir = pathPkg.resolve(process.cwd(), "backend", "src");
      if (fsPkg.existsSync(dir)) {
        return fsPkg
          .readdirSync(dir, { withFileTypes: true })
          .slice(0, 30)
          .map((d) => d.name + (d.isDirectory() ? "/" : ""));
      }
      return `backend/src NOT EXIST cwd=${process.cwd()}`;
    } catch (err) {
      return `list error: ${String((err && err.message) || err)}`;
    }
  }
  return "ESM runtime; skipped file listing. Env vars are fine, see boot.env.";
}
