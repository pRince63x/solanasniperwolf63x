/*jshint esversion: 9 */
/*global SniperApp */

// Wolf63x Solana Sniper Bot - Trading Functionality

// Extend the SniperApp class with trading methods
SniperApp.prototype.fetchActiveTrades = async function() {
    try {
        if (!this.isConnected) return [];
        
        const response = await fetch(`${this.apiBaseUrl}/trades`);
        if (!response.ok) {
            throw new Error('Failed to fetch active trades');
        }
        
        this.activeTrades = await response.json();
        this.updateTradesUI();
        return this.activeTrades;
    } catch (error) {
        console.error('Error fetching active trades:', error);
        this.showNotification('Failed to fetch active trades', 'error');
        return [];
    }
};

SniperApp.prototype.fetchOpportunities = async function() {
    try {
        const response = await fetch(`${this.apiBaseUrl}/scanner/opportunities`);
        if (!response.ok) {
            throw new Error('Failed to fetch opportunities');
        }
        
        this.opportunities = await response.json();
        this.updateOpportunitiesUI();
        return this.opportunities;
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        this.showNotification('Failed to fetch opportunities', 'error');
        return [];
    }
};

SniperApp.prototype.snipeToken = async function(tokenAddress, amount, slippage) {
    try {
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet first', 'warning');
            return false;
        }
        
        this.showNotification(`Sniping ${tokenAddress}...`, 'info');
        
        const response = await fetch(`${this.apiBaseUrl}/snipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token_address: tokenAddress,
                amount: amount,
                slippage: slippage
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to snipe token');
        }
        
        const data = await response.json();
        
        this.showNotification(`Successfully sniped token! Tx: ${data.signature.substring(0, 8)}...`, 'success');
        
        // Refresh trades and balance
        await this.fetchActiveTrades();
        await this.updateBalance();
        
        return true;
    } catch (error) {
        console.error('Error sniping token:', error);
        this.showNotification('Failed to snipe token', 'error');
        return false;
    }
};

SniperApp.prototype.sellToken = async function(tokenAddress, amount, slippage) {
    try {
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet first', 'warning');
            return false;
        }
        
        this.showNotification(`Selling ${tokenAddress}...`, 'info');
        
        const response = await fetch(`${this.apiBaseUrl}/sell`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token_address: tokenAddress,
                amount: amount,
                slippage: slippage
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to sell token');
        }
        
        const data = await response.json();
        
        this.showNotification(`Successfully sold token! Tx: ${data.signature.substring(0, 8)}...`, 'success');
        
        // Refresh trades and balance
        await this.fetchActiveTrades();
        await this.updateBalance();
        
        return true;
    } catch (error) {
        console.error('Error selling token:', error);
        this.showNotification('Failed to sell token', 'error');
        return false;
    }
};

SniperApp.prototype.takeAllProfits = async function() {
    try {
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet first', 'warning');
            return false;
        }
        
        const profitableTrades = this.activeTrades.filter(trade => trade.profit_loss_percent > 0);
        
        if (profitableTrades.length === 0) {
            this.showNotification('No profitable trades to take', 'warning');
            return false;
        }
        
        this.showNotification(`Taking profits from ${profitableTrades.length} trades...`, 'info');
        
        let successCount = 0;
        
        for (const trade of profitableTrades) {
            try {
                await this.sellToken(trade.token, trade.amount, 1.0);
                successCount++;
            } catch (error) {
                console.error(`Error selling ${trade.token}:`, error);
            }
        }
        
        this.showNotification(`Successfully took profits from ${successCount}/${profitableTrades.length} trades`, 'success');
        
        return true;
    } catch (error) {
        console.error('Error taking all profits:', error);
        this.showNotification('Failed to take all profits', 'error');
        return false;
    }
};

SniperApp.prototype.startScanner = async function() {
    try {
        if (this.scannerActive) return;
        
        const response = await fetch(`${this.apiBaseUrl}/scanner/start`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to start scanner');
        }
        
        this.scannerActive = true;
        
        // Update UI
        document.getElementById('start-scanner').disabled = true;
        document.getElementById('stop-scanner').disabled = false;
        
        // Set up interval to fetch opportunities
        const refreshRate = parseInt(document.getElementById('auto-refresh').value) || 5;
        
        if (refreshRate > 0) {
            this.scanInterval = setInterval(() => {
                this.fetchOpportunities();
            }, refreshRate * 1000);
        }
        
        this.showNotification('Scanner started', 'success');
        
        return true;
    } catch (error) {
        console.error('Error starting scanner:', error);
        this.showNotification('Failed to start scanner', 'error');
        return false;
    }
};

SniperApp.prototype.stopScanner = async function() {
    try {
        if (!this.scannerActive) return;
        
        const response = await fetch(`${this.apiBaseUrl}/scanner/stop`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to stop scanner');
        }
        
        this.scannerActive = false;
        
        // Update UI
        document.getElementById('start-scanner').disabled = false;
        document.getElementById('stop-scanner').disabled = true;
        
        // Clear interval
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        
        this.showNotification('Scanner stopped', 'info');
        
        return true;
    } catch (error) {
        console.error('Error stopping scanner:', error);
        this.showNotification('Failed to stop scanner', 'error');
        return false;
    }
};

SniperApp.prototype.updateBalance = async function() {
    try {
        if (!this.isConnected) return;
        
        const response = await fetch(`${this.apiBaseUrl}/wallet/balance`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch balance');
        }
        
        const data = await response.json();
        this.balance = data.balance;
        
        // Update UI
        document.getElementById('sol-balance').textContent = `${this.balance.toFixed(2)} SOL`;
        document.getElementById('usd-balance').textContent = `($${(this.balance * this.solPrice).toFixed(2)})`;
        
        return this.balance;
    } catch (error) {
        console.error('Error updating balance:', error);
        return this.balance;
    }
};

// UI update methods
SniperApp.prototype.updateTradesUI = function() {
    const tableBody = document.getElementById('open-trades-table');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Update counts
    const totalTrades = this.activeTrades.length;
    const profitTrades = this.activeTrades.filter(trade => trade.profit_loss > 0);
    const lossTrades = this.activeTrades.filter(trade => trade.profit_loss <= 0);
    
    document.getElementById('open-trades-count').textContent = totalTrades;
    document.getElementById('profit-count').textContent = profitTrades.length;
    document.getElementById('loss-count').textContent = lossTrades.length;
    
    const totalProfit = profitTrades.reduce((sum, trade) => sum + trade.profit_loss, 0);
    const totalLoss = lossTrades.reduce((sum, trade) => sum + trade.profit_loss, 0);
    
    document.getElementById('profit-amount').textContent = this.formatMoney(totalProfit);
    document.getElementById('loss-amount').textContent = this.formatMoney(totalLoss);
    document.getElementById('total-profit').textContent = this.formatMoney(totalProfit + totalLoss);
    
    // Add rows
    this.activeTrades.forEach(trade => {
        const row = document.createElement('tr');
        
        const profitClass = trade.profit_loss > 0 ? 'positive' : 'negative';
        const scoreClass = trade.score >= 90 ? 'positive' : trade.score >= 75 ? 'warning' : 'negative';
        
        row.innerHTML = `
            <td>${trade.symbol}</td>
            <td>$${trade.entry_price.toFixed(8)}</td>
            <td>$${trade.current_price.toFixed(8)}</td>
            <td class="${profitClass}">$${trade.profit_loss.toFixed(2)}</td>
            <td>${trade.amount.toFixed(2)} SOL</td>
            <td>${trade.holders}</td>
            <td>🔒 ${trade.lp_lock_date}</td>
            <td>${trade.buy_tax}/${trade.sell_tax}%</td>
            <td>${trade.time_held}</td>
            <td class="${scoreClass}">${trade.score}${trade.score >= 90 ? '✓' : trade.score >= 75 ? '⚠️' : '❌'}</td>
            <td>${trade.source}</td>
            <td>
                <button class="btn btn-sm" onclick="app.viewTokenDetails('${trade.token}')">📊</button>
                <button class="btn btn-sm btn-danger" onclick="app.sellToken('${trade.token}', ${trade.amount}, 1.0)">SELL</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show empty state if no trades
    if (this.activeTrades.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="12" class="empty-state">No active trades. Start sniping to see your trades here!</td>
        `;
        tableBody.appendChild(emptyRow);
    }
};

SniperApp.prototype.updateOpportunitiesUI = function() {
    const tableBody = document.getElementById('scanner-table');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add rows
    this.opportunities.forEach(opportunity => {
        const row = document.createElement('tr');
        
        const ageMinutes = Math.floor((Date.now() - new Date(opportunity.created_at).getTime()) / 60000);
        const scoreClass = opportunity.score >= 90 ? 'positive' : opportunity.score >= 75 ? 'warning' : 'negative';
        
        row.innerHTML = `
            <td>${opportunity.symbol}</td>
            <td>$${opportunity.price.toFixed(8)}</td>
            <td>-</td>
            <td>${opportunity.volume_24h.toFixed(2)} SOL</td>
            <td>${opportunity.liquidity.toFixed(2)} SOL</td>
            <td>${opportunity.holders}</td>
            <td>${ageMinutes}m</td>
            <td>${opportunity.lp_locked ? '🔒' : '🔓'}</td>
            <td>${opportunity.buy_tax}/${opportunity.sell_tax}%</td>
            <td class="${scoreClass}">${opportunity.score}${opportunity.score >= 90 ? '✓' : opportunity.score >= 75 ? '⚠️' : '❌'}</td>
            <td>
                <button class="btn btn-sm" onclick="app.viewTokenDetails('${opportunity.address}')">📊</button>
                <button class="btn btn-sm btn-primary trade-btn" onclick="app.snipeToken('${opportunity.address}', ${document.getElementById('buy-amount').value}, ${document.getElementById('slippage').value / 100})">SNIPE</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show empty state if no opportunities
    if (this.opportunities.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="11" class="empty-state">No opportunities found. Start the scanner to find tokens!</td>
        `;
        tableBody.appendChild(emptyRow);
    }
    
    // Disable trade buttons if not connected
    if (!this.isConnected) {
        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.disabled = true;
        });
    }
};

// Settings management
SniperApp.prototype.saveSettings = function() {
    const settings = {
        buy_amount: parseFloat(document.getElementById('buy-amount').value),
        slippage: parseFloat(document.getElementById('slippage').value),
        take_profit: parseFloat(document.getElementById('take-profit').value),
        stop_loss: parseFloat(document.getElementById('stop-loss').value),
        time_between: parseFloat(document.getElementById('time-between').value),
        max_trades: parseInt(document.getElementById('max-trades').value),
        auto_snipe: document.getElementById('auto-snipe').checked,
        auto_sell: document.getElementById('auto-sell').checked
    };
    
    localStorage.setItem('sniperSettings', JSON.stringify(settings));
    this.showNotification('Settings saved', 'success');
};

SniperApp.prototype.resetSettings = function() {
    document.getElementById('buy-amount').value = '0.5';
    document.getElementById('slippage').value = '0.6';
    document.getElementById('take-profit').value = '50';
    document.getElementById('stop-loss').value = '30';
    document.getElementById('time-between').value = '1';
    document.getElementById('max-trades').value = '100';
    document.getElementById('auto-snipe').checked = false;
    document.getElementById('auto-sell').checked = false;
    
    localStorage.removeItem('sniperSettings');
    this.showNotification('Settings reset to default', 'info');
};

SniperApp.prototype.loadSettings = function() {
    const savedSettings = localStorage.getItem('sniperSettings');
    if (!savedSettings) return;
    
    const settings = JSON.parse(savedSettings);
    
    document.getElementById('buy-amount').value = settings.buy_amount;
    document.getElementById('slippage').value = settings.slippage;
    document.getElementById('take-profit').value = settings.take_profit;
    document.getElementById('stop-loss').value = settings.stop_loss;
    document.getElementById('time-between').value = settings.time_between;
    document.getElementById('max-trades').value = settings.max_trades;
    document.getElementById('auto-snipe').checked = settings.auto_snipe;
    document.getElementById('auto-sell').checked = settings.auto_sell;
};

// Filter management
SniperApp.prototype.saveFilters = function() {
    const filters = {
        min_liquidity: parseFloat(document.getElementById('min-liquidity').value),
        min_holders: parseInt(document.getElementById('min-holders').value),
        max_buy_tax: parseInt(document.getElementById('max-buy-tax').value),
        max_sell_tax: parseInt(document.getElementById('max-sell-tax').value),
        token_age: parseInt(document.getElementById('token-age').value),
        min_score: parseInt(document.getElementById('min-score').value),
        require_lp_lock: document.getElementById('require-lp-lock').checked,
        anti_rug: document.getElementById('anti-rug').checked,
        anti_honeypot: document.getElementById('anti-honeypot').checked
    };
    
    localStorage.setItem('sniperFilters', JSON.stringify(filters));
    this.showNotification('Filters saved', 'success');
};

SniperApp.prototype.resetFilters = function() {
    document.getElementById('min-liquidity').value = '25';
    document.getElementById('min-holders').value = '50';
    document.getElementById('max-buy-tax').value = '10';
    document.getElementById('max-sell-tax').value = '10';
    document.getElementById('token-age').value = '3';
    document.getElementById('min-score').value = '75';
    document.getElementById('require-lp-lock').checked = true;
    document.getElementById('anti-rug').checked = true;
    document.getElementById('anti-honeypot').checked = true;
    
    localStorage.removeItem('sniperFilters');
    this.showNotification('Filters reset to default', 'info');
};

SniperApp.prototype.loadFilters = function() {
    const savedFilters = localStorage.getItem('sniperFilters');
    if (!savedFilters) return;
    
    const filters = JSON.parse(savedFilters);
    
    document.getElementById('min-liquidity').value = filters.min_liquidity;
    document.getElementById('min-holders').value = filters.min_holders;
    document.getElementById('max-buy-tax').value = filters.max_buy_tax;
    document.getElementById('max-sell-tax').value = filters.max_sell_tax;
    document.getElementById('token-age').value = filters.token_age;
    document.getElementById('min-score').value = filters.min_score;
    document.getElementById('require-lp-lock').checked = filters.require_lp_lock;
    document.getElementById('anti-rug').checked = filters.anti_rug;
    document.getElementById('anti-honeypot').checked = filters.anti_honeypot;
};
