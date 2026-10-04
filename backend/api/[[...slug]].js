import app, { startServer } from "../src/server.js";

let booted = false;
let bootError = null;

export default async function handler(req, res) {
  if (req.method && req.method.toUpperCase() === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.status(204).end("");
    return;
  }
  if (!booted && !bootError) {
    try {
      await startServer();
      booted = true;
      console.log("[Vercel Backend] startServer() booted=true cold start");
    } catch (err) {
      console.error("[Vercel Backend] startServer() boot failed:", err);
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
    return app(req, res, (_err) => {
      if (!res.headersSent) {
        res.status(404).json({
          error: "Route not found in backend",
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
    console.error("[Vercel Backend] handler invoke error:", err);
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
      reqMatchApiPrefix: !!(req && req.url && req.url.startsWith("/api")),
    };
  } catch (e) {
    return { error: String((e && e.message) || e) };
  }
}
