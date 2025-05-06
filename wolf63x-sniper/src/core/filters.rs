use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use crate::console_log;
use crate::scanner::TokenOpportunity;

/// Filter settings for token validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterSettings {
    pub min_liquidity: f64,
    pub min_holders: u32,
    pub max_buy_tax: u8,
    pub max_sell_tax: u8,
    pub require_lp_lock: bool,
    pub min_lp_lock_days: u32,
    pub min_token_age_minutes: u32,
    pub max_similar_tokens: u8,
    pub blacklisted_creators: Vec<String>,
    pub min_score: u8,
}

impl Default for FilterSettings {
    fn default() -> Self {
        Self {
            min_liquidity: 25.0,
            min_holders: 50,
            max_buy_tax: 10,
            max_sell_tax: 10,
            require_lp_lock: true,
            min_lp_lock_days: 30,
            min_token_age_minutes: 3,
            max_similar_tokens: 3,
            blacklisted_creators: vec![],
            min_score: 75,
        }
    }
}

/// Token filter for validating opportunities
#[wasm_bindgen]
pub struct TokenFilter {
    settings: FilterSettings,
}

#[wasm_bindgen]
impl TokenFilter {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            settings: FilterSettings::default(),
        }
    }

    /// Update filter settings
    pub fn update_settings(&mut self, settings: JsValue) -> Result<(), JsValue> {
        let new_settings: FilterSettings = serde_wasm_bindgen::from_value(settings)?;
        self.settings = new_settings;
        console_log!("Filter settings updated");
        Ok(())
    }
    
    /// Get current filter settings
    pub fn get_settings(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.settings).map_err(|e| JsValue::from_str(&e.to_string()))
    }
    
    /// Validate a token opportunity
    pub fn validate(&self, opportunity: JsValue) -> Result<bool, JsValue> {
        let token: TokenOpportunity = serde_wasm_bindgen::from_value(opportunity)?;
        
        // Apply all filters
        let valid = self.check_liquidity(&token) &&
                   self.check_holders(&token) &&
                   self.check_taxes(&token) &&
                   self.check_lp_lock(&token) &&
                   self.check_token_age(&token) &&
                   self.check_blacklist(&token) &&
                   self.check_score(&token);
        
        Ok(valid)
    }
    
    /// Calculate a safety score for a token (0-100)
    pub fn calculate_score(&self, opportunity: JsValue) -> Result<u8, JsValue> {
        let token: TokenOpportunity = serde_wasm_bindgen::from_value(opportunity)?;
        
        // Start with a perfect score and deduct points for risk factors
        let mut score = 100;
        
        // Liquidity check (0-20 points)
        if token.liquidity < self.settings.min_liquidity {
            score -= 20;
        } else if token.liquidity < self.settings.min_liquidity * 2.0 {
            score -= 10;
        }
        
        // Holders check (0-15 points)
        if token.holders < self.settings.min_holders {
            score -= 15;
        } else if token.holders < self.settings.min_holders * 2 {
            score -= 7;
        }
        
        // Tax check (0-25 points)
        let tax_deduction = ((token.buy_tax + token.sell_tax) as f64 / 2.0) * 2.5;
        score -= tax_deduction.min(25.0) as u8;
        
        // LP lock check (0-30 points)
        if !token.lp_locked {
            score -= 30;
        } else if let Some(lock_end) = token.lp_lock_end {
            let now = chrono::Utc::now();
            let days_locked = (lock_end - now).num_days();
            
            if days_locked < 30 {
                score -= 25;
            } else if days_locked < 90 {
                score -= 15;
            } else if days_locked < 180 {
                score -= 5;
            }
        }
        
        // Token age check (0-10 points)
        let token_age_minutes = (chrono::Utc::now() - token.created_at).num_minutes();
        if token_age_minutes < self.settings.min_token_age_minutes as i64 {
            score -= 10;
        }
        
        // Ensure score is between 0 and 100
        score = score.max(0).min(100);
        
        Ok(score)
    }
}

// Private methods
impl TokenFilter {
    fn check_liquidity(&self, token: &TokenOpportunity) -> bool {
        token.liquidity >= self.settings.min_liquidity
    }
    
    fn check_holders(&self, token: &TokenOpportunity) -> bool {
        token.holders >= self.settings.min_holders
    }
    
    fn check_taxes(&self, token: &TokenOpportunity) -> bool {
        token.buy_tax <= self.settings.max_buy_tax && 
        token.sell_tax <= self.settings.max_sell_tax
    }
    
    fn check_lp_lock(&self, token: &TokenOpportunity) -> bool {
        if !self.settings.require_lp_lock {
            return true;
        }
        
        if !token.lp_locked {
            return false;
        }
        
        if let Some(lock_end) = token.lp_lock_end {
            let now = chrono::Utc::now();
            let days_locked = (lock_end - now).num_days();
            return days_locked >= self.settings.min_lp_lock_days as i64;
        }
        
        false
    }
    
    fn check_token_age(&self, token: &TokenOpportunity) -> bool {
        let token_age_minutes = (chrono::Utc::now() - token.created_at).num_minutes();
        token_age_minutes >= self.settings.min_token_age_minutes as i64
    }
    
    fn check_blacklist(&self, token: &TokenOpportunity) -> bool {
        !self.settings.blacklisted_creators.contains(&token.address)
    }
    
    fn check_score(&self, token: &TokenOpportunity) -> bool {
        token.score >= self.settings.min_score
    }
}
