// Vercel catchall serverless API handler. Imports the Express app directly.
// Same repo / same origin monorepo serverless handler.

let appOrFactory;
let booted = false;
let bootError = null;

export default async function handler(req, res) {
  if (!appOrFactory) {
    try {
      const mod = await import("../backend/src/server.js");
      appOrFactory = mod;
    } catch (err) {
      console.error(
        "[Vercel API] Import backend/src/server.js not found, build include missing! Trace:",
      );
      console.error((err && err.stack) || err);
      bootError = err;
    }
  }
  if (!booted && appOrFactory && !bootError) {
    try {
      const start = appOrFactory.startServer;
      if (typeof start === "function") await start();
      booted = true;
      console.log("[Vercel API] startServer() resolved, booted=true");
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
      boot: bootInfo(),
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
        `Backend Express app export not a function typeof ${typeof expressApp}`,
      );
    }
    return expressApp(req, res, (_err) => {
      if (!res.headersSent) {
        res
          .status(404)
          .json({
            error: "Route not found",
            boot: bootInfo(),
            reqPath: req.url,
            reqMethod: req.method,
          });
      }
    });
  } catch (err) {
    console.error("[Vercel API] express handler invoke error:", err);
    res
      .status(500)
      .json({
        error: "handler invoke error",
        detail: String(err?.message || err),
      });
  }
}

function bootInfo() {
  try {
    return {
      platform: process.platform,
      versions: process.versions.node,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
        VERCEL_URL: process.env.VERCEL_URL,
        MONGODB_URI_SET: !!process.env.MONGODB_URI,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
        ADMIN_USERNAME: process.env.ADMIN_USERNAME,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        CLIENT_URL: process.env.CLIENT_URL,
      },
    };
  } catch (_e) {
    return undefined;
  }
}
