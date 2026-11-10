#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=================================================="
echo "🛡️  RUNNING FULL VERIFICATION GATE"
echo "=================================================="

# 1. Sync and verify contracts
"${ROOT_DIR}/scripts/sync-contracts.sh"
"${ROOT_DIR}/scripts/sync-contracts.sh" --check

# 2. Rust Clippy (Zero Warnings Allowed)
echo "🦀 [Rust] Running Clippy with warnings as errors..."
cargo clippy --manifest-path "${ROOT_DIR}/backend/Cargo.toml" --all-targets -- -D warnings

# 3. Rust Unit & Integration Tests
echo "🦀 [Rust] Running backend tests..."
cargo test --manifest-path "${ROOT_DIR}/backend/Cargo.toml"

# 4. Monorepo TypeScript Check (Contracts, Web, Mobile, Infra)
echo "🎨 [Workspaces] Running TypeScript compiler across all projects..."
(cd "${ROOT_DIR}" && pnpm -r check)

# 5. Monorepo Linter
echo "🎨 [Workspaces] Running ESLint across all projects..."
(cd "${ROOT_DIR}" && pnpm -r lint)

# 6. AWS CDK Infrastructure Offline Synthesis
echo "☁️  [Infra] Synthesizing AWS CDK CloudFormation templates..."
(cd "${ROOT_DIR}" && pnpm --filter @modern/infra synth --quiet)

# 7. E2E Browser Smoke Test (Playwright against Web & API)
echo "🎭 [E2E] Running Playwright sensory smoke tests..."
(cd "${ROOT_DIR}/apps/web" && pnpm test:e2e)

echo "=================================================="
echo "🎉 ALL VERIFICATION GATES PASSED (Exit Code: 0)"
echo "=================================================="
