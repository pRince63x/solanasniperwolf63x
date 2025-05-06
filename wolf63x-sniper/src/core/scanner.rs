use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use crate::console_log;
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Represents a token opportunity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenOpportunity {
    pub address: String,
    pub symbol: String,
    pub name: String,
    pub price: f64,
    pub market_cap: f64,
    pub volume_24h: f64,
    pub liquidity: f64,
    pub holders: u32,
    pub created_at: DateTime<Utc>,
    pub lp_locked: bool,
    pub lp_lock_end: Option<DateTime<Utc>>,
    pub buy_tax: u8,
    pub sell_tax: u8,
    pub score: u8,
    pub source: String,
}

/// Scanner for finding token opportunities
#[wasm_bindgen]
use std::sync::{Arc, Mutex};

pub struct Scanner {
    sources: Vec<String>,
    min_liquidity: f64,
    min_holders: u32,
    max_buy_tax: u8,
    max_sell_tax: u8,
    require_lp_lock: bool,
    min_score: u8,
    active: bool,
    scan_interval_ms: u32,
    pub opportunities: Arc<Mutex<Vec<TokenOpportunity>>>,
}

#[wasm_bindgen]
impl Scanner {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            sources: vec!["pump.fun".to_string()],
            min_liquidity: 25.0,
            min_holders: 50,
            max_buy_tax: 10,
            max_sell_tax: 10,
            require_lp_lock: true,
            min_score: 75,
            active: false,
            scan_interval_ms: 5000,
            opportunities: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Start scanning for opportunities
    pub fn start(&mut self) -> Result<(), JsValue> {
        if self.active {
            return Ok(());
        }
        
        console_log!("Starting token scanner...");
        self.active = true;
        
        // In a real implementation, this would start a background task
        // that periodically scans for new tokens
        
        Ok(())
    }
    
    /// Stop scanning
    pub fn stop(&mut self) -> Result<(), JsValue> {
        if !self.active {
            return Ok(());
        }
        
        console_log!("Stopping token scanner...");
        self.active = false;
        
        Ok(())
    }
    
    /// Set scanner configuration
    pub fn configure(&mut self, config: JsValue) -> Result<(), JsValue> {
        let config: ScannerConfig = serde_wasm_bindgen::from_value(config)?;
        
        if let Some(sources) = config.sources {
            self.sources = sources;
        }
        
        if let Some(min_liquidity) = config.min_liquidity {
            self.min_liquidity = min_liquidity;
        }
        
        if let Some(min_holders) = config.min_holders {
            self.min_holders = min_holders;
        }
        
        if let Some(max_buy_tax) = config.max_buy_tax {
            self.max_buy_tax = max_buy_tax;
        }
        
        if let Some(max_sell_tax) = config.max_sell_tax {
            self.max_sell_tax = max_sell_tax;
        }
        
        if let Some(require_lp_lock) = config.require_lp_lock {
            self.require_lp_lock = require_lp_lock;
        }
        
        if let Some(min_score) = config.min_score {
            self.min_score = min_score;
        }
        
        if let Some(scan_interval_ms) = config.scan_interval_ms {
            self.scan_interval_ms = scan_interval_ms;
        }
        
        console_log!("Scanner configuration updated");
        
        Ok(())
    }
    
    /// Get current opportunities
    pub fn get_opportunities(&self) -> Result<JsValue, JsValue> {
        let opps = self.opportunities.lock().unwrap();
        if !opps.is_empty() {
            return serde_wasm_bindgen::to_value(&*opps).map_err(|e| JsValue::from_str(&e.to_string()));
        }
        // Fallback: fetch from Pump.fun HTTP API if websocket is empty
        match std::process::Command::new("curl")
            .arg("-s")
            .arg("https://pump.fun/api/tokens")
            .output() {
            Ok(output) => {
                if output.status.success() {
                    let data = String::from_utf8_lossy(&output.stdout);
                    if let Ok(json_val) = serde_json::from_str::<serde_json::Value>(&data) {
                        return Ok(JsValue::from_serde(&json_val).unwrap_or(JsValue::NULL));
                    }
                }
            }
            Err(_) => {}
        }
        Ok(JsValue::NULL)
    }
}

#[derive(Debug, Deserialize)]
struct ScannerConfig {
    sources: Option<Vec<String>>,
    min_liquidity: Option<f64>,
    min_holders: Option<u32>,
    max_buy_tax: Option<u8>,
    max_sell_tax: Option<u8>,
    require_lp_lock: Option<bool>,
    min_score: Option<u8>,
    scan_interval_ms: Option<u32>,
}

mod pump_ws;

// Native Rust implementation (not exposed to WASM)
impl Scanner {
    /// Fetch new tokens from pump.fun
    async fn fetch_from_pump_fun(&self) -> anyhow::Result<Vec<TokenOpportunity>> {
        // For now, use websocket for real-time updates
        // This method could trigger the websocket listener if not already running
        Ok(vec![])
    }

    /// Start websocket listener for Pump.fun new pairs
    pub async fn start_pump_fun_ws(&mut self) {
        let opps_arc = self.opportunities.clone();
        tokio::spawn(async move {
            pump_ws::listen_new_pump_fun_pairs(move |evt| {
                let mut opps = opps_arc.lock().unwrap();
                // Convert NewTokenEvent to TokenOpportunity (minimal fields for pairs menu)
                if !opps.iter().any(|t| t.address == evt.mint) {
                    let token = TokenOpportunity {
                        address: evt.mint.clone(),
                        symbol: evt.symbol.clone(),
                        name: evt.name.clone(),
                        price: evt.priceUsd.parse().unwrap_or(0.0),
                        market_cap: 0.0,
                        volume_24h: 0.0,
                        liquidity: evt.liquidity.parse().unwrap_or(0.0),
                        holders: 0,
                        created_at: chrono::Utc::now(),
                        lp_locked: false,
                        lp_lock_end: None,
                        buy_tax: 0,
                        sell_tax: 0,
                        score: 0,
                        source: "pump.fun".to_string(),
                    };
                    opps.insert(0, token);
                    if opps.len() > 1000 { opps.truncate(1000); }
                }
            }).await;
        });
    }
    
    /// Apply filters to token opportunities
    fn apply_filters(&self, opportunities: Vec<TokenOpportunity>) -> Vec<TokenOpportunity> {
        opportunities.into_iter().filter(|op| {
            op.liquidity >= self.min_liquidity &&
            op.holders >= self.min_holders &&
            op.buy_tax <= self.max_buy_tax &&
            op.sell_tax <= self.max_sell_tax &&
            (!self.require_lp_lock || op.lp_locked) &&
            op.score >= self.min_score
        }).collect()
    }
}
