# Module Spec: System Status & Health

## 1. Goal
Provide a lightweight, instant health check and runtime status report for operators and automated monitoring tools.

## 2. Requirements
- Endpoint: `GET /api/status`
- Response Payload (`SystemStatus`):
  - `healthy` (boolean): `true` if service is accepting requests and dependencies are reachable.
  - `uptime_secs` (number / u32): Number of elapsed seconds since the backend process started.
  - `version` (string): Current semantic version from `Cargo.toml`.
  - `environment` (string): Active environment (e.g., "development", "production").
- CORS: Allow requests from the local frontend origin (`http://127.0.0.1:5173` or `http://localhost:5173`).

## 3. Verification Criteria
- **Unit Test:** `health::tests::returns_status` verifies 200 OK and valid JSON matching `SystemStatus`.
- **Contract Sync:** `scripts/sync-contracts.sh` generates matching `SystemStatus` TS type.
- **Frontend Component:** Displays an active green pulse indicator, formatted uptime, and service version.
- **E2E Smoke Test:** Headless browser loads frontend, waits for status fetch, and verifies "System Healthy" is visible.
