#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 [Contract Bridge] Syncing Rust domain models to TypeScript..."
cargo run --manifest-path "${ROOT_DIR}/backend/Cargo.toml" --bin sync_types -- "${ROOT_DIR}/frontend/src/lib/contracts"
echo "✅ Contracts synced successfully."
