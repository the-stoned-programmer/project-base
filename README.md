# Modern Project Base ⚡

**An agent-native, operator-driven foundation for zero-code software engineering.**

---

## The Thesis

Frontier AI models have permanently shifted the primary bottleneck of software engineering. When autonomous agents can draft entire implementations in seconds, **source code ceases to be the primary human user interface**.

Instead, the human acts as an **operator steering with high-level architectural intent**, while deterministic compiler feedback loops and automated test gates verify every line of agent-written code.

However, traditional codebases actively fight autonomous agents:
- **Boundary Drift:** Backend routes change, frontend callers break, and mocked unit tests pass anyway.
- **Context Bloat:** Massive build times, noisy linter outputs, and manual code reviews burn agent context window tokens without improving artifact quality.
- **Organizational Silos:** Multi-repo setups divide the backend, frontend, mobile client, and infrastructure into disconnected silos that prevent atomic cross-stack features.

`modern-project-base` eliminates these failure modes. It anchors the entire platform in a **single source of truth**, connects all tiers via a **one-way type contract bridge**, and enforces **tiered, sub-second deterministic verification** before any change can land.

---

## Core Capabilities

- **One-Way Contract Bridge (Rust ➔ TypeScript)**:
  - Rust domain structs derive `ts-rs` and serve as the single source of truth.
  - `./scripts/sync-contracts.sh` compiles exact TypeScript interfaces to `@modern/contracts` in < 0.3s.
  - Frontend (`apps/web`) and mobile (`apps/mobile`) codebases get compile-time type safety with zero manual type definitions.
- **Unified Full-Stack Monorepo**:
  - **Backend (`backend/`):** High-performance asynchronous Rust API service powered by Axum 0.8 and Tokio.
  - **Web (`apps/web/`):** Real-time operator cockpit built with Vite, React 18, and Tailwind CSS.
  - **Mobile (`apps/mobile/`):** Cross-platform iOS and Android client powered by React Native and Expo, sharing the exact same backend contracts.
  - **Cloud Infrastructure (`infra/`):** AWS CDK (TypeScript) deploying an S3 + CloudFront static site and AWS App Runner container backend.
- **Multi-Tiered Verification Loops**:
  - **Tier 1 (Sub-Second Iteration):** `./scripts/verify-fast.sh` syncs contracts, checks Rust syntax, and verifies TypeScript across all workspaces in ~1.5s.
  - **Tier 2 (Completion Gate):** `./scripts/verify.sh` enforces Clippy warnings-as-errors, unit tests, linters, offline `cdk synth`, and headless Playwright sensory smoke tests.
- **Single-Domain Routing & Zero CORS**:
  - CloudFront distribution routes `/*` to S3 (Web SPA) and `/api/*` directly to App Runner.
  - Baked-in TLS/HTTPS, zero cross-origin preflight latency, and seamless cookie authentication.
- **Platform-Agnostic Rolling Deployments**:
  - Self-sovereign `./scripts/deploy.sh [preview|production]` script works identically on an operator's laptop, in an agent session, or in any CI runner.
  - Dedicated, rolling Preview environment (`ModernAppStack-preview`) updated in-place with zero stack sprawl.
  - Optional Over-The-Air (OTA) updates push mobile code revisions to phones in ~30s via Expo EAS.
- **The Living System Ledger (`SYSTEM.md`)**:
  - Human operators do not read raw code diffs.
  - Agents maintain `SYSTEM.md` on every feature completion as an executive briefing of active capabilities, contract signatures, and invariants.

---

## Architecture Topology

