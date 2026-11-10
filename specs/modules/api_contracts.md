# Module Spec: API Contracts & Unified Error Handling

## 1. Goal
Establish a robust, scalable contract registry and canonical API error envelope bridging the Rust backend and TypeScript frontend, preventing boundary drift and ad-hoc error shapes.

## 2. Requirements
- **Centralized Contract Export:**
  - `backend/src/bin/sync_types.rs` uses a clean declarative list or macro to register all domain models. Adding a new contract requires only adding the type to the registry.
  - Automatically exports all registered contracts into `frontend/src/lib/contracts/api.ts`.
- **Standardized API Error Envelope (`ApiError`):**
  - Rust struct `ApiError` implementing `Serialize`, `Deserialize`, `TS`, and `axum::response::IntoResponse`.
  - Fields:
    - `code`: machine-readable uppercase string (e.g. `NOT_FOUND`, `INTERNAL_ERROR`, `BAD_REQUEST`).
    - `message`: human-readable explanation.
    - `details`: optional structured JSON payload (`Option<serde_json::Value>`).
  - Helper constructors for common HTTP status codes (e.g. `bad_request`, `not_found`, `internal`).
- **Typed Frontend Client Integration:**
  - `frontend/src/lib/api.ts` provides a structured `ApiClientError` class containing the typed `ApiError` payload and HTTP status code.
  - Fetch helper parses JSON error envelopes from non-2xx responses.
- **Contract Drift Verification:**
  - `scripts/verify.sh` verifies that contracts in `frontend/src/lib/contracts/api.ts` are strictly up-to-date and match generated Rust models without uncommitted or manual drift.

## 3. Verification Criteria
- **Unit Tests:** Backend unit tests verify `ApiError` HTTP status code conversion, JSON structure, and serialization.
- **Contract Sync:** `scripts/sync-contracts.sh` exports both `SystemStatus` and `ApiError` into `frontend/src/lib/contracts/api.ts`.
- **Frontend Checks:** `frontend/src/lib/api.ts` type-checks cleanly and handles errors using `ApiClientError`.
- **Full Verification:** `./scripts/verify.sh` passes cleanly with 0 warnings, zero lint errors, and successful E2E smoke tests.
