# Module Spec: Mobile Client Application

## 1. Goal
Provide a cross-platform mobile client application (iOS and Android) powered by React Native and Expo in TypeScript, directly consuming the auto-generated Rust domain contracts without duplication.

## 2. Architecture & Requirements
- **Framework:** React Native / Expo with strict TypeScript.
- **Contract Sharing:** Directly imports domain contracts (`SystemStatus`, `ApiError`) from `@modern/contracts`.
- **Sensory Dashboard:**
  - Displays real-time backend health, server uptime, and engine version.
  - Gracefully displays degraded state and parsed error message if backend is unreachable or returns `ApiError`.
  - Refresh control to manually poll backend status.
- **Headless & Deterministic Verification:**
  - Does not require running slow mobile simulators or emulators during `./scripts/verify.sh`.
  - Type-checked via `tsc --noEmit` and linted via ESLint within milliseconds.
- **Build & Release Automation:**
  - `eas.json` defines build profiles for `development`, `preview`, and `production`.
  - Over-The-Air (OTA) updates push TypeScript/UI revisions instantly to preview/production channels.
  - Unified deployment via `./scripts/deploy.sh [preview|production]` with non-blocking EAS auth fallback.

## 3. Verification Criteria
- **Type Check:** `pnpm --filter mobile check` passes cleanly.
- **Lint Check:** `pnpm --filter mobile lint` passes with 0 warnings.
- **Contract Conformance:** Any modification to Rust domain models immediately reflects into the mobile codebase during `scripts/sync-contracts.sh`.
