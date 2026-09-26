import mongoose from "mongoose";

let memoryServer = null;

const SERVER_SELECTION_TIMEOUT_MS =
  Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) ||
  (process.env.NODE_ENV === "test" ? 5000 : 10000);

const SOCKET_TIMEOUT_MS = Number(process.env.MONGODB_SOCKET_TIMEOUT) || 45000;

const CONNECT_TIMEOUT_MS = Number(process.env.MONGODB_CONNECT_TIMEOUT) || 10000;

/**
 * Remove credentials (user:password@) from a MongoDB URI before logging.
 * Prevents accidental credential leakage to log aggregators, stdout, PM2, etc.
 * Works for mongodb://, mongodb+srv://, and uris with multiple query params.
 */
export function redactMongoUri(uri) {
  if (typeof uri !== "string" || !uri) return String(uri ?? "");
  try {
    return uri.replace(
      /^(mongodb(?:\+srv)?:\/\/)([^:]+:[^@]+@)/,
      (_m, scheme) => `${scheme}***:***@`,
    );
  } catch {
    return "mongodb://<redacted>";
  }
}

/**
 * Validate a MONGODB_URI string before handing to mongoose.connect().
 * Rejects empty, non-string, and obviously-missing scheme URIs.
 * Does NOT perform auth checks (mongoose handles that on connect).
 */
function validateUri(uri) {
  if (typeof uri !== "string") return { ok: false, reason: "uri not a string" };
  const trimmed = uri.trim();
  if (!trimmed) return { ok: false, reason: "uri is empty" };
  if (
    !trimmed.startsWith("mongodb://") &&
    !trimmed.startsWith("mongodb+srv://")
  ) {
    return { ok: false, reason: "missing mongodb:// or mongodb+srv:// scheme" };
  }
  return { ok: true };
}

/**
 * Build a consistent, production-grade mongoose connection options object.
 * Applies sensible defaults for every environment (dev/staging/prod).
 */
function buildConnectOptions(kind) {
  const base = {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    connectTimeoutMS: CONNECT_TIMEOUT_MS,
    socketTimeoutMS: SOCKET_TIMEOUT_MS,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    w: "majority",
    autoIndex: process.env.NODE_ENV !== "production",
    maxPoolSize: Number(process.env.MONGODB_POOL_SIZE) || 100,
    minPoolSize: 0,
  };

  if (kind === "memory") {
    return { ...base, directConnection: true };
  }
  return base;
}

/**
 * Connect to MongoDB. Option A (user-selected policy):
 *
 *   1) If MONGODB_URI is explicitly defined → use it DIRECTLY (Atlas or local).
 *      Works in ANY env (dev/staging/prod) — env gate REMOVED.
 *      EXCEPTION: NODE_ENV === "test" always skips MONGODB_URI and uses the
 *      in-memory / local chain below, because unit tests need ephemeral DBs.
 *   2) Else try local mongodb on 127.0.0.1:27017/perfectrishta.
 *   3) Else start mongodb-memory-server (zero-config fallback for dev).
 *
 * Credentials in URIs are NEVER written to the log stream (redacted).
 */
export async function connectDB() {
  const explicitUri = process.env.MONGODB_URI;
  const isTestEnv = process.env.NODE_ENV === "test";

  if (explicitUri && !isTestEnv) {
    const valid = validateUri(explicitUri);
    if (!valid.ok) {
      console.error(
        `[DB] MONGODB_URI invalid (${valid.reason}). Refusing to connect.`,
      );
      process.exit(1);
    }
    console.log(
      `[DB] MONGODB_URI configured → connecting via ${
        explicitUri.startsWith("mongodb+srv://") ? "SRV" : "standard"
      } URI: ${redactMongoUri(explicitUri)}`,
    );
    return connectToUri(explicitUri, "explicit", /* allowFallback */ false);
  }

  if (isTestEnv && explicitUri) {
    console.log(
      "[DB] NODE_ENV=test — overriding MONGODB_URI with ephemeral in-memory/local chain (test isolation).",
    );
  }

  const localUri = "mongodb://127.0.0.1:27017/perfectrishta";
  try {
    await mongoose.connect(localUri, buildConnectOptions("local"));
    console.log(
      `[DB] MongoDB connected (local): ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`,
    );
    return;
  } catch {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[DB] Local MongoDB not available. Starting mongodb-memory-server...",
      );
    }
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  const memoryUri = memoryServer.getUri();
  await mongoose.connect(memoryUri, buildConnectOptions("memory"));
  console.log(
    `[DB] MongoDB connected (memory-server): ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`,
  );
}

/**
 * Connect mongoose to a fully-qualified URI with explicit error handling.
 *
 * `allowFallback`:
 *   - true  → If the primary connect fails, throw the error (let caller fall through
 *             to the fallback chain in connectDB for local/memory).
 *   - false → On unrecoverable failure the process exits because the app cannot
 *             function without its primary datastore (dev/staging/prod using Atlas).
 */
async function connectToUri(uri, kind = "explicit", allowFallback = false) {
  try {
    await mongoose.connect(uri, buildConnectOptions(kind));
    const { host, port, name } = mongoose.connection;
    const displayPort = Number.isFinite(port) && port > 0 ? port : "27017+srv";
    console.log(
      `[DB] MongoDB connected (${kind}): ${host}:${displayPort}/${name}`,
    );
  } catch (err) {
    const msg = err && err.message ? String(err.message) : String(err);
    console.error(`[DB] MongoDB connection failed (${kind}):`, msg);
    if (kind === "explicit" && !allowFallback) {
      console.error(
        "[DB] Hint: check Atlas IP Access List (add 0.0.0.0/0 + ::/0 ), credentials, or replicaSet/TLS options.",
      );
      process.exit(1);
    }
    throw err;
  }
}

mongoose.connection.on("error", (err) => {
  console.error(
    "[DB] Runtime MongoDB error:",
    err && err.message ? err.message : String(err),
  );
});

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.info("[DB] MongoDB reconnected");
});

mongoose.connection.on("connected", () => {
  if (process.env.NODE_ENV === "production") {
    console.info(
      "[DB] MongoDB connection state=ready, readyState=%s",
      mongoose.connection.readyState,
    );
  }
});

export async function stopDB() {
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore on teardown */
  }
  if (memoryServer) {
    try {
      await memoryServer.stop();
    } catch {
      /* ignore on teardown */
    }
    memoryServer = null;
  }
}
