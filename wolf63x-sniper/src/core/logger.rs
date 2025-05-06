use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use crate::console_log;

/// Represents a trade log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradeLog {
    pub id: String,
    pub token_address: String,
    pub token_symbol: String,
    pub token_name: String,
    pub trade_type: TradeType,
    pub amount_in: f64,
    pub amount_out: f64,
    pub price: f64,
    pub timestamp: DateTime<Utc>,
    pub tx_signature: String,
    pub profit_loss: Option<f64>,
    pub profit_loss_percent: Option<f64>,
    pub time_held: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TradeType {
    Buy,
    Sell,
}

/// Logger for tracking trades and performance
#[wasm_bindgen]
pub struct Logger {
    trade_logs: Vec<TradeLog>,
    daily_stats: HashMap<String, DailyStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyStats {
    pub date: String,
    pub total_spent: f64,
    pub total_earned: f64,
    pub profit_loss: f64,
    pub trade_count: u32,
    pub win_count: u32,
    pub loss_count: u32,
}

#[wasm_bindgen]
impl Logger {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            trade_logs: Vec::new(),
            daily_stats: HashMap::new(),
        }
    }

    /// Log a new trade
    pub fn log_trade(&mut self, trade: JsValue) -> Result<(), JsValue> {
        let trade_log: TradeLog = serde_wasm_bindgen::from_value(trade)?;
        
        // Update daily stats
        let date = trade_log.timestamp.format("%Y-%m-%d").to_string();
        let mut stats = self.daily_stats.entry(date.clone()).or_insert_with(|| DailyStats {
            date: date.clone(),
            total_spent: 0.0,
            total_earned: 0.0,
            profit_loss: 0.0,
            trade_count: 0,
            win_count: 0,
            loss_count: 0,
        });
        
        stats.trade_count += 1;
        
        match trade_log.trade_type {
            TradeType::Buy => {
                stats.total_spent += trade_log.amount_in;
            },
            TradeType::Sell => {
                stats.total_earned += trade_log.amount_out;
                
                if let Some(profit) = trade_log.profit_loss {
                    stats.profit_loss += profit;
                    
                    if profit > 0.0 {
                        stats.win_count += 1;
                    } else {
                        stats.loss_count += 1;
                    }
                }
            },
        }
        
        // Add to logs
        self.trade_logs.push(trade_log);
        
        console_log!("Trade logged successfully");
        
        Ok(())
    }
    
    /// Get all trade logs
    pub fn get_trade_logs(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.trade_logs).map_err(|e| JsValue::from_str(&e.to_string()))
    }
    
    /// Get trade logs for a specific token
    pub fn get_token_logs(&self, token_address: &str) -> Result<JsValue, JsValue> {
        let logs: Vec<&TradeLog> = self.trade_logs.iter()
            .filter(|log| log.token_address == token_address)
            .collect();
        
        serde_wasm_bindgen::to_value(&logs).map_err(|e| JsValue::from_str(&e.to_string()))
    }
    
    /// Get daily stats
    pub fn get_daily_stats(&self) -> Result<JsValue, JsValue> {
        let stats: Vec<&DailyStats> = self.daily_stats.values().collect();
        serde_wasm_bindgen::to_value(&stats).map_err(|e| JsValue::from_str(&e.to_string()))
    }
    
    /// Get performance metrics
    pub fn get_performance_metrics(&self) -> Result<JsValue, JsValue> {
        let total_trades = self.trade_logs.len() as u32;
        let sell_trades: Vec<&TradeLog> = self.trade_logs.iter()
            .filter(|log| matches!(log.trade_type, TradeType::Sell))
            .collect();
        
        let win_trades = sell_trades.iter()
            .filter(|log| log.profit_loss.unwrap_or(0.0) > 0.0)
            .count() as u32;
        
        let win_rate = if sell_trades.is_empty() {
            0.0
        } else {
            (win_trades as f64 / sell_trades.len() as f64) * 100.0
        };
        
        let total_profit = sell_trades.iter()
            .map(|log| log.profit_loss.unwrap_or(0.0))
            .sum::<f64>();
        
        let avg_profit = if sell_trades.is_empty() {
            0.0
        } else {
            total_profit / sell_trades.len() as f64
        };
        
        let best_trade = sell_trades.iter()
            .filter_map(|log| log.profit_loss)
            .fold(0.0, f64::max);
        
        let worst_trade = sell_trades.iter()
            .filter_map(|log| log.profit_loss)
            .fold(0.0, f64::min);
        
        let metrics = PerformanceMetrics {
            total_trades,
            win_trades,
            loss_trades: sell_trades.len() as u32 - win_trades,
            win_rate,
            total_profit,
            avg_profit,
            best_trade,
            worst_trade,
        };
        
        serde_wasm_bindgen::to_value(&metrics).map_err(|e| JsValue::from_str(&e.to_string()))
    }
    
    /// Export trade history to CSV
    pub fn export_to_csv(&self) -> Result<String, JsValue> {
        let mut csv = String::from("Date,Token,Type,Amount In,Amount Out,Price,Profit/Loss,Profit/Loss %,Time Held,Tx Signature\n");
        
        for log in &self.trade_logs {
            let row = format!(
                "{},{},{},{},{},{},{},{},{},{}\n",
                log.timestamp.format("%Y-%m-%d %H:%M:%S"),
                log.token_symbol,
                match log.trade_type {
                    TradeType::Buy => "Buy",
                    TradeType::Sell => "Sell",
                },
                log.amount_in,
                log.amount_out,
                log.price,
                log.profit_loss.unwrap_or(0.0),
                log.profit_loss_percent.unwrap_or(0.0),
                log.time_held.clone().unwrap_or_default(),
                log.tx_signature,
            );
            
            csv.push_str(&row);
        }
        
        Ok(csv)
    }
    
    /// Clear all logs
    pub fn clear_logs(&mut self) -> Result<(), JsValue> {
        self.trade_logs.clear();
        self.daily_stats.clear();
        console_log!("All logs cleared");
        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct PerformanceMetrics {
    total_trades: u32,
    win_trades: u32,
    loss_trades: u32,
    win_rate: f64,
    total_profit: f64,
    avg_profit: f64,
    best_trade: f64,
    worst_trade: f64,
}
