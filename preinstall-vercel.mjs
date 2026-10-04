import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REGISTRY = "https://registry.npmjs.org/";
const NPMRC_LINES = [
  `registry=${REGISTRY}`,
  "engine-strict=false",
  "legacy-peer-deps=true",
  "audit=false",
  "fund=false",
  "update-notifier=false",
  "loglevel=error",
  "fetch-timeout=600000",
  "fetch-retries=5",
  "fetch-retry-mintimeout=20000",
  "fetch-retry-maxtimeout=600000",
  "prefer-offline=false",
  "progress=false",
  "package-lock=false",
  "",
].join("\n");

function tryWrite(file, data) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data, { flag: "w", mode: 0o644 });
    console.log(`[preinstall-vercel] wrote npmrc ${file}`);
    return true;
  } catch (err) {
    console.log(`[preinstall-vercel] skip ${file} (${String(err?.message || err)})`);
    return false;
  }
}

const HOME = os.homedir();
const CWD = process.cwd();

tryWrite(path.join(HOME, ".npmrc"), NPMRC_LINES);
tryWrite(path.join(CWD, ".npmrc"), NPMRC_LINES);

// Also make a no-op wrapper for tsc/vite in PATH if possible
const binDir = path.join(CWD, "node_modules", ".bin");
try {
  fs.mkdirSync(binDir, { recursive: true });
} catch (_err) {
  // ignore
}

for (const tool of ["tsc", "vite", "tailwindcss"]) {
  const shim = path.join(binDir, process.platform === "win32" ? `${tool}.cmd` : tool);
  const target = path.join(CWD, "node_modules", ".bin", process.platform === "win32" ? `${tool}.cmd` : tool);
  try {
    if (!fs.existsSync(shim)) {
      if (process.platform === "win32") {
        fs.writeFileSync(shim, `@echo off\r\nsetlocal\r\nnode "${path.join(CWD, "node_modules", tool === "tsc" ? "typescript/bin/tsc" : tool === "vite" ? "vite/bin/vite.js" : "tailwindcss/lib/cli.js")}" %*\r\n`, { flag: "w" });
      } else {
        fs.writeFileSync(shim, `#!/usr/bin/env bash\nset -e\nexec node "${path.join(CWD, "node_modules", tool === "tsc" ? "typescript/bin/tsc" : tool === "vite" ? "vite/bin/vite.js" : "tailwindcss/lib/cli.js")}" "$@"\n`, { flag: "w", mode: 0o755 });
      }
      console.log(`[preinstall-vercel] pre-created shim ${shim}`);
    }
  } catch (err) {
    // ignore
  }
}

console.log(`[preinstall-vercel] npm environment primed (platform=${process.platform} cwd=${CWD})`);
process.exit(0);
