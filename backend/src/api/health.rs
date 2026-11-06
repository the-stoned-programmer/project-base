use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Instant;
use ts_rs::TS;

#[derive(Clone)]
pub struct AppState {
    pub start_time: Instant,
    pub environment: String,
}

#[derive(Serialize, Deserialize, TS, Debug, Clone, PartialEq)]
#[ts(export_to = "contracts.ts")]
pub struct SystemStatus {
    pub healthy: bool,
    pub uptime_secs: u32,
    pub version: String,
    pub environment: String,
}

pub async fn get_status(State(state): State<Arc<AppState>>) -> Json<SystemStatus> {
    let uptime_secs = state.start_time.elapsed().as_secs() as u32;

    Json(SystemStatus {
        healthy: true,
        uptime_secs,
        version: env!("CARGO_PKG_VERSION").to_string(),
        environment: state.environment.clone(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_status() {
        let state = Arc::new(AppState {
            start_time: Instant::now(),
            environment: "test".to_string(),
        });

        let response = get_status(State(state)).await;
        assert!(response.healthy);
        assert_eq!(response.environment, "test");
        assert_eq!(response.version, env!("CARGO_PKG_VERSION"));
    }
}
