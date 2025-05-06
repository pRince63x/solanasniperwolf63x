use futures_util::{SinkExt, StreamExt};
use serde_json::Value;
use tokio_tungstenite::connect_async;
use url::Url;

use crate::scanner::TokenOpportunity;

use futures::{StreamExt, SinkExt};
use serde::Deserialize;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

#[derive(Debug, Deserialize, Clone)]
pub struct NewTokenEvent {
    pub mint: String,
    pub name: String,
    pub symbol: String,
    pub priceNative: String,
    pub priceUsd: String,
    pub liquidity: String,
    pub createdAt: String,
}

pub async fn listen_new_pump_fun_pairs<F>(mut on_token: F)
where
    F: FnMut(NewTokenEvent) + Send + 'static,
{
    let url = "wss://pumpportal.fun/api/data";
    let (ws_stream, _) = match connect_async(url).await {
        Ok(res) => res,
        Err(e) => {
            eprintln!("Failed to connect to Pump.fun WS: {}", e);
            return;
        }
    };
    println!("WebSocket connected to {}", url);
    let (mut write, mut read) = ws_stream.split();
    // Subscribe to new-token events
    let subscribe = serde_json::json!({"method": "subscribeNewToken"});
    if let Err(e) = write.send(Message::Text(subscribe.to_string())).await {
        eprintln!("Failed to subscribe: {}", e);
        return;
    }
    // Read incoming messages
    while let Some(msg) = read.next().await {
        let msg = match msg {
            Ok(m) => m,
            Err(e) => {
                eprintln!("WebSocket error: {}", e);
                break;
            }
        };
        if let Message::Text(txt) = msg {
            if let Ok(evt) = serde_json::from_str::<NewTokenEvent>(&txt) {
                on_token(evt.clone());
                println!(
                    "[{}] New pair: {} ({}) — price: {} USD, liquidity: {}",
                    evt.createdAt, evt.name, evt.symbol, evt.priceUsd, evt.liquidity
                );
            }
        }
    }
}
