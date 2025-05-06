use wasm_bindgen::prelude::*;
use crate::{
    wallet::Wallet,
    trader::Trader,
    scanner::Scanner,
    filters::TokenFilter,
    logger::Logger,
    config::ConfigManager,
};

// Global state for WASM bindings
#[wasm_bindgen]
pub struct WasmBindings {
    wallet: Wallet,
    trader: Trader,
    scanner: Scanner,
    filter: TokenFilter,
    logger: Logger,
    config: ConfigManager,
}

#[wasm_bindgen]
impl WasmBindings {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_log!("Initializing Wolf63x Solana Sniper Bot WASM bindings...");
        
        let wallet = Wallet::new();
        let trader = Trader::new(Wallet::new(), "https://api.mainnet-beta.solana.com".to_string());
        let scanner = Scanner::new();
        let filter = TokenFilter::new();
        let logger = Logger::new();
        let config = ConfigManager::new();
        
        Self {
            wallet,
            trader,
            scanner,
            filter,
            logger,
            config,
        }
    }
    
    // Wallet methods
    #[wasm_bindgen]
    pub async fn connect_wallet(&mut self, wallet_type: &str) -> Result<JsValue, JsValue> {
        let address = self.wallet.connect(wallet_type).await?;
        let balance = self.wallet.get_balance().await?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "address": address,
            "balance": balance,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn disconnect_wallet(&mut self) -> Result<JsValue, JsValue> {
        self.wallet.disconnect()?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub async fn get_balance(&self) -> Result<f64, JsValue> {
        self.wallet.get_balance().await
    }
    
    // Trader methods
    #[wasm_bindgen]
    pub async fn snipe_token(&self, token_address: &str, amount: f64, slippage: f64) -> Result<JsValue, JsValue> {
        let signature = self.trader.snipe_token(token_address, amount, slippage).await?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "signature": signature,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub async fn sell_token(&self, token_address: &str, amount: f64, slippage: f64) -> Result<JsValue, JsValue> {
        let signature = self.trader.sell_token(token_address, amount, slippage).await?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "signature": signature,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn set_take_profit(&self, token_address: &str, percentage: f64) -> Result<JsValue, JsValue> {
        self.trader.set_take_profit(token_address, percentage)?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn set_stop_loss(&self, token_address: &str, percentage: f64) -> Result<JsValue, JsValue> {
        self.trader.set_stop_loss(token_address, percentage)?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    // Scanner methods
    #[wasm_bindgen]
    pub fn start_scanner(&mut self) -> Result<JsValue, JsValue> {
        self.scanner.start()?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn stop_scanner(&mut self) -> Result<JsValue, JsValue> {
        self.scanner.stop()?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn get_opportunities(&self) -> Result<JsValue, JsValue> {
        self.scanner.get_opportunities()
    }
    
    // Filter methods
    #[wasm_bindgen]
    pub fn update_filter_settings(&mut self, settings: JsValue) -> Result<JsValue, JsValue> {
        self.filter.update_settings(settings)?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn get_filter_settings(&self) -> Result<JsValue, JsValue> {
        self.filter.get_settings()
    }
    
    #[wasm_bindgen]
    pub fn validate_token(&self, token: JsValue) -> Result<bool, JsValue> {
        self.filter.validate(token)
    }
    
    // Logger methods
    #[wasm_bindgen]
    pub fn log_trade(&mut self, trade: JsValue) -> Result<JsValue, JsValue> {
        self.logger.log_trade(trade)?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn get_trade_logs(&self) -> Result<JsValue, JsValue> {
        self.logger.get_trade_logs()
    }
    
    #[wasm_bindgen]
    pub fn get_performance_metrics(&self) -> Result<JsValue, JsValue> {
        self.logger.get_performance_metrics()
    }
    
    // Config methods
    #[wasm_bindgen]
    pub fn get_config(&self) -> Result<JsValue, JsValue> {
        self.config.get_config()
    }
    
    #[wasm_bindgen]
    pub fn update_config(&mut self, config: JsValue) -> Result<JsValue, JsValue> {
        self.config.update_config(config)?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn save_config_to_storage(&self) -> Result<JsValue, JsValue> {
        self.config.save_to_storage()?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
    
    #[wasm_bindgen]
    pub fn load_config_from_storage(&mut self) -> Result<JsValue, JsValue> {
        self.config.load_from_storage()?;
        
        let response = serde_wasm_bindgen::to_value(&serde_json::json!({
            "success": true,
        }))?;
        
        Ok(response)
    }
}
