# Agent Operational Rules & Invariants

You are operating within an **Agent-Native, Zero-Code-By-Human** repository. The human operator provides architectural intent and specifications; you provide verified, high-quality execution.

---

## The Inviolable Prime Directives

### 1. Spec-First Intent
- Before writing or modifying code, verify what spec governs the feature in `specs/modules/`.
- If no spec exists for a requested feature, check `SYSTEM.md` and propose or draft a concise spec in `specs/modules/<feature>.md` before implementing.

### 2. The Contract Bridge is One-Way (Rust -> TypeScript)
- **Rust domain models are the single source of truth.**
- Never manually write TypeScript interfaces for backend responses or payloads in `frontend/src/lib/contracts/`.
- Always derive `ts_rs::TS` on Rust structs and execute `scripts/sync-contracts.sh`.

### 3. Tiered Verification Loops
To preserve token economy and ensure velocity:
- **During iteration:** Run `./scripts/verify-fast.sh` (`cargo check` + `tsc --noEmit`). This must take under 3 seconds.
- **Before completion:** Run `./scripts/verify.sh` (full clippy warnings-as-errors, unit tests, frontend linter, and Playwright smoke tests).
- A task is NEVER done until `./scripts/verify.sh` succeeds with exit code `0`.

### 4. Environment & Secret Hygiene
- If `.envrc` does not exist when setting up a fresh clone, run `./scripts/setup.sh` or copy `.envrc.example` to `.envrc`.
- Never hardcode or commit secrets, account IDs, or access keys to version control. Always direct secret additions to `.envrc.local` or `.env.local`.

### 5. Living Ledger Maintenance (`SYSTEM.md`)
- As your final step before reporting completion to the operator, update `SYSTEM.md`:
  - Add or update the capability in the Capabilities table.
  - Document any updated contracts.
  - Note any new operational invariants.

---

## Common Verification Commands
```bash
./scripts/setup.sh           # One-command onboarding & dependency bootstrap
./scripts/sync-contracts.sh  # Generates TypeScript interfaces from Rust
./scripts/verify-fast.sh     # Fast type & syntax check (< 3s)
./scripts/verify.sh          # Full end-to-end verification suite
./scripts/dev.sh             # Starts backend and frontend concurrently
```
