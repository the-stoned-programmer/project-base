#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${ROOT_DIR}/packages/contracts/src"

if [[ "${1:-}" == "--check" ]]; then
  TMP_DIR="$(mktemp -d)"
  trap 'rm -rf "${TMP_DIR}"' EXIT
  cargo run --manifest-path "${ROOT_DIR}/backend/Cargo.toml" --bin sync_types --quiet -- "${TMP_DIR}"
  if ! diff -u "${TARGET_DIR}/index.ts" "${TMP_DIR}/index.ts" > /dev/null; then
    echo "❌ [Contract Bridge] TypeScript contracts are out of sync with Rust models!"
    echo "Run ./scripts/sync-contracts.sh to regenerate contracts."
    exit 1
  fi
  echo "✅ [Contract Bridge] Contracts are verified and up-to-date."
  exit 0
fi

echo "🔄 [Contract Bridge] Syncing Rust domain models to TypeScript..."
cargo run --manifest-path "${ROOT_DIR}/backend/Cargo.toml" --bin sync_types -- "${TARGET_DIR}"
echo "✅ Contracts synced successfully."
