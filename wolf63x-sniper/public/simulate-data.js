/*jshint esversion: 11 */
/*global SniperApp, ModernCharts, Chart */

/**
 * Simulation Data Generator for Wolf63x Sniper Bot
 * This module adds extensive simulated data to demonstrate and test the bot's functionality
 */

class SimulationData {
    constructor() {
        this.solPrice = 147.85;
        this.tokenSymbols = ['WIF', 'BONK', 'MYRO', 'POPCAT', 'PNUT', 'BERN', 'SLERF', 'NEIRO', 'TIKI', 'BOOK'];
        this.tradeSources = ['Birdeye', 'DexScreener', 'pump.fun', 'X/Twitter', 'Telegram', 'Jupiter', 'Scanner', 'Manual'];
        this.timeRanges = ['1h', '5h', '12h', '1d', '2d', '3d', '5d', '1w', '2w'];
        this.lpLockPeriods = ['30 days', '60 days', '90 days', '180 days', '1 year', 'Unlocked'];
         
    }

    /**
     * Generate a random token address
     */
    generateTokenAddress() {
        return Array(44).fill(0).map(() => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join('');
    }

    /**
     * Generate random token data
     */
    generateToken() {
        const randomTokenIndex = Math.floor(Math.random() * this.tokenSymbols.length);
        const symbol = this.tokenSymbols[randomTokenIndex];
        
        const price = Math.random() * 0.0001;
        const volume24h = Math.random() * 50000 + 1000;
        const liquidity = Math.random() * 20000 + 5000;
        const holders = Math.floor(Math.random() * 10000) + 100;
        const buyTax = Math.floor(Math.random() * 10);
        const sellTax = Math.floor(Math.random() * 15);
        const lpLocked = Math.random() > 0.3;
        const lpLockDate = this.lpLockPeriods[Math.floor(Math.random() * this.lpLockPeriods.length)];
        const score = Math.floor(Math.random() * 40) + 60;
        
        return {
            address: this.generateTokenAddress(),
            symbol,
            name: `${symbol} Token`,
            price,
            volume_24h: volume24h,
            liquidity,
            holders,
            buy_tax: buyTax,
            sell_tax: sellTax,
            lp_locked: lpLocked,
            lp_lock_date: lpLockDate,
            score
        };
    }

    /**
     * Generate array of tokens
     */
    generateTokenList(count = 20) {
        return Array(count).fill(0).map(() => this.generateToken());
    }

    /**
     * Generate a trade with random parameters
     */
    generateTrade(isProfitable = null, isActive = true) {
        const profitableChance = isProfitable === null ? Math.random() : (isProfitable ? 1 : 0);
        const isProfitableTrade = profitableChance > 0.3;
        
        const token = this.generateToken();
        const entryPrice = token.price;
        
        // Generate some randomness for current price
        const priceDelta = isProfitableTrade ? 
            (Math.random() * 2 + 1) : // 1x to 3x for profitable
            (Math.random() * 0.5 + 0.5); // 0.5x to 1x for losing
        
        const currentPrice = entryPrice * priceDelta;
        const amount = Math.random() * 2 + 0.2; // 0.2 to 2.2 SOL
        const buyTime = new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)); // 0-5 days ago
        
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const timeHeld = `${hours}h ${minutes}m`;
        
        const profitPercentage = ((currentPrice / entryPrice) - 1) * 100;
        const profitLoss = (profitPercentage / 100) * amount * this.solPrice; // $ value
        
