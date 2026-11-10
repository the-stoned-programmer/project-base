#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Ensure contract bridge is synchronized before type checks
"${ROOT_DIR}/scripts/sync-contracts.sh"

echo "⚡ [Tier 1: Fast Check] Checking Rust backend syntax & types..."
cargo check --manifest-path "${ROOT_DIR}/backend/Cargo.toml"

echo "⚡ [Tier 1: Fast Check] Checking TypeScript strict compiler across all workspaces..."
(cd "${ROOT_DIR}" && pnpm -r check)

echo "✨ All fast checks passed."
