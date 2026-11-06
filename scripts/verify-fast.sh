#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "⚡ [Tier 1: Fast Check] Checking Rust backend syntax & types..."
cargo check --manifest-path "${ROOT_DIR}/backend/Cargo.toml"

echo "⚡ [Tier 1: Fast Check] Checking TypeScript strict compiler..."
(cd "${ROOT_DIR}/frontend" && pnpm check)

echo "✨ All fast checks passed."
