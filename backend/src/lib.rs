pub mod api;

use api::health::{AppState, get_status};
use axum::{routing::get, Router};
use std::sync::Arc;
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

pub fn create_router() -> Router {
    let state = Arc::new(AppState {
        start_time: Instant::now(),
        environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/api/status", get(get_status))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
