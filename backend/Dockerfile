# -----------------------------------------------------------------------------
# Stage 1: Build Release Binary
# -----------------------------------------------------------------------------
FROM rust:1.85-slim AS builder
WORKDIR /app

# Pre-cache dependency layer
COPY Cargo.toml Cargo.lock ./
RUN mkdir -p src/bin src/api && \
    echo 'fn main() {}' > src/main.rs && \
    echo 'fn main() {}' > src/bin/sync_types.rs && \
    echo 'pub mod api;' > src/lib.rs && \
    echo 'pub mod health; pub mod error;' > src/api/mod.rs && \
    echo 'pub struct SystemStatus;' > src/api/health.rs && \
    echo 'pub struct ApiError;' > src/api/error.rs && \
    cargo build --release --bin server || true

# Copy actual source code and build final server binary
COPY src ./src
RUN touch src/main.rs src/lib.rs && \
    cargo build --release --bin server

# -----------------------------------------------------------------------------
# Stage 2: Minimal Runtime Container
# -----------------------------------------------------------------------------
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/server /app/server

ENV PORT=3001
ENV ENVIRONMENT=production
EXPOSE 3001

CMD ["/app/server"]
