/**
 * PerfectRishta dev-runner:
 * Starts BOTH the backend server (scripts/boot_atlas.mjs Atlas bypass, falls back to node --watch)
 * AND the frontend Vite dev server, from a SINGLE `npm run dev:all` command in the root folder.
 *
 * ZERO new dependencies: uses only built-in Node `child_process.spawn`, so it works on
 * Windows / macOS / Linux without npm i anything.
 *
 * Features:
 *   - Color-coded prefixed output (cyan frontend, yellow backend)
 *   - Ctrl + C on root process → kills BOTH child processes cleanly (SIGINT/SIGTERM)
 *   - On exit, child if dies → kills sibling + exits with non-zero so you see the crash
 *   - Graceful Windows handling (taskkill fallback if child_process.kill doesn't work on Windows)
 */
import { spawn } from "node:child_process";
import process from "node:process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const BACKEND_DIR = path.join(ROOT, "backend");

const isWin = process.platform === "win32";
const BOOT_ATLAS = path.join(BACKEND_DIR, "scripts", "boot_atlas.mjs");
const BACKEND_MAIN = path.join(BACKEND_DIR, "src", "server.js");

function spawnCmd(cwd, cmd, args, prefix, color, opts = {}) {
  const allowShell = opts.allowShell === true;
  const child = spawn(cmd, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    shell: allowShell,
    windowsHide: true,
  });
  const tag = `${color}${prefix}\x1b[0m`;
  const lineBuf = { out: "", err: "" };
  function emit(stream, line) {
    const trimmed = line.replace(/\s+$/g, "");
    if (!trimmed) return;
    const streamPrefix =
      stream === "err" ? `${color}\x1b[2m${prefix}/err\x1b[0m` : tag;
    process.stdout.write(`${streamPrefix} | ${trimmed}\n`);
  }
  function flush(stream) {
    const buf = lineBuf[stream];
    if (!buf) return;
    const parts = buf.split(/\r?\n/);
    lineBuf[stream] = parts.pop() || "";
    parts.forEach((l) => emit(stream, l));
  }
  child.stdout.on("data", (d) => {
    lineBuf.out += String(d);
    flush("out");
  });
  child.stderr.on("data", (d) => {
    lineBuf.err += String(d);
    flush("err");
  });
  child.on("exit", (code) => {
    if (lineBuf.out) emit("out", lineBuf.out);
    if (lineBuf.err) emit("err", lineBuf.err);
    process.stdout.write(`${tag} exited with code ${code ?? "null"}\n`);
  });
  return child;
}

function killTree(pid) {
  if (!pid) return;
  try {
    if (isWin) {
      spawn("taskkill", ["/T", "/F", "/PID", String(pid)], {
        windowsHide: true,
      }).on("error", () => {});
    } else {
      process.kill(pid, "SIGTERM");
    }
  } catch {
    /* ignore */
  }
}

const useBootAtlas = fs.existsSync(BOOT_ATLAS);
const backendCmd = useBootAtlas
  ? { cmd: process.execPath, args: [BOOT_ATLAS] }
  : { cmd: process.execPath, args: ["--watch", BACKEND_MAIN] };

process.stdout.write("\x1b[96m[frontend]\x1b[0m Starting Vite (:3000) …\n");
const frontend = (() => {
  try {
    const viteBin = path.join(
      ROOT,
      "node_modules",
      ".bin",
      isWin ? "vite.cmd" : "vite",
    );
    if (fs.existsSync(viteBin)) {
      return spawnCmd(ROOT, viteBin, [], "frontend", "\x1b[96m");
    }
  } catch {}
  return spawnCmd(
    ROOT,
    process.platform === "win32" ? "cmd.exe" : "npx",
    process.platform === "win32" ? ["/d", "/s", "/c", "npx", "vite"] : ["vite"],
    "frontend",
    "\x1b[96m",
  );
})();

process.stdout.write(
  `\x1b[33m[backend]\x1b[0m Starting ${useBootAtlas ? "boot_atlas.mjs (Atlas SRV bypass)" : "--watch src/server.js"} (:5000) …\n`,
);
// Always call node binary directly (process.execPath) — no shell, safe even on Windows with path spaces.
const backend = spawnCmd(
  BACKEND_DIR,
  process.execPath,
  useBootAtlas ? [BOOT_ATLAS] : ["--watch", BACKEND_MAIN],
  "backend",
  "\x1b[33m",
);

let exiting = false;
function shutdown() {
  if (exiting) return;
  exiting = true;
  process.stdout.write("\x1b[90m[dev:all]\x1b[0m Stopping both processes…\n");
  killTree(frontend.pid);
  killTree(backend.pid);
  setTimeout(() => process.exit(0), 400);
}

function failOver(child, other) {
  child.on("exit", (code) => {
    if (exiting) return;
    if (code === 0 || code === null) return;
    process.stdout.write(
      `\x1b[31m[dev:all]\x1b[0m child exited uncleanly — shutting down everything.\n`,
    );
    shutdown();
    setTimeout(() => process.exit(typeof code === "number" ? code : 1), 500);
  });
}
failOver(frontend, backend);
failOver(backend, frontend);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGHUP", shutdown);
process.on("exit", shutdown);
