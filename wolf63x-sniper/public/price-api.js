/**
 * Price API Integration for Wolf63x Sniper Bot
 * Fetches real-time cryptocurrency prices from CoinGecko API
 */

/* jshint esversion: 8 */

// API endpoints
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const SOLANA_SYMBOL = 'SOLUSDT';

// Fallback API (if Binance fails)
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const SOLANA_ID = 'solana';

// Cache for price data to avoid excessive API calls
let priceCache = {
  solana: {
    usd: 0,
    usd_24h_change: 0,
    last_updated: null,
    previousPrice: 0
  }
};

// Update frequency in milliseconds (100ms for smoother updates)
const UPDATE_INTERVAL = 100;

// Store price history for mini chart
let priceHistory = [];
const MAX_HISTORY_POINTS = 20;

/**
 * Initialize price tracking
 */
function initPriceTracking() {
  // Initial fetch
  fetchSolanaPrice();
  
  // Set up interval for regular updates
  setInterval(simulatePriceMovement, UPDATE_INTERVAL);
  
  // Real API fetch every 3 seconds for fast updates (Binance has higher rate limits)
  setInterval(fetchSolanaPrice, 3000);
  
  // Update time display
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);
  
  // Initialize mini chart
  initMiniChart();
}

/**
 * Fetch current Solana price from Binance API (fastest)
 */
async function fetchSolanaPrice() {
  try {
    // Try Binance API first (fastest)
    const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr?symbol=${SOLANA_SYMBOL}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.lastPrice) {
        // Calculate 24h change percentage
        const currentPrice = parseFloat(data.lastPrice);
        const openPrice = parseFloat(data.openPrice);
        const changePercent = ((currentPrice - openPrice) / openPrice) * 100;
        
        // Update cache
        priceCache.solana = {
          usd: currentPrice,
          usd_24h_change: changePercent,
          last_updated: new Date(),
          previousPrice: priceCache.solana.previousPrice || currentPrice
        };
        
        // Update UI
        updatePriceDisplay();
        return;
      }
    }
    
    // Fallback to CoinGecko if Binance fails
    const fallbackResponse = await fetch(`${COINGECKO_API_BASE}/simple/price?ids=${SOLANA_ID}&vs_currencies=usd&include_24hr_change=true`);
    
    if (!fallbackResponse.ok) {
      throw new Error(`API Error: ${fallbackResponse.status}`);
    }
    
    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData && fallbackData[SOLANA_ID]) {
      // Update cache
      priceCache.solana = {
        usd: fallbackData[SOLANA_ID].usd,
        usd_24h_change: fallbackData[SOLANA_ID].usd_24h_change,
        last_updated: new Date(),
        previousPrice: priceCache.solana.previousPrice || fallbackData[SOLANA_ID].usd
      };
      
      // Update UI
      updatePriceDisplay();
    }
  } catch (error) {
    console.error('Error fetching Solana price:', error);
    
    // If we have cached data, still use it
    if (priceCache.solana.last_updated) {
      updatePriceDisplay();
    }
  }
}

/**
 * Update all price displays in the UI
 */