```text
modern-project-base/
├── SYSTEM.md                   # The Living Ledger: Single source of truth for active state
├── .opencode/rules.md          # Inviolable agent directives and operational laws
├── pnpm-workspace.yaml         # Monorepo workspaces: apps/*, packages/*, infra
├── specs/                      # Intent domain (human specifications in Markdown)
│   ├── overview.md
│   └── modules/
│       ├── system_status.md
│       ├── api_contracts.md
│       ├── aws_infrastructure.md
│       └── mobile_client.md
│
├── backend/                    # Rust (Axum 0.8 + Tokio) API Service
│   ├── src/lib.rs              # Router, CORS, and tracing middleware
│   ├── src/api/health.rs       # System health & status domain models
│   ├── src/api/error.rs        # Canonical ApiError with Axum IntoResponse
│   ├── src/bin/sync_types.rs   # Contract exporter binary
│   └── Dockerfile              # Multi-stage release container build
│
├── packages/
│   └── contracts/              # Shared TypeScript types auto-generated from Rust
│       └── src/index.ts        # Single source of truth for Web and Mobile
│
├── apps/
│   ├── web/                    # Vite + React 18 + Tailwind CSS (Operator Cockpit)
│   │   ├── src/lib/api.ts      # Typed client using @modern/contracts
│   │   ├── src/App.tsx         # System status dashboard
│   │   └── e2e/smoke.spec.ts   # Headless Playwright sensory smoke tests
│   └── mobile/                 # React Native + Expo (Mobile Client)
│       ├── App.tsx             # Mobile status cockpit using @modern/contracts
│       ├── app.json            # Expo configuration
│       └── eas.json            # EAS build & OTA update profiles
│
├── infra/                      # AWS CDK (TypeScript) Cloud Infrastructure
│   ├── bin/app.ts              # CDK entrypoint with offline synth fallbacks
│   └── lib/stacks/app-stack.ts # S3, CloudFront OAC, App Runner, Zero-CORS routing
│
└── scripts/                    # Deterministic verification and execution pipelines
    ├── setup.sh                # One-command onboarding & dependency bootstrap
    ├── sync-contracts.sh       # Exports Rust models -> packages/contracts
    ├── verify-fast.sh          # Tier 1: sub-second syntax & type check across all workspaces
    ├── verify.sh               # Tier 2: full gate (Clippy + Tests + Linters + CDK Synth + E2E)
    ├── deploy.sh               # Platform-agnostic deploy to preview or production
    └── dev.sh                  # Launches Rust backend, Web, and Mobile bundler concurrently
```

---

## Quickstart

### 1. Instant Bootstrap & Verification
Clone the template and run the onboarding script:

```bash
./scripts/setup.sh
```

This automatically:
1. Validates Rust (`cargo`) and Node (`pnpm`) toolchains.
2. Initializes `.envrc` from `.envrc.example` (if missing).
3. Installs monorepo workspace dependencies and downloads Playwright browser binaries.
4. Synchronizes contracts from Rust domain models.
5. Executes the full `./scripts/verify.sh` test gate.

### 2. Launch the Local Cockpit
To launch the entire platform concurrently:

```bash
./scripts/dev.sh
```

- **Rust Backend:** [http://127.0.0.1:3001](http://127.0.0.1:3001)
- **Vite Web App:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Expo Mobile Bundler:** [http://127.0.0.1:8081](http://127.0.0.1:8081) *(scan QR code with Expo Go)*

*(Tip: pass `--no-mobile` if you only want Backend and Web)*.

### 3. Deploy to AWS & Mobile
Deployments are completely platform-agnostic:

```bash
# Deploy or rolling-update dedicated Preview environment:
./scripts/deploy.sh preview

# Deploy to Production:
./scripts/deploy.sh production
```

The pipeline enforces `./scripts/verify.sh` first, builds static web assets, deploys AWS CDK stacks, syncs assets to S3 with CloudFront cache invalidation, and triggers mobile updates via Expo EAS.

---

## The Inviolable Agent Laws

All autonomous agents operating in this codebase are bound by the directives codified in `.opencode/rules.md`:

1. **Spec-First Intent:** Check or draft specs in `specs/modules/` before writing code.
2. **One-Way Contract Bridge:** Rust is the single source of truth. TypeScript interfaces are NEVER handwritten for backend entities.
3. **Tiered Verification:** Fast feedback loop (`./scripts/verify-fast.sh`) during iteration; completion gate (`./scripts/verify.sh`) before declaring any task done.
4. **Offline Determinism:** CloudFormation synthesis (`cdk synth`) and all workspace tests must pass completely offline without live cloud credentials.
5. **Living Ledger Maintenance:** Keep `SYSTEM.md` updated with any capability, contract, or invariant changes before concluding any session.

---

## Roadmap

- [x] Axum 0.8 asynchronous Rust API backend with status and health monitoring.
- [x] Canonical `ApiError` domain model with Axum `IntoResponse` and typed frontend client.
- [x] Declarative TypeScript contract export bridge via `ts-rs` and `sync_types` registry.
- [x] Strict contract drift guard (`sync-contracts.sh --check`).
- [x] React 18 / Vite / Tailwind CSS operator cockpit with Playwright E2E smoke tests.
- [x] React Native / Expo cross-platform mobile client consuming shared contracts.
- [x] AWS CDK TypeScript infrastructure (S3 + CloudFront OAC + App Runner + Zero-CORS).
- [x] Platform-agnostic rolling preview and production deployer (`scripts/deploy.sh`).
- [x] Idempotent one-command onboarding bootstrap (`scripts/setup.sh`).
- [ ] Database persistence layer template (PostgreSQL / SQLite via SQLx).
- [ ] Unified authentication & session management module (Cognito / JWT).
- [ ] Bidirectional architecture cartography visualization via `/map`.

---

## License

MIT
