use wasm_bindgen::prelude::*;
use once_cell::sync::Lazy;
use std::sync::Mutex;

// Import core modules
mod core;
pub use core::*;

// Import WASM bindings
mod wasm_bindings;
pub use wasm_bindings::WasmBindings;

// Set up panic hook for better error reporting in WASM
#[wasm_bindgen(start)]
pub fn start() {
    // Initialize console error panic hook for better error messages
    console_error_panic_hook::set_once();
    console_log!("Wolf63x Solana Sniper Bot initialized");
}

// Global state for the bot
static BOT_STATE: Lazy<Mutex<BotState>> = Lazy::new(|| Mutex::new(BotState::default()));

#[derive(Default)]
pub struct BotState {
    pub connected: bool,
    pub wallet_address: Option<String>,
    pub balance: f64,
    pub active_trades: Vec<Trade>,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Trade {
    pub token: String,
    pub symbol: String,
    pub entry_price: f64,
    pub current_price: f64,
    pub amount: f64,
    pub timestamp: i64,
    pub profit_loss: f64,
    pub profit_loss_percent: f64,
    pub holders: u32,
    pub lp_lock_date: String,
    pub buy_tax: u8,
    pub sell_tax: u8,
    pub time_held: String,
    pub score: u8,
    pub source: String,
}

// Expose core functions to JavaScript
#[wasm_bindgen]
pub fn initialize() -> Result<(), JsValue> {
    console_log!("Initializing Wolf63x Sniper Bot...");
    Ok(())
}

#[wasm_bindgen]
pub fn create_bot() -> Result<WasmBindings, JsValue> {
    console_log!("Creating Wolf63x Sniper Bot instance...");
    Ok(WasmBindings::new())
}

#[wasm_bindgen]
pub fn connect_wallet(wallet_type: &str) -> Result<String, JsValue> {
    let mut state = BOT_STATE.lock().unwrap();
    
    // In a real implementation, this would connect to the actual wallet
    state.connected = true;
    state.wallet_address = Some("HK4...7Yk9".to_string());
    state.balance = 25.5;
    
    Ok(state.wallet_address.clone().unwrap_or_default())
}

#[wasm_bindgen]
pub fn get_balance() -> f64 {
    let state = BOT_STATE.lock().unwrap();
    state.balance
}

#[wasm_bindgen]
pub fn snipe_token(token_address: &str, amount: f64, slippage: f64) -> Result<String, JsValue> {
    console_log!("Sniping token: {}", token_address);
    
    // In a real implementation, this would execute the actual trade
    // For now, we'll just simulate a successful trade
    
    Ok("Transaction successful".to_string())
}

#[wasm_bindgen]
pub fn get_active_trades() -> JsValue {
    let state = BOT_STATE.lock().unwrap();
    serde_wasm_bindgen::to_value(&state.active_trades).unwrap()
}

// Helper macro for logging to the browser console
#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => {
        web_sys::console::log_1(&format!($($t)*).into());
    }
}
