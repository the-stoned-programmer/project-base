#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

START_MOBILE=true
for arg in "$@"; do
  if [[ "$arg" == "--no-mobile" ]]; then
    START_MOBILE=false
  fi
done

# Ensure contracts are in sync before launching
"${ROOT_DIR}/scripts/sync-contracts.sh"

echo "=================================================="
echo "🚀 MODERN PROJECT BASE: STARTING LOCAL COCKPIT"
echo "=================================================="

echo "🦀 Starting Rust backend on http://127.0.0.1:3001..."
cargo run --manifest-path "${ROOT_DIR}/backend/Cargo.toml" --bin server &
BACKEND_PID=$!

echo "🎨 Starting Vite Web app on http://127.0.0.1:5173..."
(cd "${ROOT_DIR}/apps/web" && pnpm run dev --host 127.0.0.1) &
FRONTEND_PID=$!

MOBILE_PID=""
if [[ "${START_MOBILE}" == "true" ]]; then
  echo "📱 Starting Expo Mobile bundler (Metro) on http://127.0.0.1:8081..."
  (cd "${ROOT_DIR}/apps/mobile" && pnpm start) &
  MOBILE_PID=$!
fi

cleanup() {
  echo ""
  echo "🛑 Shutting down all local processes..."
  kill "${BACKEND_PID}" 2>/dev/null || true
  kill "${FRONTEND_PID}" 2>/dev/null || true
  if [[ -n "${MOBILE_PID}" ]]; then
    kill "${MOBILE_PID}" 2>/dev/null || true
  fi
  wait "${BACKEND_PID}" 2>/dev/null || true
  wait "${FRONTEND_PID}" 2>/dev/null || true
  if [[ -n "${MOBILE_PID}" ]]; then
    wait "${MOBILE_PID}" 2>/dev/null || true
  fi
  echo "Bye."
}

trap cleanup INT TERM EXIT
wait
