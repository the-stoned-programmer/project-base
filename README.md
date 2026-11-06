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
│       └── system_status.md
├── backend/                    # Rust (Axum 0.8 + Tokio + ts-rs)
│   ├── src/lib.rs              # API router & middleware
│   ├── src/api/health.rs       # Domain model & status handler
│   └── src/bin/sync_types.rs   # Static TypeScript generator binary
├── frontend/                   # TypeScript (Vite + React + Tailwind CSS)
│   ├── src/lib/contracts/      # Auto-generated types from Rust (DO NOT EDIT)
│   ├── src/lib/api.ts          # Typed fetch client
│   ├── src/App.tsx             # System status dashboard
│   └── e2e/smoke.spec.ts       # Headless Playwright sensory smoke tests
└── scripts/                    # Deterministic verification pipelines
    ├── sync-contracts.sh       # Exports Rust types -> TypeScript interfaces
    ├── verify-fast.sh          # Tier 1: sub-second syntax & type check
    ├── verify.sh               # Tier 2: full verification gate (Clippy + Tests + E2E)
    └── dev.sh                  # Starts backend & frontend concurrently
```

---

## ⚡ The Feedback Loops

### 1. The One-Way Contract Bridge (Rust ➔ TypeScript)
Data contracts originate exclusively in Rust. Structs derive `ts_rs::TS`. When modified, running:
```bash
./scripts/sync-contracts.sh
```
instantly emits exact TypeScript types to `frontend/src/lib/contracts/api.ts`. Any mismatch between frontend caller code and backend models triggers a compile error in TypeScript.

### 2. Tiered Verification
- **Tier 1 (During Agent Iteration):**
  ```bash
  ./scripts/verify-fast.sh
  ```
  Runs `cargo check` and `tsc --noEmit` in under 1 second. Fast feedback without burning context tokens on heavy builds.
- **Tier 2 (Completion Gate):**
  ```bash
  ./scripts/verify.sh
  ```
  Runs contract sync, Clippy (`-D warnings`), Rust unit tests, TypeScript compilation, ESLint, and a headless Playwright browser smoke test. **A task is never complete until this exits 0.**

### 3. The Living System Ledger (`SYSTEM.md`)
The human operator does not read raw diffs. Instead, agents update `SYSTEM.md` upon completing any feature with:
- Current active capabilities.
- Live data contract signatures.
- Active operational invariants.

---

## 🚀 Getting Started

### Local Development
To launch both the backend API (`http://127.0.0.1:3001`) and frontend UI (`http://127.0.0.1:5173`) with live reload:
```bash
./scripts/dev.sh
```

### Duplicating This Template For a New Project
```bash
cp -r /Users/toppenheimer/hacking/modern-project-base /Users/toppenheimer/hacking/my-new-app
cd /Users/toppenheimer/hacking/my-new-app
git init
./scripts/verify.sh
```
