#!/usr/bin/env bash
# Vercel install runner — KISS version
# Keep dead simple — no function tricks, no color escapes, tolerant of errors.
set +e
umask 022
echo "[vi] ============ start ============"
echo "[vi] args: $*"
echo "[vi] BASH_VERSION: ${BASH_VERSION}"
echo "[vi] 0 = $0"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}" || { echo "[vi] FATAL cannot cd to ${ROOT_DIR}"; exit 2; }
echo "[vi] ROOT_DIR = ${ROOT_DIR}"
echo "[vi] cwd = $(pwd)"
echo "[vi] node=$(node -v 2>/dev/null) npm=$(npm -v 2>/dev/null)"
echo "[vi] ls package.json:"; ls -l package.json .npmrc vercel.json

# 1) Clean lockfiles
echo "[vi] (1/3) clearing any potentially poisoned lockfiles"
rm -f package-lock.json 2>/dev/null
rm -f pnpm-lock.yaml yarn.lock npm-shrinkwrap.json package.json.lock 2>/dev/null
rm -f node_modules/.package-lock.json 2>/dev/null
# If still present (permissions), rename them out of the way
for f in package-lock.json pnpm-lock.yaml yarn.lock npm-shrinkwrap.json node_modules/.package-lock.json; do
  if [ -e "$f" ]; then
    mv -f -- "$f" ".quarantine_${f##*/}_$$" 2>/dev/null || true
  fi
done

# 2) Every npm registry pin known
REG="https://registry.npmjs.org/"
echo "[vi] (2/3) pinning NPM registry to ${REG} via ENV + ~/.npmrc + npm config set"
export NPM_CONFIG_REGISTRY="$REG"
export npm_config_registry="$REG"
export NPM_CONFIG_USERCONFIG="${ROOT_DIR}/.npmrc"
export NPM_CONFIG_GLOBALCONFIG="${ROOT_DIR}/.npmrc"
export npm_config_fetch_retries=10
export npm_config_fetch_retry_mintimeout=30000
export npm_config_fetch_retry_maxtimeout=300000
export npm_config_fetch_timeout=600000
export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false
export npm_config_legacy_peer_deps=true
export npm_config_engine_strict=false
export npm_config_strict_ssl=true
export npm_config_loglevel=error
# Write the user's HOME/.npmrc on this Vercel worker
HOMERC="$HOME/.npmrc"
{
  echo "registry=${REG}"
  echo "engine-strict=false"
  echo "legacy-peer-deps=true"
  echo "audit=false"
  echo "fund=false"
  echo "update-notifier=false"
  echo "loglevel=error"
} > "${HOMERC}" 2>/dev/null && echo "[vi] wrote ${HOMERC}" || echo "[vi] could not write ${HOMERC} (non-fatal; project .npmrc still active)"
# Try system npmrcs (silently ignore failures)
for rc in /etc/npmrc /usr/local/etc/npmrc /var/lib/npm/etc/npmrc; do
  echo "registry=${REG}" > "${rc}" 2>/dev/null && echo "[vi] wrote ${rc}" || true
done
npm config set registry "${REG}" 2>/dev/null || true
npm config set registry "${REG}" -g 2>/dev/null || true

# 3) Install
echo "[vi] (3/3) npm install"
npm install \
  "--registry=${REG}" \
  "--userconfig=${ROOT_DIR}/.npmrc" \
  "--globalconfig=${ROOT_DIR}/.npmrc" \
  --fetch-retries=10 \
  --fetch-retry-mintimeout=30000 \
  --fetch-retry-maxtimeout=300000 \
  --fetch-timeout=600000 \
  --no-audit \
  --no-fund \
  --no-update-notifier \
  --legacy-peer-deps \
  --engine-strict=false \
  --loglevel=error \
  --no-package-lock-verify \
  --strict-ssl=true
RC=$?
if [ "${RC}" -ne 0 ]; then
  echo "[vi] first install failed (RC=${RC}); retry once with minimal flags"
  rm -f package-lock.json 2>/dev/null || true
  npm install "--registry=${REG}" --no-audit --no-fund --no-update-notifier --legacy-peer-deps --engine-strict=false --loglevel=error --strict-ssl=true
  RC=$?
fi

if [ "${RC}" -eq 0 ]; then
  echo "[vi] INSTALL OK — node_modules count: $(ls node_modules 2>/dev/null | wc -l)"
  echo "[vi] ============ OK ============"
  exit 0
else
  echo "[vi] INSTALL FAILED RC=${RC}"
  exit "${RC}"
fi
