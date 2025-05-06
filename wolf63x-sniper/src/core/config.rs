use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use crate::console_log;

/// Bot configuration settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotConfig {
    pub wallet_type: String,
    pub rpc_url: String,
    pub theme: Theme,
    pub trade_settings: TradeSettings,
    pub filter_settings: FilterSettings,
    pub notification_settings: NotificationSettings,
    pub auto_snipe: bool,
    pub auto_sell: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Theme {
    Violet,
    Green,
    Dark,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradeSettings {
    pub default_buy_amount: f64,
    pub default_slippage: f64,
    pub default_take_profit: f64,
    pub default_stop_loss: f64,
    pub max_trades_per_day: u32,
    pub min_time_between_trades_seconds: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterSettings {
    pub min_liquidity: f64,
    pub min_holders: u32,
    pub max_buy_tax: u8,
    pub max_sell_tax: u8,
    pub require_lp_lock: bool,
    pub min_lp_lock_days: u32,
    pub min_token_age_minutes: u32,
    pub blacklisted_creators: Vec<String>,
    pub min_score: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
    pub enable_sound: bool,
    pub enable_desktop: bool,
    pub enable_email: bool,
    pub email_address: Option<String>,
    pub notify_on_trade: bool,
    pub notify_on_profit: bool,
    pub notify_on_loss: bool,
}

impl Default for BotConfig {
    fn default() -> Self {
        Self {
            wallet_type: "phantom".to_string(),
            rpc_url: "https://api.mainnet-beta.solana.com".to_string(),
            theme: Theme::Green,
            trade_settings: TradeSettings {
                default_buy_amount: 0.5,
                default_slippage: 0.6,
                default_take_profit: 50.0,
                default_stop_loss: 30.0,
                max_trades_per_day: 100,
                min_time_between_trades_seconds: 60,
            },
            filter_settings: FilterSettings {
                min_liquidity: 25.0,
                min_holders: 50,
                max_buy_tax: 10,
                max_sell_tax: 10,
                require_lp_lock: true,
                min_lp_lock_days: 30,
                min_token_age_minutes: 3,
                blacklisted_creators: vec![],
                min_score: 75,
            },
            notification_settings: NotificationSettings {
                enable_sound: true,
                enable_desktop: true,
                enable_email: false,
                email_address: None,
                notify_on_trade: true,
                notify_on_profit: true,
                notify_on_loss: true,
            },
            auto_snipe: false,
            auto_sell: false,
        }
    }
}

/// Configuration manager for the bot
#[wasm_bindgen]
pub struct ConfigManager {
    config: BotConfig,
    custom_settings: HashMap<String, JsValue>,
}

#[wasm_bindgen]
impl ConfigManager {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            config: BotConfig::default(),
            custom_settings: HashMap::new(),
        }
    }

    /// Get the current configuration
    pub fn get_config(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.config).map_err(|e| JsValue::from_str(&e.to_string()))
    }
    
    /// Update the configuration
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: BotConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        console_log!("Configuration updated");
        Ok(())
    }
    
    /// Update trade settings
    pub fn update_trade_settings(&mut self, settings: JsValue) -> Result<(), JsValue> {
        let new_settings: TradeSettings = serde_wasm_bindgen::from_value(settings)?;
        self.config.trade_settings = new_settings;
        console_log!("Trade settings updated");
        Ok(())
    }
    
    /// Update filter settings
    pub fn update_filter_settings(&mut self, settings: JsValue) -> Result<(), JsValue> {
        let new_settings: FilterSettings = serde_wasm_bindgen::from_value(settings)?;
        self.config.filter_settings = new_settings;
        console_log!("Filter settings updated");
        Ok(())
    }
    
    /// Update notification settings
    pub fn update_notification_settings(&mut self, settings: JsValue) -> Result<(), JsValue> {
        let new_settings: NotificationSettings = serde_wasm_bindgen::from_value(settings)?;
        self.config.notification_settings = new_settings;
        console_log!("Notification settings updated");
        Ok(())
    }
    
    /// Set a custom setting
    pub fn set_custom_setting(&mut self, key: &str, value: JsValue) -> Result<(), JsValue> {
        self.custom_settings.insert(key.to_string(), value);
        console_log!("Custom setting '{}' updated", key);
        Ok(())
    }
    
    /// Get a custom setting
    pub fn get_custom_setting(&self, key: &str) -> JsValue {
        self.custom_settings.get(key).cloned().unwrap_or(JsValue::NULL)
    }
    
    /// Save configuration to local storage
    pub fn save_to_storage(&self) -> Result<(), JsValue> {
        #[cfg(target_arch = "wasm32")]
        {
            let window = web_sys::window().expect("no global window exists");
            let storage = window.local_storage().map_err(|_| JsValue::from_str("Failed to get local storage"))?
                .expect("local storage not available");
            
            let config_json = serde_json::to_string(&self.config)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;
            
            storage.set_item("wolf63x_config", &config_json)
                .map_err(|_| JsValue::from_str("Failed to save to local storage"))?;
            
            console_log!("Configuration saved to local storage");
        }
        
        Ok(())
    }
    
    /// Load configuration from local storage
    pub fn load_from_storage(&mut self) -> Result<(), JsValue> {
        #[cfg(target_arch = "wasm32")]
        {
            let window = web_sys::window().expect("no global window exists");
            let storage = window.local_storage().map_err(|_| JsValue::from_str("Failed to get local storage"))?
                .expect("local storage not available");
            
            if let Ok(Some(config_json)) = storage.get_item("wolf63x_config") {
                let config: BotConfig = serde_json::from_str(&config_json)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?;
                
                self.config = config;
                console_log!("Configuration loaded from local storage");
            }
        }
        
        Ok(())
    }
}
