use axum::{
    routing::{get, post},
    http::StatusCode,
    Json, Router,
    extract::State,
    response::IntoResponse,
};
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};
use serde::{Serialize, Deserialize};
use log::{info, error};
use wolf63x_core::{
    wallet::Wallet,
    trader::Trader,
    scanner::Scanner,
    filters::TokenFilter,
    logger::Logger,
    config::ConfigManager,
};

// App state shared between routes
struct AppState {
    wallet: Mutex<Wallet>,
    trader: Mutex<Trader>,
    scanner: Mutex<Scanner>,
    filter: Mutex<TokenFilter>,
    logger: Mutex<Logger>,
    config: Mutex<ConfigManager>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
    env_logger::init();
    info!("Starting Wolf63x Solana Sniper Bot");
    
    // Initialize app state
    let app_state = Arc::new(AppState {
        wallet: Mutex::new(Wallet::new()),
        trader: Mutex::new(Trader::new(Wallet::new(), "https://api.mainnet-beta.solana.com".to_string())),
        scanner: Mutex::new(Scanner::new()),
        filter: Mutex::new(TokenFilter::new()),
        logger: Mutex::new(Logger::new()),
        config: Mutex::new(ConfigManager::new()),
    });

    // Start Pump.fun websocket scanner
    {
        let scanner = app_state.scanner.clone();
        tokio::spawn(async move {
            let mut scanner = scanner.lock().unwrap();
            scanner.start_pump_fun_ws().await;
        });
    }
    
    // Setup CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    
    // Build router with routes
    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/wallet/connect", post(connect_wallet))
        .route("/api/wallet/disconnect", post(disconnect_wallet))
        .route("/api/wallet/balance", get(get_balance))
        .route("/api/snipe", post(snipe_token))
        .route("/api/sell", post(sell_token))
        .route("/api/scanner/start", post(start_scanner))
        .route("/api/scanner/stop", post(stop_scanner))
        .route("/api/scanner/opportunities", get(get_opportunities))
        .route("/api/trades", get(get_trades))
        .route("/api/config", get(get_config).post(update_config))
        .nest_service("/", ServeDir::new("public"))
        .layer(cors)
        .with_state(app_state);
    
    // Start the server
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    info!("Server listening on http://localhost:3000");
    axum::serve(listener, app).await?;
    
    Ok(())
}

// API route handlers

async fn health_check() -> &'static str {
    "Wolf63x Solana Sniper Bot is running"
}

#[derive(Deserialize)]
struct WalletConnectRequest {
    wallet_type: String,
}

#[derive(Serialize)]
struct WalletConnectResponse {
    address: String,
    balance: f64,
}

async fn connect_wallet(
    State(state): State<Arc<AppState>>,
    Json(request): Json<WalletConnectRequest>,
) -> impl IntoResponse {
    let mut wallet = state.wallet.lock().unwrap();
    
    match wallet.connect(&request.wallet_type).await {
        Ok(address) => {
            let balance = wallet.get_balance().await.unwrap_or(0.0);
            
            let response = WalletConnectResponse {
                address,
                balance,
            };
            
            (StatusCode::OK, Json(response))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to connect wallet"
            })))
        }
    }
}

async fn disconnect_wallet(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let mut wallet = state.wallet.lock().unwrap();
    
    match wallet.disconnect() {
        Ok(_) => {
            (StatusCode::OK, Json(serde_json::json!({
                "success": true
            })))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to disconnect wallet"
            })))
        }
    }
}

async fn get_balance(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let wallet = state.wallet.lock().unwrap();
    
    match wallet.get_balance().await {
        Ok(balance) => {
            (StatusCode::OK, Json(serde_json::json!({
                "balance": balance
            })))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to get balance"
            })))
        }
    }
}

#[derive(Deserialize)]
struct SnipeRequest {
    token_address: String,
    amount: f64,
    slippage: f64,
}

async fn snipe_token(
    State(state): State<Arc<AppState>>,
    Json(request): Json<SnipeRequest>,
) -> impl IntoResponse {
    let trader = state.trader.lock().unwrap();
    
    match trader.snipe_token(&request.token_address, request.amount, request.slippage).await {
        Ok(signature) => {
            (StatusCode::OK, Json(serde_json::json!({
                "signature": signature
            })))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to snipe token"
            })))
        }
    }
}

#[derive(Deserialize)]
struct SellRequest {
    token_address: String,
    amount: f64,
    slippage: f64,
}

async fn sell_token(
    State(state): State<Arc<AppState>>,
    Json(request): Json<SellRequest>,
) -> impl IntoResponse {
    let trader = state.trader.lock().unwrap();
    
    match trader.sell_token(&request.token_address, request.amount, request.slippage).await {
        Ok(signature) => {
            (StatusCode::OK, Json(serde_json::json!({
                "signature": signature
            })))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to sell token"
            })))
        }
    }
}

async fn start_scanner(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let mut scanner = state.scanner.lock().unwrap();
    
    match scanner.start() {
        Ok(_) => {
            (StatusCode::OK, Json(serde_json::json!({
                "success": true
            })))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to start scanner"
            })))
        }
    }
}

async fn stop_scanner(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let mut scanner = state.scanner.lock().unwrap();
    
    match scanner.stop() {
        Ok(_) => {
            (StatusCode::OK, Json(serde_json::json!({
                "success": true
            })))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to stop scanner"
            })))
        }
    }
}

async fn get_opportunities(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let scanner = state.scanner.lock().unwrap();
    
    match scanner.get_opportunities() {
        Ok(opportunities) => {
            (StatusCode::OK, Json(opportunities))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to get opportunities"
            })))
        }
    }
}

async fn get_trades(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let logger = state.logger.lock().unwrap();
    
    match logger.get_trade_logs() {
        Ok(logs) => {
            (StatusCode::OK, Json(logs))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to get trade logs"
            })))
        }
    }
}

async fn get_config(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let config_manager = state.config.lock().unwrap();
    
    match config_manager.get_config() {
        Ok(config) => {
            (StatusCode::OK, Json(config))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to get configuration"
            })))
        }
    }
}

async fn update_config(
    State(state): State<Arc<AppState>>,
    Json(config): Json<serde_json::Value>,
) -> impl IntoResponse {
    let mut config_manager = state.config.lock().unwrap();
    
    match config_manager.update_config(serde_wasm_bindgen::to_value(&config).unwrap()) {
        Ok(_) => {
            (StatusCode::OK, Json(serde_json::json!({
                "success": true
            })))
        },
        Err(_) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": "Failed to update configuration"
            })))
        }
    }
}
