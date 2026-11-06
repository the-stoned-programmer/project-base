#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=================================================="
echo "🛡️  RUNNING FULL VERIFICATION GATE"
echo "=================================================="

# 1. Sync contracts
"${ROOT_DIR}/scripts/sync-contracts.sh"

# 2. Rust Clippy (Zero Warnings Allowed)
echo "🦀 [Rust] Running Clippy with warnings as errors..."
cargo clippy --manifest-path "${ROOT_DIR}/backend/Cargo.toml" --all-targets -- -D warnings

# 3. Rust Unit & Integration Tests
echo "🦀 [Rust] Running backend tests..."
cargo test --manifest-path "${ROOT_DIR}/backend/Cargo.toml"

# 4. Frontend Type Check
echo "🎨 [Frontend] Running TypeScript compiler check..."
(cd "${ROOT_DIR}/frontend" && pnpm check)

# 5. Frontend Linter
echo "🎨 [Frontend] Running ESLint..."
(cd "${ROOT_DIR}/frontend" && pnpm lint)

# 6. E2E Browser Smoke Test (Playwright)
echo "🎭 [E2E] Running Playwright sensory smoke tests..."
(cd "${ROOT_DIR}/frontend" && pnpm test:e2e)

echo "=================================================="
echo "🎉 ALL VERIFICATION GATES PASSED (Exit Code: 0)"
echo "=================================================="
