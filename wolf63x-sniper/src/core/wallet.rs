use wasm_bindgen::prelude::*;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signature},
    transaction::Transaction,
};
use anyhow::{Result, anyhow};
use std::str::FromStr;
use crate::console_log;

/// Represents a wallet connection for the Solana blockchain
#[derive(Debug)]
pub struct Wallet {
    pub address: String,
    pub balance: f64,
    keypair: Option<Keypair>,
    pub connected: bool,
}

impl Default for Wallet {
    fn default() -> Self {
        Self {
            address: String::new(),
            balance: 0.0,
            keypair: None,
            connected: false,
        }
    }
}

#[wasm_bindgen]
impl Wallet {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    /// Connect to a wallet (Phantom, Solflare, etc.)
    pub async fn connect(&mut self, wallet_type: &str) -> Result<String, JsValue> {
        console_log!("Connecting to {} wallet...", wallet_type);
        
        // In a real implementation, this would use the Solana wallet adapter
        // to connect to the actual wallet through the browser
        #[cfg(target_arch = "wasm32")]
        {
            // Simulate wallet connection for demo
            self.address = "HK4...7Yk9".to_string();
            self.balance = 25.5;
            self.connected = true;
        }
        
        #[cfg(not(target_arch = "wasm32"))]
        {
            // For native app, we would use Tauri to bridge to the wallet
            // This is a simplified implementation
            self.address = "HK4...7Yk9".to_string();
            self.balance = 25.5;
            self.connected = true;
        }
        
        Ok(self.address.clone())
    }
    
    /// Disconnect from the wallet
    pub fn disconnect(&mut self) -> Result<(), JsValue> {
        self.connected = false;
        self.address = String::new();
        self.balance = 0.0;
        self.keypair = None;
        
        Ok(())
    }
    
    /// Get the current SOL balance
    pub async fn get_balance(&self) -> Result<f64, JsValue> {
        if !self.connected {
            return Err(JsValue::from_str("Wallet not connected"));
        }
        
        // In a real implementation, this would query the Solana blockchain
        Ok(self.balance)
    }
    
    /// Sign a transaction
    pub fn sign_transaction(&self, transaction: &mut Transaction) -> Result<Signature, JsValue> {
        if !self.connected {
            return Err(JsValue::from_str("Wallet not connected"));
        }
        
        // In a real implementation, this would use the wallet to sign
        // For now, we'll just return a dummy signature
        Ok(Signature::default())
    }
    
    /// Convert the wallet address to a Pubkey
    pub fn pubkey(&self) -> Result<Pubkey, JsValue> {
        if !self.connected {
            return Err(JsValue::from_str("Wallet not connected"));
        }
        
        match Pubkey::from_str(&self.address) {
            Ok(pubkey) => Ok(pubkey),
            Err(_) => Err(JsValue::from_str("Invalid wallet address")),
        }
    }
}

// Native Rust implementation (not exposed to WASM)
impl Wallet {
    /// Create a new wallet from a keypair
    pub fn from_keypair(keypair: Keypair) -> Self {
        let address = keypair.pubkey().to_string();
        
        Self {
            address,
            balance: 0.0,
            keypair: Some(keypair),
            connected: true,
        }
    }
    
    /// Get the wallet's keypair
    pub fn get_keypair(&self) -> Result<&Keypair> {
        self.keypair.as_ref().ok_or_else(|| anyhow!("No keypair available"))
    }
}
