# Modern Project Base (Agent-Native Starter Template)

> **A high-leverage starter template designed for operator-driven, zero-code software development.**

This template is built around a simple principle: **the human operator steers with high-level intent, and strict compiler/test feedback loops verify every line of agent-written code.**

---

## 🏛️ Architecture & Ergonomics

```text
modern-project-base/
├── SYSTEM.md                   # The Living Ledger: Current capabilities & data shapes
├── .opencode/                  # Cockpit instructions and rules for agents
│   └── rules.md                # Inviolable agent laws (spec-first, verify-to-finish)
├── specs/                      # Intent domain (human specifications in Markdown)
│   ├── overview.md
│   └── modules/
│       ├── system_status.md
│       ├── api_contracts.md
│       ├── aws_infrastructure.md
│       └── mobile_client.md
├── backend/                    # Rust (Axum 0.8 + Tokio + ts-rs)
│   ├── src/lib.rs              # API router & middleware
│   ├── src/api/health.rs       # Domain model & status handler
│   ├── src/api/error.rs        # Canonical ApiError & IntoResponse
│   └── src/bin/sync_types.rs   # Static TypeScript generator binary
├── packages/
│   └── contracts/              # Shared TypeScript types derived from Rust (DO NOT EDIT)
│       └── src/index.ts        # Single source of truth for Web and Mobile
├── apps/
│   ├── web/                    # TypeScript (Vite + React + Tailwind CSS)
│   │   ├── src/lib/api.ts      # Typed fetch client using @modern/contracts
│   │   ├── src/App.tsx         # System status dashboard
│   │   └── e2e/smoke.spec.ts   # Headless Playwright sensory smoke tests
│   └── mobile/                 # TypeScript (React Native + Expo)
│       ├── App.tsx             # Mobile status cockpit using @modern/contracts
│       └── app.json            # Expo configuration
├── infra/                      # AWS CDK (TypeScript)
│   ├── bin/app.ts              # CDK App entrypoint with offline fallback
│   └── lib/stacks/app-stack.ts # S3, CloudFront OAC, App Runner, Zero-CORS routing
└── scripts/                    # Deterministic verification pipelines
    ├── setup.sh                # One-command onboarding & dependency bootstrap
    ├── sync-contracts.sh       # Exports Rust types -> packages/contracts
    ├── verify-fast.sh          # Tier 1: sub-second syntax & type check across all workspaces
    ├── verify.sh               # Tier 2: full gate (Clippy + Tests + Linters + CDK Synth + E2E)
    ├── deploy.sh               # Platform-agnostic deploy to preview or production
    └── dev.sh                  # Starts backend & web frontend concurrently
```

---

## ⚡ The Feedback Loops

### 1. The One-Way Contract Bridge (Rust ➔ Shared Contracts)
Data contracts originate exclusively in Rust. Structs derive `ts_rs::TS`. When modified, running:
```bash
./scripts/sync-contracts.sh
```
instantly emits exact TypeScript types to `packages/contracts/src/index.ts`. Both `@modern/web` and `@modern/mobile` consume these contracts directly. Any mismatch between caller code and backend models triggers a compile error in TypeScript.

### 2. Tiered Verification
- **Tier 1 (During Agent Iteration):**
  ```bash
  ./scripts/verify-fast.sh
  ```
  Runs contract sync, `cargo check`, and parallel `tsc --noEmit` across all workspaces (`contracts`, `web`, `mobile`, `infra`) in ~1.5 seconds.
- **Tier 2 (Completion Gate):**
  ```bash
  ./scripts/verify.sh
  ```
  Runs contract sync & staleness verification (`--check`), Clippy (`-D warnings`), Rust unit tests, workspace TypeScript compilation, ESLint, AWS CDK CloudFormation offline synthesis (`cdk synth`), and a headless Playwright browser smoke test. **A task is never complete until this exits 0.**

### 3. The Living System Ledger (`SYSTEM.md`)
The human operator does not read raw diffs. Instead, agents update `SYSTEM.md` upon completing any feature with:
- Current active capabilities across Backend, Web, Mobile, and Cloud Infra.
- Live data contract signatures.
- Active operational invariants.

---

## 🚀 Getting Started

### 1. Instant Bootstrap & Verification
Clone or copy the template, then run the onboarding script:
```bash
./scripts/setup.sh
```
This automatically:
1. Validates Rust and Node/pnpm toolchains.
2. Initializes `.envrc` from `.envrc.example` (if missing).
3. Installs dependencies and downloads Playwright browser binaries.
4. Synchronizes contracts from Rust.
5. Executes the full verification suite.

### 2. Local Development
To launch both the backend API (`http://127.0.0.1:3001`) and Web UI (`http://127.0.0.1:5173`) with live reload:
```bash
./scripts/dev.sh
```

To run the mobile app bundler:
```bash
pnpm --filter @modern/mobile start
```

To synthesize AWS CloudFormation templates:
```bash
pnpm --filter @modern/infra synth
```

### 3. Deploying (Preview & Production)
Deployments are platform-agnostic and self-contained within `./scripts/deploy.sh`:

```bash
# Deploy or rolling-update dedicated Preview environment:
./scripts/deploy.sh preview

# Deploy to Production:
./scripts/deploy.sh production
```
The deploy pipeline enforces `./scripts/verify.sh` first, builds static web assets, deploys AWS CDK stacks, syncs assets to S3, and invalidates CloudFront.

### 4. Duplicating This Template For a New Project
```bash
cp -r /Users/toppenheimer/hacking/modern-project-base /Users/toppenheimer/hacking/my-new-app
cd /Users/toppenheimer/hacking/my-new-app
git init
./scripts/setup.sh
```
