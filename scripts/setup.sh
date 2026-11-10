#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=================================================="
echo "🚀 MODERN PROJECT BASE: OPERATOR ONBOARDING SETUP"
echo "=================================================="

# 1. Check prerequisites
echo "🔍 Checking toolchain prerequisites..."
command -v cargo >/dev/null 2>&1 || {
  echo "❌ Error: Rust toolchain ('cargo') is required but not installed." >&2
  echo "👉 Install Rust from https://rustup.rs" >&2
  exit 1
}

command -v pnpm >/dev/null 2>&1 || {
  echo "⚠️  pnpm not found. Installing pnpm via corepack/npm..."
  if command -v corepack >/dev/null 2>&1; then
    corepack enable && corepack prepare pnpm@latest --activate
  else
    npm install -g pnpm
  fi
}

echo "✅ Rust ('$(cargo --version | cut -d' ' -f1,2)') and pnpm ('$(pnpm --version)') verified."

# 2. Setup environment configuration
if [ ! -f "${ROOT_DIR}/.envrc" ]; then
  echo "📋 Initializing '.envrc' from '.envrc.example'..."
  cp "${ROOT_DIR}/.envrc.example" "${ROOT_DIR}/.envrc"
  echo "✨ Created '.envrc'. (If using direnv, run 'direnv allow')"
else
  echo "ℹ️  Existing '.envrc' detected. Keeping current configuration."
fi

# 3. Install dependencies
echo "📦 Installing monorepo workspace dependencies..."
(cd "${ROOT_DIR}" && pnpm install)
echo "🎭 Ensuring Playwright browser binary is installed..."
(cd "${ROOT_DIR}/apps/web" && pnpm exec playwright install chromium)

# 4. Sync contracts
echo "🔄 Synchronizing Rust domain contracts to TypeScript..."
"${ROOT_DIR}/scripts/sync-contracts.sh"

# 5. Run full verification gate
echo "🛡️  Running full verification gate to ensure fresh baseline..."
"${ROOT_DIR}/scripts/verify.sh"

echo ""
echo "=================================================="
echo "🎉 ONBOARDING COMPLETE! SYSTEM IS 100% HEALTHY"
echo "=================================================="
echo "Next steps:"
echo "  1. Start local development:  ./scripts/dev.sh"
echo "  2. Backend running on:       http://127.0.0.1:3001"
echo "  3. Frontend running on:      http://127.0.0.1:5173"
echo "=================================================="
