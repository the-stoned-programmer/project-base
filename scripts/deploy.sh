#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TARGET_ENV="${1:-preview}"

if [[ "${TARGET_ENV}" != "preview" && "${TARGET_ENV}" != "production" ]]; then
  echo "❌ Error: Invalid environment '${TARGET_ENV}'."
  echo "Usage: ./scripts/deploy.sh [preview|production]"
  exit 1
fi

echo "=================================================="
echo "🚀 MODERN PROJECT BASE: DEPLOYING TO [${TARGET_ENV^^}]"
echo "=================================================="

# 1. AWS Credentials & Context Check
if [[ -z "${AWS_PROFILE:-}" && -z "${AWS_ACCESS_KEY_ID:-}" && -z "${CDK_DEFAULT_ACCOUNT:-}" ]]; then
  echo "❌ Error: No AWS credentials or account context detected."
  echo "👉 Please configure AWS_PROFILE or AWS credentials in '.envrc' or '.envrc.local'."
  echo "   See '.envrc.example' for guidance."
  exit 1
fi

# 2. Enforce Verification Gate
echo "🛡️  Running full verification gate before deployment..."
"${ROOT_DIR}/scripts/verify.sh"

# 3. Build Web Application Production Assets
echo "📦 Building static web application assets (Vite)..."
(cd "${ROOT_DIR}/apps/web" && pnpm build)

# 4. Deploy via AWS CDK
echo "☁️  Deploying CloudFormation stack 'ModernAppStack-${TARGET_ENV}'..."
export ENVIRONMENT="${TARGET_ENV}"
(cd "${ROOT_DIR}" && pnpm --filter @modern/infra cdk deploy "ModernAppStack-${TARGET_ENV}" --require-approval never)

echo ""
echo "=================================================="
echo "🎉 DEPLOYMENT COMPLETE! [${TARGET_ENV^^}] IS LIVE"
echo "=================================================="
echo "To inspect live outputs or URL, check the CloudFormation outputs above."
echo "=================================================="