        return {
            token: token.address,
            symbol: token.symbol,
            name: token.name,
            entry_price: entryPrice,
            current_price: currentPrice,
            amount,
            spent: amount * this.solPrice,
            profit_loss: profitLoss,
            profit_percentage: profitPercentage,
            buy_time: buyTime,
            time_held: timeHeld,
            holders: token.holders,
            lp_lock_date: token.lp_lock_date,
            lp_locked: token.lp_locked,
            buy_tax: token.buy_tax,
            sell_tax: token.sell_tax,
            score: token.score,
            source: this.tradeSources[Math.floor(Math.random() * this.tradeSources.length)],
            status: isActive ? 'active' : (Math.random() > 0.5 ? 'sold' : (Math.random() > 0.5 ? 'stop_loss' : 'take_profit')),
            is_active: isActive
        };
    }

    /**
     * Generate a list of active trades
     */
    generateTrades(activeCount = 8, historyCount = 30) {
        // Generate active trades with 70% profitable
        const activeTrades = Array(activeCount).fill(0).map((_, i) => {
            const isProfitable = Math.random() < 0.7;
            return this.generateTrade(isProfitable, true);
        });
        
        // Generate trade history
        const tradeHistory = Array(historyCount).fill(0).map((_, i) => {
            const isProfitable = Math.random() < 0.6;
            return this.generateTrade(isProfitable, false);
        });
        
        return {
            active: activeTrades,
            history: tradeHistory
        };
    }

    /**
     * Generate portfolio performance data over time
     */
    generatePortfolioHistory(days = 30, startingBalance = 10) {
        const data = [];
        const now = new Date();
        let balance = startingBalance;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Add some randomness to the balance changes with an upward trend
            const changePercent = (Math.random() * 15 - 4) / 100; // -4% to +11% daily change
            balance = balance * (1 + changePercent);
            
            data.push({
                date,
                balance
            });
        }
        
        return data;
    }

    /**
     * Generate historical candlestick data for a token
     */
    generateTokenCandlesticks(days = 30, basePrice = 0.0001, volatility = 0.15) {
        const data = [];
        const now = new Date();
        let currentPrice = basePrice;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Generate OHLC data
            const dailyVolatility = volatility * (1 + (Math.random() - 0.5) * 0.5); // Random volatility adjustment
            const change = currentPrice * dailyVolatility * (Math.random() * 2 - 1);
            
            const open = currentPrice;
            const close = Math.max(0.00000001, currentPrice + change); // Ensure price doesn't go to zero
            const high = Math.max(open, close) * (1 + Math.random() * dailyVolatility * 0.5);
            const low = Math.min(open, close) * (1 - Math.random() * dailyVolatility * 0.5);
            const volume = Math.random() * 10000 + 1000; // Random volume between 1000-11000
            
            data.push({
                date,
                open,
                high,
                low,
                close,
                volume
            });
            
            currentPrice = close; // Update for next iteration
        }
        
        return data;
    }

    /**
     * Generate realistic dashboard stats
     */
    generateDashboardStats() {
        // Generate basic stats
        const totalSnipes = Math.floor(Math.random() * 300) + 100;
        const successRate = Math.random() * 30 + 60; // 60-90%
        const successfulSnipes = Math.floor(totalSnipes * (successRate / 100));
        
        const solSpent = Math.floor(Math.random() * 80) + 40; // 40-120 SOL
        const solEarned = solSpent * (1 + (Math.random() * 0.8 - 0.2)); // -20% to +60% ROI
        const overallPnl = solEarned - solSpent;
        
        return {
            total_snipes: totalSnipes,
            successful_snipes: successfulSnipes,
            win_rate: successRate.toFixed(1) + '%',
            sol_spent: solSpent.toFixed(1) + ' SOL',
            sol_earned: solEarned.toFixed(1) + ' SOL',
            overall_pnl: (overallPnl >= 0 ? '+' : '') + overallPnl.toFixed(1) + ' SOL'
        };
    }

    /**
     * Generate simulated recent activity entries
     */
    generateRecentActivity(count = 5) {
        const activities = [];
        const activityTypes = ['buy', 'sell', 'take_profit', 'stop_loss', 'snipe_pending'];
        const timeAgo = ['1m', '2m', '5m', '15m', '30m', '1h', '2h'];
        
        for (let i = 0; i < count; i++) {
            const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            const token = this.tokenSymbols[Math.floor(Math.random() * this.tokenSymbols.length)];
            const time = timeAgo[Math.floor(Math.random() * timeAgo.length)];
            let amount = (Math.random() * 1.5 + 0.2).toFixed(2);
            let pnl = '';
            
            if (type === 'sell' || type === 'take_profit') {
                const profit = (Math.random() * 200 + 50).toFixed(0);
                pnl = `+$${profit} (${(Math.random() * 80 + 20).toFixed(0)}%)`;
            } else if (type === 'stop_loss') {
                const loss = (Math.random() * 100 + 10).toFixed(0);
                pnl = `-$${loss} (${(Math.random() * 30 + 5).toFixed(0)}%)`;
            }
            
            activities.push({
                type,
                token,
                time,
                amount: amount + ' SOL',
                pnl
            });
        }
        
        return activities;
    }

    /**
     * Generate market overview data (top gainers, trending tokens)
     */
    generateMarketOverview() {
        // Generate top gainers
        const topGainers = Array(5).fill(0).map(() => {
            const token = this.generateToken();
            return {
                ...token,
                change: '+' + (Math.random() * 300 + 100).toFixed(0) + '%'
            };
        });
        
        // Generate trending tokens
        const trending = Array(5).fill(0).map(() => {
            const token = this.generateToken();
            return {
                ...token,
                volume: (token.volume_24h / 1000).toFixed(0) + 'K'
            };
        });
        
        return {
            top_gainers: topGainers,
            trending
        };
    }

    /**
     * Apply all simulated data to the app
     */
    applySimulatedData(app) {
        if (!app) {
            console.error('App instance not provided to simulation');
            return;
        }
        
        console.log('Applying simulated data to the app...');
        
        // Generate basic data
        const stats = this.generateDashboardStats();
        const trades = this.generateTrades(8, 30);
        const marketOverview = this.generateMarketOverview();
        const opportunities = this.generateTokenList(25);
        const portfolioHistory = this.generatePortfolioHistory(30, 10);
        
        // Update app properties with simulated data
        app.balance = parseFloat(stats.sol_earned);
        app.solPrice = this.solPrice;
        app.activeTrades = trades.active;
        app.tradeHistory = trades.history;
        app.opportunities = opportunities;
        app.portfolioHistory = portfolioHistory;
        
        // Update Dashboard Stats
        document.getElementById('stats-total-snipes').textContent = stats.total_snipes;
        document.getElementById('stats-successful-snipes').textContent = stats.successful_snipes;
        document.getElementById('stats-win-rate').textContent = stats.win_rate;
        document.getElementById('stats-sol-spent').textContent = stats.sol_spent;
        document.getElementById('stats-sol-earned').textContent = stats.sol_earned;
        document.getElementById('stats-overall-pnl').textContent = stats.overall_pnl;
        
        // Update the top bar sol price
        document.getElementById('sol-price').textContent = this.solPrice.toFixed(2);
        document.getElementById('sol-change').textContent = '+2.45%';
        document.getElementById('sol-change').className = 'sol-price-change positive';
        
        // Update wallet balance
        document.getElementById('sol-balance').textContent = app.balance.toFixed(2) + ' SOL';
        document.getElementById('usd-balance').textContent = `($${(app.balance * this.solPrice).toFixed(2)})`;
        
        // Update connection status to show as connected
        document.getElementById('connection-status').innerHTML = '✅';
        document.getElementById('wallet-address').textContent = 'Solo8...v12K';
        
        // Update trade tables
        this.updateTradeTable(trades.active);
        
        // Simulate trading activity
        this.updateRecentActivity();
        
        // Update market overview
        this.updateMarketOverview(marketOverview);
        
        console.log('Simulated data applied successfully');
        
        // Return reference to simulation data
        return this;
    }
    
    /**
     * Update active trades table
     */
    updateTradeTable(trades) {
        const tableBody = document.getElementById('open-trades-table');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        trades.forEach(trade => {
            const profitClass = trade.profit_percentage > 0 ? 'positive' : 'negative';
            const profitSign = trade.profit_percentage > 0 ? '+' : '';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trade.symbol}</td>
                <td>$${trade.entry_price.toExponential(2)}</td>
                <td>$${trade.current_price.toExponential(2)}</td>
                <td class="${profitClass}">${profitSign}${trade.profit_percentage.toFixed(1)}%<br>${profitSign}$${Math.abs(trade.profit_loss).toFixed(2)}</td>
                <td>${trade.amount.toFixed(2)} SOL<br>$${trade.spent.toFixed(2)}</td>
                <td>${trade.holders}</td>
                <td>${trade.lp_locked ? '🔒 ' + trade.lp_lock_date : '🔓 Unlocked'}</td>
                <td>${trade.buy_tax}% / ${trade.sell_tax}%</td>
                <td>${trade.time_held}</td>
                <td>${trade.score}/100</td>
                <td>${trade.source}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Sell</button>
                    <button class="btn btn-sm">Chart</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update trade counts and profits
        const profitTrades = trades.filter(t => t.profit_percentage > 0);
        const lossTrades = trades.filter(t => t.profit_percentage <= 0);
        
        const totalProfit = profitTrades.reduce((sum, t) => sum + t.profit_loss, 0);
        const totalLoss = lossTrades.reduce((sum, t) => sum + t.profit_loss, 0);
        const totalPnL = totalProfit + totalLoss;
        
        document.getElementById('open-trades-count').textContent = trades.length;
        document.getElementById('profit-count').textContent = profitTrades.length;
        document.getElementById('loss-count').textContent = lossTrades.length;
        document.getElementById('profit-amount').textContent = '+$' + totalProfit.toFixed(0);
        document.getElementById('loss-amount').textContent = '-$' + Math.abs(totalLoss).toFixed(0);
        document.getElementById('total-profit').textContent = (totalPnL >= 0 ? '+$' : '-$') + Math.abs(totalPnL).toFixed(0);
        document.getElementById('total-profit').className = totalPnL >= 0 ? 'positive' : 'negative';
    }
    
    /**
     * Update recent activity feed
     */
    updateRecentActivity() {
        const activities = this.generateRecentActivity(4);
        const activityList = document.querySelector('.activity-feed-list');
        if (!activityList) return;
        
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            let iconClass = 'fa-check-circle';
            let actionText = 'Snipe Success';
            let itemClass = 'snipe-success';
            
            if (activity.type === 'sell' || activity.type === 'take_profit') {
                iconClass = 'fa-dollar-sign';
                actionText = 'Take Profit';
                itemClass = 'take-profit';
            } else if (activity.type === 'stop_loss') {
                iconClass = 'fa-times-circle';
                actionText = 'Stop Loss';
                itemClass = 'snipe-fail';
            } else if (activity.type === 'snipe_pending') {
                iconClass = 'fa-hourglass-half';
                actionText = 'Snipe Pending';
                itemClass = 'snipe-pending';
            }
            
            item.classList.add(itemClass);
            
            item.innerHTML = `
                <div class="activity-icon"><i class="fas ${iconClass}"></i></div>
                <div class="activity-details">
                    <span class="token-name">${activity.token}</span> <span class="activity-action">${actionText}</span>
                    <span class="activity-pnl ${activity.pnl.includes('+') ? 'positive' : 'negative'}">${activity.pnl || activity.amount}</span>
                </div>
                <div class="activity-time">${activity.time} ago</div>
            `;
            
            activityList.appendChild(item);
        });
    }
    
    /**
     * Update market overview with trending tokens and top gainers
     */
    updateMarketOverview(marketData) {
        // Update top gainers
        const topGainersList = document.getElementById('top-gainers-list');
        if (topGainersList) {
            topGainersList.innerHTML = '';
            
            marketData.top_gainers.slice(0, 3).forEach(token => {
                const item = document.createElement('div');
                item.className = 'market-item';
                
                item.innerHTML = `
                    <div class="market-token">$${token.symbol}</div>
                    <div class="market-change positive">${token.change}</div>
                    <div class="market-actions">
                        <button class="btn btn-sm">Chart</button>
                        <button class="btn btn-sm btn-primary trade-btn">Buy</button>
                    </div>
                `;
                
                topGainersList.appendChild(item);
            });
        }
        
        // Update trending list
        const trendingList = document.getElementById('trending-list');
        if (trendingList) {
            trendingList.innerHTML = '';
            
            marketData.trending.slice(0, 3).forEach(token => {
                const item = document.createElement('div');
                item.className = 'market-item';
                
                item.innerHTML = `
                    <div class="market-token">$${token.symbol}</div>
                    <div class="market-volume">${token.volume} SOL Vol</div>
                    <div class="market-actions">
                        <button class="btn btn-sm btn-primary trade-btn">Trade</button>
                    </div>
                `;
                
                trendingList.appendChild(item);
            });
        }
        
        // Update scanner table
        const scannerTable = document.getElementById('scanner-table');
        if (scannerTable) {
            scannerTable.innerHTML = '';
            
            this.generateTokenList(10).forEach(token => {
                const row = document.createElement('tr');
                
                const changePercent = (Math.random() * 200 - 50).toFixed(1);
                const changeClass = changePercent > 0 ? 'positive' : 'negative';
                const changeSign = changePercent > 0 ? '+' : '';
                
                const age = ['10m', '30m', '1h', '3h', '6h', '12h', '1d', '2d'][Math.floor(Math.random() * 8)];
                
                row.innerHTML = `
                    <td>$${token.symbol}</td>
                    <td>$${token.price.toExponential(2)}</td>
                    <td class="${changeClass}">${changeSign}${changePercent}%</td>
                    <td>${(token.volume_24h / 1000).toFixed(1)}K SOL</td>
                    <td>${(token.liquidity / 1000).toFixed(1)}K SOL</td>
                    <td>${token.holders}</td>
                    <td>${age}</td>
                    <td>${token.lp_locked ? '🔒 ' + token.lp_lock_date : '🔓 Unlocked'}</td>
                    <td>${token.buy_tax}% / ${token.sell_tax}%</td>
                    <td>${token.score}/100</td>
                    <td>
                        <button class="btn btn-sm">Chart</button>
                        <button class="btn btn-sm btn-success">Snipe</button>
                    </td>
                `;
                
                scannerTable.appendChild(row);
            });
        }
    }
    
    /**
     * Generate enhanced chart data for more realistic demos
     */
    enhanceChartData(chartInstance) {
        if (!chartInstance || !chartInstance.generatePnlData) {
            console.error('Chart instance not provided or invalid');
            return;
        }
        
        // Store original methods
        const originalGeneratePnL = chartInstance.generatePnlData;
        const originalGenerateCandlestick = chartInstance.generateCandlestickData;
        
        // Override with more realistic data generators
        chartInstance.generatePnlData = (range) => {
            const { dataPoints, intervalMs } = chartInstance.calculateDataParams(range);
            
            const labels = [];
            const values = [];
            
            // Start with a base value and create a realistic trend
            let currentValue = 10; // Starting with 10 SOL
            const now = Date.now();
            
            // Create a few trend reversals for realistic chart
            const trendPoints = [
                { point: Math.floor(dataPoints * 0.2), trend: 0.6 },  // Uptrend
                { point: Math.floor(dataPoints * 0.4), trend: -0.7 }, // Downtrend
                { point: Math.floor(dataPoints * 0.6), trend: 0.3 },  // Slight up
                { point: Math.floor(dataPoints * 0.8), trend: 0.8 },  // Strong up
            ];
            
            for (let i = 0; i < dataPoints; i++) {
                const timestamp = now - (dataPoints - 1 - i) * intervalMs;
                labels.push(new Date(timestamp));
                
                // Find current trend
                let currentTrend = 0.1; // Default slight uptrend
                for (const trend of trendPoints) {
                    if (i >= trend.point) {
                        currentTrend = trend.trend;
                    }
                }
                
                // Add trend-aware randomness
                const change = (Math.random() - 0.45) * 0.5;
                currentValue += change + (currentTrend / dataPoints * 5);
                
                // Ensure we don't go negative
                currentValue = Math.max(0.1, currentValue);
                
                values.push(currentValue);
            }
            
            return { labels, values };
        };
        
        // Enhanced candlestick generator for more realistic movements
        chartInstance.generateCandlestickData = (range) => {
            const { dataPoints, intervalMs } = chartInstance.calculateDataParams(range);
            
            const labels = [];
            const values = [];
            
            // Start with a realistic token price
            let currentPrice = 0.00023;
            const now = Date.now();
            
            // Generate some trend patterns
            const trends = [
                { start: 0, end: Math.floor(dataPoints * 0.3), trend: 0.3 },       // Initial uptrend
                { start: Math.floor(dataPoints * 0.3), end: Math.floor(dataPoints * 0.45), trend: -0.5 }, // Sharp downtrend
                { start: Math.floor(dataPoints * 0.45), end: Math.floor(dataPoints * 0.75), trend: 0.1 }, // Consolidation
                { start: Math.floor(dataPoints * 0.75), end: dataPoints, trend: 0.8 }      // Strong rally
            ];
            
            // Create some volatility patterns
            const volatilityPatterns = [
                { start: Math.floor(dataPoints * 0.4), end: Math.floor(dataPoints * 0.45), factor: 3 }, // Spike in volatility
                { start: Math.floor(dataPoints * 0.75), end: Math.floor(dataPoints * 0.85), factor: 2 }  // Increased volatility
            ];
            
            for (let i = 0; i < dataPoints; i++) {
                const timestamp = now - (dataPoints - 1 - i) * intervalMs;
                labels.push(new Date(timestamp));
                
                // Find current trend
                let currentTrend = 0;
                for (const trend of trends) {
                    if (i >= trend.start && i < trend.end) {
                        currentTrend = trend.trend;
                        break;
                    }
                }
                
                // Find volatility modifier
                let volatilityMod = 1;
                for (const vol of volatilityPatterns) {
                    if (i >= vol.start && i < vol.end) {
                        volatilityMod = vol.factor;
                        break;
                    }
                }
                
                // Calculate price change based on trend and volatility
                const baseVolatility = 0.08;
                const adjustedVolatility = baseVolatility * volatilityMod;
                const randomFactor = (Math.random() * 2 - 1) * adjustedVolatility;
                const trendFactor = currentTrend / dataPoints * 2;
                const change = currentPrice * (randomFactor + trendFactor);
                
                // Calculate OHLC values
                const open = currentPrice;
                const close = Math.max(0.00000001, currentPrice + change);
                const high = Math.max(open, close) * (1 + Math.random() * adjustedVolatility * 0.5);
                const low = Math.min(open, close) * (1 - Math.random() * adjustedVolatility * 0.5);
                
                values.push({
                    x: timestamp,
                    o: open,
                    h: high,
                    l: Math.max(0.00000001, low),
                    c: close
                });
                
                currentPrice = close;
            }
            
            return { labels, values };
        };
        
        // Return original methods for restoration if needed
        return {
            restoreOriginalMethods: () => {
                chartInstance.generatePnlData = originalGeneratePnL;
                chartInstance.generateCandlestickData = originalGenerateCandlestick;
            }
        };
    }
}

// Auto-initialize when the window loads
window.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the app to initialize first
    setTimeout(() => {
        console.log('Initializing simulation data...');
        const simulator = new SimulationData();
        
        // Apply simulated data to the app if it exists
        if (window.app) {
            simulator.applySimulatedData(window.app);
            console.log('Simulation data applied to app');
            
            // Enhance chart data for better visuals
            if (window.charts) {
                simulator.enhanceChartData(window.charts);
                
                // Refresh the current chart
                const timeRange = document.getElementById('selected-time-range')?.textContent || '5m';
                const chartType = document.querySelector('.chart-type-btn.active')?.getAttribute('data-chart-type') || 'line';
                window.charts.updateChart(timeRange, chartType);
                
                console.log('Chart data enhanced with realistic patterns');
            }
        } else {
            console.warn('App not found in window object, simulation data not applied');
        }
        
        // Make simulator available globally for manual testing
        window.simulator = simulator;
    }, 1000);
}); 