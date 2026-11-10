# System Ledger (Living State)

> **Role of this document:** Single source of truth for current system capabilities, data contracts, and architectural state. The operator consults this to steer; the agent updates this upon completing any task.

---

## 1. System Overview
- **Architecture:** Unified monorepo containing:
  - **Backend (`backend/`):** Rust (Axum 0.8 + Tokio) API server.
  - **Contracts (`packages/contracts/`):** Shared TypeScript package auto-generated from Rust domain structs.
  - **Web (`apps/web/`):** TypeScript (React 18 + Vite + Tailwind CSS) operator cockpit.
  - **Mobile (`apps/mobile/`):** TypeScript (React Native + Expo) cross-platform mobile client.
  - **Infrastructure (`infra/`):** AWS CDK (TypeScript) deploying S3, CloudFront with OAC, and AWS App Runner.
- **Contract Bridge:** Static type generation from Rust domain models to `@modern/contracts` via `scripts/sync-contracts.sh`.
- **Verification Engine:** Multi-tiered deterministic verification (`verify-fast.sh` and `verify.sh`).

---

## 2. Current Capabilities
| Domain | Feature | Status | Description |
|---|---|---|---|
| **Backend** | System Health API | Active | `GET /api/status` returns uptime, health flag, and engine version. |
| **Backend** | Canonical API Error | Active | `ApiError` domain model implementing Axum `IntoResponse` with status codes, machine-readable codes, and optional JSON details. |
| **Contract** | Rust -> TS Bridge & Registry | Active | Domain models sync to `packages/contracts/src/index.ts` via declarative `export_contracts!` macro; includes `--check` staleness guard. |
| **Web** | Operator Dashboard | Active | Real-time status display polling backend health endpoint with automatic error boundary display. |
| **Web** | Typed API Client | Active | `apiFetch` and `ApiClientError` in `apps/web/src/lib/api.ts` providing structured error extraction. |
| **Mobile** | Mobile Status Cockpit | Active | React Native / Expo application (`apps/mobile`) importing `@modern/contracts` directly; verifies headlessly via `tsc`. |
| **Infra** | AWS Cloud Infrastructure | Active | AWS CDK stack (`infra/`) provisioning private S3 web hosting via CloudFront OAC, AWS App Runner backend container, unified zero-CORS routing, and offline `cdk synth`. |
| **Infra** | Platform-Agnostic Deployment | Active | `./scripts/deploy.sh [preview\|production]` builds web assets, verifies baseline, deploys CDK stacks, and syncs S3 with CloudFront invalidation. |
| **Testing** | Sensory E2E Smoke | Active | Playwright headless browser asserts Web UI + Axum API integration for both nominal and degraded error responses. |
| **Tooling** | Operator Onboarding & Env Bootstrap | Active | `./scripts/setup.sh` validates toolchains, instantiates `.envrc` from `.envrc.example`, installs Playwright browsers, and verifies baseline. |

---

## 3. Data Contracts
### `SystemStatus` (Synced from Rust)
```typescript
export type SystemStatus = {
  healthy: boolean;
  uptime_secs: number;
  version: string;
  environment: string;
};
```

### `ApiError` (Synced from Rust)
```typescript
export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
```

---

## 4. Operational Invariants
1. **Zero Unchecked Code:** No PR or feature is complete without `./scripts/verify.sh` exiting `0`.
2. **Contract Directionality:** Backend is the single source of truth. TypeScript types are NEVER handwritten for backend entities.
3. **Continuous Contract Purity:** `sync-contracts.sh` keeps `@modern/contracts` identical to Rust source; `verify.sh` runs `--check` to guarantee zero contract staleness.
4. **Offline Deterministic Verification:** `cdk synth` and all workspace checks must execute completely offline without requiring live AWS credentials or cloud calls during `./scripts/verify.sh`.
5. **Environment & Secret Hygiene:** Live environment files (`.envrc`, `.envrc.local`, `*.local`) remain strictly uncommitted; onboarding relies on `.envrc.example`.
6. **Ledger Freshness:** Every agent session ending in code changes MUST update this `SYSTEM.md` file before signing off.
