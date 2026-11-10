# Module Spec: AWS Cloud Infrastructure (CDK)

## 1. Goal
Provide a production-ready, fully automated Infrastructure-as-Code (IaC) scaffold on AWS using AWS CDK in TypeScript, featuring unified single-domain routing (Zero-CORS), baked-in TLS, private S3 web hosting via CloudFront OAC, and containerized backend compute via AWS App Runner.

## 2. Architecture & Requirements
- **Tooling:** AWS CDK v2 in TypeScript, managed within the monorepo workspace.
- **Frontend Web Hosting & Asset Deployment:**
  - Private Amazon S3 bucket (`BlockPublicAccess.BLOCK_ALL`, `enforceSSL: true`).
  - Amazon CloudFront distribution using modern Origin Access Control (OAC).
  - Client-side SPA routing: custom error responses redirecting 404/403 to `/index.html` with status 200.
  - Automatic asset synchronization: `s3deploy.BucketDeployment` syncs `apps/web/dist` and triggers CloudFront cache invalidation (`/*`).
  - Security headers policy enforcing HTTPS and standard web protection.
- **Environment Strategy:**
  - Rolling `preview` environment: persistent, predictable preview deployment updated in-place without stack sprawl.
  - Production `production` environment: immutable data retention (`RemovalPolicy.RETAIN`).
  - Platform-agnostic deployment: `./scripts/deploy.sh [preview|production]` runnable locally, by agents, or in any CI runner.
- **Backend API Compute:**
  - AWS App Runner container service running the compiled Rust backend.
  - Built-in health check pointed to `/api/status`.
  - Automatic scaling configuration.
- **Unified Single-Domain Routing (Zero-CORS):**
  - CloudFront distribution routes `/*` to S3 (Web SPA).
  - CloudFront distribution routes `/api/*` to the App Runner backend origin.
  - No cross-origin preflight latency or CORS configuration issues.
- **Offline Deterministic Verification:**
  - `cdk synth` executes completely offline in < 2 seconds without requiring active AWS credentials or creating cloud resources during `./scripts/verify.sh`.
  - Configured with graceful fallback account and region values.

## 3. Verification Criteria
- **Type Check:** `pnpm --filter infra check` passes cleanly.
- **Lint Check:** `pnpm --filter infra lint` passes with 0 warnings.
- **Synthesis:** `cdk synth --quiet` exits with code `0` offline.
