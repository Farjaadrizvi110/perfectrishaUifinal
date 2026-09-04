#!/usr/bin/env bash
set -euo pipefail
LOG="[vercel-install]"
PWD_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PWD_ROOT" || exit 2
echo "[32m${LOG} CWD = ${PWD_ROOT}[0m"
echo "[32m${LOG} Node: $(node -v) · npm: $(npm -v)[0m"

# NUCLEAR: delete every kind of poisoned lockfile before install
echo "[32m${LOG} STEP 1/4 — clearing lockfiles (to avoid hardcoded mirror URLs in resolved:)[0m"
rm -f package-lock.json pnpm-lock.yaml yarn.lock npm-shrinkwrap.json package.json.lock node_modules/.package-lock.json 2>/dev/null || true
if [ -e package-lock.json ] || [ -e pnpm-lock.yaml ] || [ -e npm-shrinkwrap.json ]; then
  echo "[33m${LOG} WARNING: lockfile still present after rm — forcedly shredding names [0m"
  for f in package-lock.json pnpm-lock.yaml yarn.lock npm-shrinkwrap.json node_modules/.package-lock.json; do
    [ -f "$f" ] && mv -- "$f" ".${f}.bak.$(date +%s)" 2>/dev/null || true
  done
fi

# Registry pin - every known channel simultaneously
REG="https://registry.npmjs.org/"
echo "[32m${LOG} STEP 2/4 — pinning npm registry via every known channel -> ${REG}[0m"
export NPM_CONFIG_REGISTRY="$REG"
export npm_config_registry="$REG"
export NPM_CONFIG_USERCONFIG="$PWD_ROOT/.npmrc"
export NPM_CONFIG_GLOBALCONFIG="$PWD_ROOT/.npmrc"
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

# Also write the ~/.npmrc on this Vercel worker (Linux)
HOMERC="$HOME/.npmrc"
echo "[32m${LOG} STEP 3/4 — writing ${HOMERC} on worker + attempting npm config set CLI[0m"
{
  echo "registry=${REG}"
  echo "engine-strict=false"
  echo "legacy-peer-deps=true"
  echo "audit=false"
  echo "fund=false"
  echo "update-notifier=false"
  echo "loglevel=error"
} > "$HOMERC" 2>/dev/null || echo "  (could not write ${HOMERC})"
for rc in /etc/npmrc /usr/local/etc/npmrc /var/lib/npm/etc/npmrc; do
  echo "registry=${REG}" > "$rc" 2>/dev/null || true
done
npm config set registry "$REG" 2>/dev/null || true
npm config set registry "$REG" -g 2>/dev/null || true

# Actually install
echo "[32m${LOG} STEP 4/4 — npm install with --registry + --userconfig (no package-lock verify)[0m"
npm install \
  --registry="$REG" \
  --userconfig="$PWD_ROOT/.npmrc" \
  --globalconfig="$PWD_ROOT/.npmrc" \
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

echo "[32m${LOG} INSTALL SUCCESS ✅ — $(ls node_modules | wc -l) folders in node_modules[0m"