function updatePriceDisplay() {
  const price = priceCache.solana.usd;
  const change = priceCache.solana.usd_24h_change;
  
  // Check if price is increasing or decreasing
  const previousPrice = priceCache.solana.previousPrice || price;
  const priceIncreasing = price > previousPrice;
  priceCache.solana.previousPrice = price;
  
  // Format price with 2 decimal places and ensure consistent width
  const formattedPrice = price.toFixed(2).padStart(6, ' ');
  
  // Format change with 2 decimal places, +/- sign, and ensure consistent width
  const formattedChange = ((change >= 0 ? '+' : '') + change.toFixed(2) + '%').padStart(8, ' ');
  
  // Calculate dollar amount change based on percentage
  const dollarChange = (price * change / 100).toFixed(2);
  const formattedDollarChange = (change >= 0 ? '+$' : '-$') + Math.abs(dollarChange).toFixed(2);
  
  // Update all price elements
  document.querySelectorAll('#sol-price').forEach(el => {
    el.textContent = formattedPrice;
  });
  
  // Update change elements
  document.querySelectorAll('#sol-change').forEach(el => {
    el.textContent = formattedChange;
    
    // Add appropriate class based on positive/negative change
    if (change >= 0) {
      el.classList.add('positive');
      el.classList.remove('negative');
    } else {
      el.classList.add('negative');
      el.classList.remove('positive');
    }
  });
  
  // Update dollar amount change
  document.querySelectorAll('#sol-amount-change').forEach(el => {
    el.textContent = formattedDollarChange;
    
    // Add appropriate class based on positive/negative change
    if (change >= 0) {
      el.classList.add('positive');
      el.classList.remove('negative');
    } else {
      el.classList.add('negative');
      el.classList.remove('positive');
    }
  });
  
  // Update price history for chart
  updatePriceHistory(price);
  
  // Update mini chart
  updateMiniChart();
  
  // Update USD balance based on SOL balance and current price
  updateUsdBalance();
}

/**
 * Calculate and update USD balance based on SOL balance and current price
 */
function updateUsdBalance() {
  const solBalanceEl = document.getElementById('sol-balance');
  const usdBalanceEl = document.getElementById('usd-balance');
  
  if (solBalanceEl && usdBalanceEl) {
    // Extract SOL balance from text (e.g., "32.64 SOL" -> 32.64)
    const solBalanceText = solBalanceEl.textContent;
    const solBalance = parseFloat(solBalanceText);
    
    if (!isNaN(solBalance) && priceCache.solana.usd) {
      // Calculate USD value
      const usdValue = solBalance * priceCache.solana.usd;
      
      // Format and update
      usdBalanceEl.textContent = `($${usdValue.toFixed(2)})`;
    }
  }
}

/**
 * Update time display
 */
function updateTimeDisplay() {
  const timeElements = document.querySelectorAll('#current-time');
  const now = new Date();
  const timeString = now.toTimeString().substring(0, 8);
  
  timeElements.forEach(el => {
    el.textContent = timeString;
  });
}

/**
 * Simulate small price movements between API calls
 * This creates a more dynamic price display without hitting API rate limits
 */
function simulatePriceMovement() {
  if (!priceCache.solana.usd) return;
  
  // Create a small random movement (±0.05% of current price)
  const movement = (Math.random() - 0.5) * 0.001 * priceCache.solana.usd;
  priceCache.solana.usd += movement;
  
  // Update UI with new price
  updatePriceDisplay();
}

/**
 * Update price history array for mini chart
 */
function updatePriceHistory(price) {
  // Add new price to history
  priceHistory.push(price);
  
  // Keep only the most recent points
  if (priceHistory.length > MAX_HISTORY_POINTS) {
    priceHistory.shift();
  }
}

/**
 * Initialize mini chart
 */
function initMiniChart() {
  const canvas = document.getElementById('sol-mini-chart');
  if (!canvas) return;
  
  // Fill initial price history with current price
  const currentPrice = priceCache.solana.usd || 100;
  for (let i = 0; i < MAX_HISTORY_POINTS; i++) {
    priceHistory.push(currentPrice);
  }
  
  // Draw initial chart
  updateMiniChart();
}

/**
 * Update mini chart with latest price data
 */
function updateMiniChart() {
  const canvas = document.getElementById('sol-mini-chart');
  if (!canvas || priceHistory.length < 2) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Find min and max for scaling
  const min = Math.min(...priceHistory) * 0.999;
  const max = Math.max(...priceHistory) * 1.001;
  const range = max - min;
  
  // Set line style
  ctx.strokeStyle = priceHistory[priceHistory.length-1] >= priceHistory[0] ? '#57ca84' : '#ff4d4d';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  
  // Begin path
  ctx.beginPath();
  
  // Plot points
  for (let i = 0; i < priceHistory.length; i++) {
    const x = (i / (priceHistory.length - 1)) * width;
    const y = height - ((priceHistory[i] - min) / range) * height;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  // Draw line
  ctx.stroke();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPriceTracking);
