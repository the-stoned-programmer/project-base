# System Ledger (Living State)

> **Role of this document:** Single source of truth for current system capabilities, data contracts, and architectural state. The operator consults this to steer; the agent updates this upon completing any task.

---

## 1. System Overview
- **Architecture:** Decoupled Rust (Axum) API backend + TypeScript (Vite/React/Tailwind) frontend.
- **Contract Bridge:** Static type generation from Rust domain structs to TypeScript interfaces via `scripts/sync-contracts.sh`.
- **Verification Engine:** Multi-tiered deterministic verification (`verify-fast.sh` and `verify.sh`).

---

## 2. Current Capabilities
| Domain | Feature | Status | Description |
|---|---|---|---|
| **Backend** | System Health API | Active | `GET /api/status` returns uptime, health flag, and engine version. |
| **Contract** | Rust -> TS Bridge | Active | Domain models sync to `frontend/src/lib/contracts/api.ts`. |
| **Frontend** | System Dashboard | Active | Real-time status display polling backend health endpoint. |
| **Testing** | Sensory E2E Smoke | Active | Playwright headless browser asserts UI + API integration. |

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

---

## 4. Operational Invariants
1. **Zero Unchecked Code:** No PR or feature is complete without `./scripts/verify.sh` exiting `0`.
2. **Contract Directionality:** Backend is the single source of truth. TypeScript types are NEVER handwritten for backend entities.
3. **Ledger Freshness:** Every agent session ending in code changes MUST update this `SYSTEM.md` file before signing off.
