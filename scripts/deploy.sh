#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TARGET_ENV="preview"
DEPLOY_MOBILE=true
BUILD_NATIVE_BINARIES=false

for arg in "$@"; do
  case "$arg" in
    preview|production)
      TARGET_ENV="$arg"
      ;;
    --no-mobile)
      DEPLOY_MOBILE=false
      ;;
    --build-binaries)
      BUILD_NATIVE_BINARIES=true
      ;;
    *)
      echo "❌ Error: Unknown argument '${arg}'."
      echo "Usage: ./scripts/deploy.sh [preview|production] [--no-mobile] [--build-binaries]"
      exit 1
      ;;
  esac
done

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

# 5. Mobile Deployment (OTA or Native Store Build via EAS)
if [[ "${DEPLOY_MOBILE}" == "true" ]]; then
  echo ""
  echo "📱 Checking Mobile Deployment (EAS) status..."
  if command -v npx >/dev/null 2>&1 && (cd "${ROOT_DIR}/apps/mobile" && npx --yes eas-cli whoami --non-interactive >/dev/null 2>&1); then
    if [[ "${BUILD_NATIVE_BINARIES}" == "true" ]]; then
      echo "📱 Triggering native store compilation via 'eas build --profile ${TARGET_ENV}'..."
      (cd "${ROOT_DIR}/apps/mobile" && npx --yes eas-cli build --profile "${TARGET_ENV}" --non-interactive)
    else
      echo "📱 Publishing Over-The-Air (OTA) update to channel '${TARGET_ENV}'..."
      (cd "${ROOT_DIR}/apps/mobile" && npx --yes eas-cli update --auto --channel "${TARGET_ENV}" --non-interactive)
    fi
    echo "✅ Mobile deployment completed successfully."
  else
    echo "ℹ️  Mobile deployment skipped: EAS credentials/project not configured."
    echo "👉 To enable mobile deployment: run 'cd apps/mobile && npx eas login && npx eas project:init'."
  fi
fi

echo ""
echo "=================================================="
echo "🎉 DEPLOYMENT COMPLETE! [${TARGET_ENV^^}] IS LIVE"
echo "=================================================="
echo "To inspect live outputs or URL, check the CloudFormation outputs above."
echo "=================================================="
