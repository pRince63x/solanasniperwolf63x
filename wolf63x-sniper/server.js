/*jshint esversion: 11 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Mock API endpoints
const API_ENDPOINTS = {
  '/api/health': () => ({ status: 'Wolf63x Solana Sniper Bot is running' }),
  '/api/wallet/connect': (req, body) => {
    const walletType = body?.wallet_type || 'phantom';
    return {
      address: 'HK4...7Yk9',
      balance: 25.5
    };
  },
  '/api/wallet/disconnect': () => ({ success: true }),
  '/api/wallet/balance': () => ({ balance: 25.5 }),
  '/api/trades': () => [
    {
      symbol: 'ZOND',
      token: 'So11111111111111111111111111111111111111112',
      entry_price: 0.00180,
      current_price: 0.00234,
      profit_loss: 2210,
      profit_loss_percent: 30,
      amount: 1.8,
      holders: 892,
      lp_lock_date: 'Apr 2027',
      buy_tax: 1,
      sell_tax: 1,
      time_held: '3h 45m',
      score: 98,
      source: 'pump.fun'
    },
    {
      symbol: 'PEPE',
      token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      entry_price: 0.00150,
      current_price: 0.00220,
      profit_loss: 1500,
      profit_loss_percent: 46.67,
      amount: 1.5,
      holders: 678,
      lp_lock_date: 'Apr 2026',
      buy_tax: 2,
      sell_tax: 2,
      time_held: '2h 30m',
      score: 96,
      source: 'pump.fun'
    },
    {
      symbol: 'FXNF',
      token: 'So11111111111111111111111111111111111111112',
      entry_price: 0.00120,
      current_price: 0.00156,
      profit_loss: 1200,
      profit_loss_percent: 30,
      amount: 1.2,
      holders: 567,
      lp_lock_date: 'Apr 2026',
      buy_tax: 2,
      sell_tax: 2,
      time_held: '1h 30m',
      score: 95,
      source: 'pump.fun'
    },
    {
      symbol: 'KING',
      token: 'So11111111111111111111111111111111111111112',
      entry_price: 0.00045,
      current_price: 0.00040,
      profit_loss: -150,
      profit_loss_percent: -11.11,
      amount: 0.4,
      holders: 123,
      lp_lock_date: 'Apr 2026',
      buy_tax: 3,
      sell_tax: 3,
      time_held: '25m',
      score: 88,
      source: 'pump.fun'
    }
  ],
  '/api/scanner/opportunities': () => [
    {
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'PEPE',
      name: 'Pepe Solana',
      price: 0.00150,
      market_cap: 1500000.0,
      volume_24h: 250000.0,
      liquidity: 150.0,
      holders: 678,
      created_at: new Date().toISOString(),
      lp_locked: true,
      lp_lock_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      buy_tax: 2,
      sell_tax: 2,
      score: 96,
      source: 'pump.fun'
    },
    {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'BONK',
      name: 'Bonk',
      price: 0.00002,
      market_cap: 10000000.0,
      volume_24h: 1200000.0,
      liquidity: 500.0,
      holders: 50000,
      created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      lp_locked: true,
      lp_lock_end: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
      buy_tax: 0,
      sell_tax: 0,
      score: 99,
      source: 'pump.fun'
    },
    {
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'WEN',
      name: 'Wen Token',
      price: 0.00075,
      market_cap: 750000.0,
      volume_24h: 180000.0,
      liquidity: 120.0,
      holders: 345,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lp_locked: true,
      lp_lock_end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      buy_tax: 3,
      sell_tax: 3,
      score: 92,
      source: 'pump.fun'
    }
  ],
  '/api/snipe': (req, body) => ({ signature: '5KtPn1LGuxhFLF2W1KqxjEDYUdpT5LUEo7DGYLUYgXHEbDp6hqiYMf3hZ1SnZBrSqNpYdnCvUxUpWTJmJP3nKXKE' }),
  '/api/sell': (req, body) => ({ signature: '4VdA5hYvVxQALSEtKcANnqPWXtFqJdmTSWLzPsttfYjN9QY8vJYXHnLcnBMJYMgTQF7iNEZLwAcuRaptW2YwKFdK' }),
  '/api/scanner/start': () => ({ success: true }),
  '/api/scanner/stop': () => ({ success: true }),
  '/api/config': (req, body) => ({
    wallet_type: 'phantom',
    rpc_url: 'https://api.mainnet-beta.solana.com',
    theme: 'Green',
    trade_settings: {
      default_buy_amount: 0.5,
      default_slippage: 0.6,
      default_take_profit: 50.0,
      default_stop_loss: 30.0,
      max_trades_per_day: 100,
      min_time_between_trades_seconds: 60
    },
    filter_settings: {
      min_liquidity: 25.0,
      min_holders: 50,
      max_buy_tax: 10,
      max_sell_tax: 10,
      require_lp_lock: true,
      min_lp_lock_days: 30,
      min_token_age_minutes: 3,
      blacklisted_creators: [],
      min_score: 75
    },
    notification_settings: {
      enable_sound: true,
      enable_desktop: true,
      enable_email: false,
      email_address: null,
      notify_on_trade: true,
      notify_on_profit: true,
      notify_on_loss: true
    },
    auto_snipe: false,
    auto_sell: false
  })
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle API requests
  if (req.url.startsWith('/api/')) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    
    // Check if API endpoint exists
    const endpoint = Object.keys(API_ENDPOINTS).find(ep => req.url.startsWith(ep));
    
    if (endpoint) {
      res.setHeader('Content-Type', 'application/json');
      
      // Handle POST requests with body
      if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            const response = API_ENDPOINTS[endpoint](req, jsonBody);
            res.statusCode = 200;
            res.end(JSON.stringify(response));
          } catch (error) {
            console.error('Error processing request:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      } else {
        // Handle GET requests
        const response = API_ENDPOINTS[endpoint](req);
        res.statusCode = 200;
        res.end(JSON.stringify(response));
      }
      
      return;
    }
    
    // API endpoint not found
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }
  
  // Serve static files
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, try serving index.html (for SPA routing)
      if (req.url !== '/') {
        filePath = path.join(PUBLIC_DIR, 'index.html');
      } else {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }
    }
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    // Read and serve file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.statusCode = 500;
        res.end('Server error');
        return;
      }
      
      res.setHeader('Content-Type', contentType);
      res.end(content);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${PUBLIC_DIR}`);
});
