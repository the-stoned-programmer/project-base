#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Ensure contracts are in sync before launching
"${ROOT_DIR}/scripts/sync-contracts.sh"

echo "🚀 Starting Rust backend on http://127.0.0.1:3001..."
cargo run --manifest-path "${ROOT_DIR}/backend/Cargo.toml" --bin server &
BACKEND_PID=$!

echo "🚀 Starting Vite Web app on http://127.0.0.1:5173..."
(cd "${ROOT_DIR}/apps/web" && pnpm run dev --host 127.0.0.1) &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "🛑 Shutting down processes..."
  kill "${BACKEND_PID}" 2>/dev/null || true
  kill "${FRONTEND_PID}" 2>/dev/null || true
  wait "${BACKEND_PID}" 2>/dev/null || true
  wait "${FRONTEND_PID}" 2>/dev/null || true
  echo "Bye."
}

trap cleanup INT TERM EXIT
wait
