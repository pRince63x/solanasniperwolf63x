/*jshint esversion: 11 */
/*global SniperApp, Chart */

// Wolf63x Solana Sniper Bot - Dashboard Functionality with Trades

// Dashboard state variables
let currentTimeRange = '7d';

// Initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
        initializeDashboard();
});

// Main dashboard initialization
function initializeDashboard() {
    console.log('Dashboard initialized');
    
    // Initialize core components
    fetchOpenTrades();
    setupDashboardControls();
    updateDashboardStats();
}

// Connect to SniperApp events for live updates
function connectToDashboardEvents() {
    if (!window.SniperApp) return;
    
    // Listen for balance updates
    window.SniperApp.events.on('balanceUpdated', (balance) => {
        const walletBalanceElement = document.querySelector('#wallet-balance');
        if (walletBalanceElement) {
            walletBalanceElement.textContent = formatCurrency(balance);
        }
    });
    
    // We still want to update stats when trades are updated
    window.SniperApp.events.on('tradesUpdated', (trades) => {
        updateDashboardStats(trades);
        // Also update both trade displays when trades change
        renderAllTradeDisplays(trades);
    });
}

// Set up dashboard controls
function setupDashboardControls() {
    // Setup Take All Profits buttons in the pairs page
    const pairsTakeAllProfitsBtn = document.querySelector('#pairs-take-profits');
    if (pairsTakeAllProfitsBtn) {
        pairsTakeAllProfitsBtn.addEventListener('click', takeAllProfits);
    }
    
    // Setup trades filter for pairs page
    const pairsTradesFilterDropdown = document.querySelector('#pairs-trades-filter');
    if (pairsTradesFilterDropdown) {
        pairsTradesFilterDropdown.addEventListener('change', function() {
            applyTradeFilter(this.value, '#pairs-page');
        });
    }
    
    // Setup trades sort for pairs page
    const pairsTradesSortDropdown = document.querySelector('#pairs-trades-sort');
    if (pairsTradesSortDropdown) {
        pairsTradesSortDropdown.addEventListener('change', function() {
            applySorting(this.value, '#pairs-page');
        });
    }
}

// Apply filter to active trades
function applyTradeFilter(filterType, container) {
    console.log('Applying filter:', filterType);
    
    // Filter trades in new UI
    const tradeItems = document.querySelectorAll(container + ' .compact-trade-item');
    tradeItems.forEach(item => {
        const profitCell = item.querySelector('.profit-cell');
        
        if (filterType === 'all') {
            item.style.display = '';
        } else if (filterType === 'profit' && profitCell && profitCell.classList.contains('positive')) {
            item.style.display = '';
        } else if (filterType === 'loss' && profitCell && profitCell.classList.contains('negative')) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Filter trades in table UI
    const tableRows = document.querySelectorAll(container + ' #open-trades-table tr[data-trade-id]');
    tableRows.forEach(row => {
        const profitCell = row.querySelector('td.positive, td.negative');
        
        if (filterType === 'all') {
            row.style.display = '';
        } else if (filterType === 'profit' && profitCell && profitCell.classList.contains('positive')) {
            row.style.display = '';
        } else if (filterType === 'loss' && profitCell && profitCell.classList.contains('negative')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Apply sorting to active trades
function applySorting(sortType, container) {
    console.log('Applying sorting:', sortType);
    
    // Sort function for different sort types
    const getSortValue = (item, type) => {
        switch (type) {
            case 'profit': {
                const profitText = item.querySelector('.profit-cell');
                if (profitText) {
                    // Extract percentage from text like +142%
                    const match = profitText.textContent.match(/([+-]?\d+(?:\.\d+)?)%/);
                    return match ? parseFloat(match[1]) : 0;
                }
                return 0;
            }
            case 'time': {
                const timeCell = item.querySelector('.trade-cell:nth-child(9)');
                if (timeCell) {
                    // Convert time string to minutes for sorting
                    const timeText = timeCell.textContent;
                    return convertTimeStringToMinutes(timeText);
                }
                return 0;
            }
            case 'score': {
                const scoreCell = item.querySelector('.score-cell');
                if (scoreCell) {
                    return parseFloat(scoreCell.textContent) || 0;
                }
                return 0;
            }
            default:
                return 0;
        }
    };
    
    // Sort compact trades
    const compactTradesContainer = document.querySelector(container + ' .compact-trades-rows');
    if (compactTradesContainer) {
        const compactItems = Array.from(compactTradesContainer.querySelectorAll('.compact-trade-item'));
        
        compactItems.sort((a, b) => {
            const aValue = getSortValue(a, sortType);
            const bValue = getSortValue(b, sortType);
            
            return sortType === 'time' ? aValue - bValue : bValue - aValue;
        });
        
        // Remove all items and re-append in sorted order
        compactItems.forEach(item => compactTradesContainer.appendChild(item));
    }
    
    // Sort table trades
    const tableBody = document.querySelector(container + ' #open-trades-table');
    if (tableBody) {
        const tableRows = Array.from(tableBody.querySelectorAll('tr[data-trade-id]'));
        
        tableRows.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortType) {
                case 'profit': {
                    const aProfitCell = a.querySelector('td:nth-child(4)');
                    const bProfitCell = b.querySelector('td:nth-child(4)');
                    aValue = aProfitCell ? parseFloat(aProfitCell.textContent.replace(/[+%]/g, '')) : 0;
                    bValue = bProfitCell ? parseFloat(bProfitCell.textContent.replace(/[+%]/g, '')) : 0;
                    break;
                }
                case 'time': {
                    const aTimeCell = a.querySelector('td:nth-child(9)');
                    const bTimeCell = b.querySelector('td:nth-child(9)');
                    aValue = aTimeCell ? convertTimeStringToMinutes(aTimeCell.textContent) : 0;
                    bValue = bTimeCell ? convertTimeStringToMinutes(bTimeCell.textContent) : 0;
                    break;
                }
                case 'score': {
                    const aScoreCell = a.querySelector('td:nth-child(10)');
                    const bScoreCell = b.querySelector('td:nth-child(10)');
                    aValue = aScoreCell ? parseFloat(aScoreCell.textContent) : 0;
                    bValue = bScoreCell ? parseFloat(bScoreCell.textContent) : 0;
                    break;
                }
                default:
                    aValue = 0;
                    bValue = 0;
            }
            
            return sortType === 'time' ? aValue - bValue : bValue - aValue;
        });
        
        // Remove all rows and re-append in sorted order
        tableRows.forEach(row => tableBody.appendChild(row));
    }
}

// Helper function to convert time strings like "5h 12m" to minutes for sorting
function convertTimeStringToMinutes(timeString) {
    if (!timeString) return 0;
    
    let totalMinutes = 0;
    
    // Handle days: "2d 5h"
    const daysMatch = timeString.match(/(\d+)d/);
    if (daysMatch) {
        totalMinutes += parseInt(daysMatch[1]) * 24 * 60;
    }
    
    // Handle hours: "5h" or "5h 30m"
    const hoursMatch = timeString.match(/(\d+)h/);
    if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    
    // Handle minutes: "30m"
    const minutesMatch = timeString.match(/(\d+)m/);
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1]);
    }
    
    return totalMinutes;
}

// Fetch open trades from SniperApp or simulate for demo
function fetchOpenTrades() {
    // In a real app, this would fetch from API or database
    let openTrades = [];
    
    // Try to get trades from SniperApp if it exists
    if (window.SniperApp && window.SniperApp.activeTrades) {
        openTrades = window.SniperApp.activeTrades;
    } else {
        // Simulate trades for demo purposes with enhanced properties
        openTrades = [
            {
                id: 'trade1',
                tokenName: 'Solana',
                tokenSymbol: 'SOL',
                tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
                entryPrice: 120.50,
                currentPrice: 135.75,
                amount: 2.5,
                value: 339.38,
                pnl: 38.13,
                pnlPercent: 12.65,
                timestamp: Date.now() - 48 * 60 * 60 * 1000,
                holders: 756000,
                lpStatus: 'Locked',
                tax: '0%/0%',
                source: 'DexScreener',
                score: 9.6
            },
            {
                id: 'trade2',
                tokenName: 'Bonk',
                tokenSymbol: 'BONK',
                tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                entryPrice: 0.00002165,
                currentPrice: 0.00001998,
                amount: 25000000,
                value: 499.50,
                pnl: -41.75,
                pnlPercent: -7.71,
                timestamp: Date.now() - 24 * 60 * 60 * 1000,
                holders: 52748,
                lpStatus: 'Locked',
                tax: '0%/0%',
                source: 'Manual',
                score: 9.8
            },
            {
                id: 'trade3',
                tokenName: 'Pepecoin',
                tokenSymbol: 'PEPE',
                tokenAddress: '0x123456789abcdef1234567890abcdef123456789',
                entryPrice: 0.00000826,
                currentPrice: 0.00002008,
                amount: 50000000,
                value: 1004.00,
                pnl: 591.0,
                pnlPercent: 143.10,
                timestamp: Date.now() - 45 * 60 * 1000,
                holders: 7842,
                lpStatus: 'Locked',
                tax: '5%/5%',
                source: 'Pump.fun',
                score: 9.2
            },
            {
                id: 'trade4',
                tokenName: 'Wifedoge',
                tokenSymbol: 'WIF',
                tokenAddress: '0x1234abcdef1234567890abcdef1234567890abcd',
                entryPrice: 0.00100,
                currentPrice: 0.00187,
                amount: 8500,
                value: 15.90,
                pnl: 7.30,
                pnlPercent: 87.00,
                timestamp: Date.now() - 2 * 60 * 60 * 1000,
                holders: 14326,
                lpStatus: 'Locked',
                tax: '3%/3%',
                source: 'DexScreener',
                score: 8.5
            }
        ];
    }
    
    // Enhance trades with additional properties if they don't exist
    openTrades = openTrades.map(trade => {
        if (!trade.holders) {
            trade.holders = Math.floor(Math.random() * 100000);
        }
        
        if (!trade.lpStatus) {
            trade.lpStatus = Math.random() > 0.2 ? 'Locked' : 'Unlocked';
        }
        
        if (!trade.tax) {
            const buyTax = Math.floor(Math.random() * 15);
            const sellTax = Math.floor(Math.random() * 15);
            trade.tax = `${buyTax}%/${sellTax}%`;
        }
        
        if (!trade.source) {
            const sources = ['DexScreener', 'Birdeye', 'Manual', 'Pump.fun', 'Telegram'];
            trade.source = sources[Math.floor(Math.random() * sources.length)];
        }
        
        if (!trade.score) {
            trade.score = (5 + Math.random() * 5).toFixed(1);
        }
        
        return trade;
    });
    
    // Render in all trade displays
    renderAllTradeDisplays(openTrades);
}

// Render trades in all display areas (dashboard and sniper page)
function renderAllTradeDisplays(trades) {
    // Render in sniper page
    renderOpenTrades(trades);
    
    // Also render in dashboard
    renderDashboardTrades(trades);
    
    // Now also render in pairs page
    renderPairsPageTrades(trades);
    
    // Update total profit displays
    updateProfitDisplays(trades);
}

// Update profit displays in all sections
function updateProfitDisplays(trades) {
    const totalPnl = trades.reduce((total, trade) => total + trade.pnl, 0) || 0;
    
    // Update in sniper page
    const totalProfitElement = document.querySelector('#total-profit');
    if (totalProfitElement) {
        totalProfitElement.textContent = formatCurrency(totalPnl);
        totalProfitElement.className = totalPnl > 0 ? 'positive' : totalPnl < 0 ? 'negative' : 'neutral';
    }
    
    // Update in dashboard
    const dashboardTotalProfitElement = document.querySelector('#dashboard-total-profit');
    if (dashboardTotalProfitElement) {
        dashboardTotalProfitElement.textContent = formatCurrency(totalPnl);
        dashboardTotalProfitElement.className = totalPnl > 0 ? 'positive' : totalPnl < 0 ? 'negative' : 'neutral';
    }
    
    // Update in pairs page
    const pairsTotalProfitElement = document.querySelector('#pairs-total-profit');
    if (pairsTotalProfitElement) {
        pairsTotalProfitElement.textContent = formatCurrency(totalPnl);
        pairsTotalProfitElement.className = totalPnl > 0 ? 'positive' : totalPnl < 0 ? 'negative' : 'neutral';
    }
}

// Render open trades in the sniper page
function renderOpenTrades(trades) {
    // Support for both compact view and table view
    const compactTradesContainer = document.querySelector('.compact-trades-rows');
    const openTradesTable = document.querySelector('#open-trades-table');
    
    // Update counter elements
    const openTradesCountElement = document.querySelector('#open-trades-count');
    if (openTradesCountElement) {
        openTradesCountElement.textContent = trades.length;
    }
    
    // Count profit/loss trades
    const profitTrades = trades.filter(trade => trade.pnl > 0);
    const lossTrades = trades.filter(trade => trade.pnl < 0);
    
    // Update profit/loss counters if they exist
    const profitCountElement = document.querySelector('#profit-count');
    const lossCountElement = document.querySelector('#loss-count');
    
    if (profitCountElement) profitCountElement.textContent = profitTrades.length;
    if (lossCountElement) lossCountElement.textContent = lossTrades.length;
    
    // Render in compact container if it exists
    if (compactTradesContainer) {
        compactTradesContainer.innerHTML = '';
    
    if (trades.length === 0) {
            compactTradesContainer.innerHTML = '<div class="no-trades-message">No active trades. Use the sniper controls to start trading.</div>';
        return;
    }
    
        // Populate the compact trades view
    trades.forEach(trade => {
        const isProfitable = trade.pnl > 0;
        const formattedPnlPercent = (trade.pnlPercent >= 0 ? '+' : '') + trade.pnlPercent.toFixed(2) + '%';
            const timeSince = getTimeSince(trade.timestamp);
            const iconLetter = trade.tokenSymbol.charAt(0);
            
            // Default values for properties that might not exist in all trades
            const holders = trade.holders || '?';
            const lpStatus = trade.lpStatus || 'Unknown';
            const tax = trade.tax || '?/?';
            const source = trade.source || 'Manual';
            const score = trade.score || '-';
            
            const tradeItem = document.createElement('div');
            tradeItem.className = 'compact-trade-item';
            tradeItem.setAttribute('data-trade-id', trade.id);
            tradeItem.setAttribute('data-token-address', trade.tokenAddress);
            
            tradeItem.innerHTML = `
                <div class="trade-cell token-cell">
                    <div class="compact-token-icon">${iconLetter}</div>
                    <span class="compact-token-name">${trade.tokenSymbol}</span>
                </div>
                <div class="trade-cell">${formatCurrency(trade.entryPrice)}</div>
                <div class="trade-cell">${formatCurrency(trade.currentPrice)}</div>
                <div class="trade-cell profit-cell ${isProfitable ? 'positive' : 'negative'}">${formattedPnlPercent}</div>
                <div class="trade-cell">${formatNumber(trade.value / trade.currentPrice)} ${trade.tokenSymbol}</div>
                <div class="trade-cell">${formatNumber(holders)}</div>
                <div class="trade-cell status-cell"><span class="${lpStatus === 'Locked' ? 'positive-status' : 'warning-status'}">${lpStatus}</span></div>
                <div class="trade-cell">${tax}</div>
                <div class="trade-cell">${timeSince}</div>
                <div class="trade-cell score-cell">${score}</div>
                <div class="trade-cell">${source}</div>
                <div class="trade-cell action-cell">
                    <button class="compact-sell-btn" data-action="sell" data-trade-id="${trade.id}" data-token-address="${trade.tokenAddress}">Sell</button>
                </div>
            `;
            
            compactTradesContainer.appendChild(tradeItem);
        });
        
        // Add event listeners to compact sell buttons
        const sellButtons = compactTradesContainer.querySelectorAll('.compact-sell-btn');
        sellButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const tradeId = this.getAttribute('data-trade-id');
                const tokenAddress = this.getAttribute('data-token-address');
                handleTradeAction(action, tradeId, tokenAddress);
            });
        });
    }
    
    // Also populate the open-trades-table if it exists
    if (openTradesTable) {
        openTradesTable.innerHTML = '';
        
        if (trades.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="12" class="no-trades-message">No active trades. Use the sniper controls to start trading.</td>';
            openTradesTable.appendChild(emptyRow);
            return;
        }
        
        trades.forEach(trade => {
            const isProfitable = trade.pnl > 0;
            const formattedPnlPercent = (trade.pnlPercent >= 0 ? '+' : '') + trade.pnlPercent.toFixed(2) + '%';
            const timeSince = getTimeSince(trade.timestamp);
            const iconLetter = trade.tokenSymbol.charAt(0);
            const holders = trade.holders || '?';
            const lpStatus = trade.lpStatus || 'Unknown';
            const tax = trade.tax || '?/?';
            const source = trade.source || 'Manual';
            const score = trade.score || '-';
            
            const row = document.createElement('tr');
            row.setAttribute('data-trade-id', trade.id);
            row.setAttribute('data-token-address', trade.tokenAddress);
            
            row.innerHTML = `
                <td>
                    <div class="token-cell-table">
                        <div class="token-icon-table">${iconLetter}</div>
                        <span>${trade.tokenSymbol}</span>
            </div>
                </td>
                <td>${formatCurrency(trade.entryPrice)}</td>
                <td>${formatCurrency(trade.currentPrice)}</td>
                <td class="${isProfitable ? 'positive' : 'negative'}">${formattedPnlPercent}</td>
                <td>${formatNumber(trade.value / trade.currentPrice)} ${trade.tokenSymbol}</td>
                <td>${formatNumber(holders)}</td>
                <td><span class="${lpStatus === 'Locked' ? 'positive-status' : 'warning-status'}">${lpStatus}</span></td>
                <td>${tax}</td>
                <td>${timeSince}</td>
                <td>${score}</td>
                <td>${source}</td>
                <td>
                    <button class="table-action-btn sell-btn" data-action="sell" data-trade-id="${trade.id}" data-token-address="${trade.tokenAddress}">Sell</button>
                </td>
            `;
            
            openTradesTable.appendChild(row);
        });
        
        // Add event listeners to table action buttons
        const tableActionButtons = openTradesTable.querySelectorAll('.table-action-btn');
        tableActionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const tradeId = this.getAttribute('data-trade-id');
                const tokenAddress = this.getAttribute('data-token-address');
                handleTradeAction(action, tradeId, tokenAddress);
            });
        });
    }
}

// Render trades in the dashboard
function renderDashboardTrades(trades) {
    // Get dashboard trades container
    const tradesListContainer = document.getElementById('dashboard-trades-list');
    const openTradesCountElement = document.getElementById('dashboard-trades-count');
    const dashboardTotalProfitElement = document.getElementById('dashboard-total-profit');
    
    if (!tradesListContainer) return;
    
    // Update trades count
    if (openTradesCountElement) {
        openTradesCountElement.textContent = trades.length;
    }
    
    // Clear container
    tradesListContainer.innerHTML = '';
    
    // Show message if no trades
    if (trades.length === 0) {
        tradesListContainer.innerHTML = '<div class="no-trades-message">No active trades. Use the sniper to get started.</div>';
        return;
    }
    
    // Calculate total PnL for dashboard display
    const totalPnl = trades.reduce((total, trade) => total + trade.pnl, 0) || 0;
    if (dashboardTotalProfitElement) {
        dashboardTotalProfitElement.textContent = formatCurrency(totalPnl);
        dashboardTotalProfitElement.className = totalPnl > 0 ? 'positive' : totalPnl < 0 ? 'negative' : 'neutral';
    }
    
    // Create table with improved layout
    const tableElement = document.createElement('table');
    tableElement.id = 'dashboard-trades-table';
    tableElement.className = 'trades-table';
    
    // Create table header with the most important columns
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th>TOKEN</th>
            <th>ENTRY</th>
            <th>CURRENT</th>
            <th>PROFIT</th>
            <th>SPENT</th>
            <th>HOLDERS</th>
            <th>LP STATUS</th>
            <th>TAX</th>
            <th>TIME</th>
            <th>SCORE</th>
            <th>SOURCE</th>
            <th>ACTIONS</th>
        </tr>
    `;
    tableElement.appendChild(tableHeader);
    
    // Create table body
    const tableBody = document.createElement('tbody');
    
    // Populate trades
    trades.forEach(trade => {
        const isProfitable = trade.pnl > 0;
        const formattedPnlPercent = (trade.pnlPercent >= 0 ? '+' : '') + trade.pnlPercent.toFixed(2) + '%';
        const timeSince = getTimeSince(trade.timestamp);
        
        // Default values for properties that might not exist in all trades
        const holders = trade.holders || '?';
        const lpStatus = trade.lpStatus || 'Unknown';
        const tax = trade.tax || '?/?';
        const source = trade.source || 'Manual';
        const score = trade.score || '-';
        
        const row = document.createElement('tr');
        row.setAttribute('data-trade-id', trade.id);
        row.setAttribute('data-token-address', trade.tokenAddress);
        
        row.innerHTML = `
            <td class="token-cell">
                <div class="token-info">
                    <div class="token-initial">${trade.tokenSymbol.charAt(0)}</div>
                    <div class="token-symbol">${trade.tokenSymbol}</div>
                </div>
            </td>
            <td>${formatCurrency(trade.entryPrice)}</td>
            <td>${formatCurrency(trade.currentPrice)}</td>
            <td class="${isProfitable ? 'positive' : 'negative'}">${formattedPnlPercent}</td>
            <td>${formatNumber(trade.value / trade.currentPrice)} ${trade.tokenSymbol}</td>
            <td>${formatNumber(holders)}</td>
            <td><span class="${lpStatus === 'Locked' ? 'positive-status' : 'warning-status'}">${lpStatus}</span></td>
            <td>${tax}</td>
            <td>${timeSince}</td>
            <td>${score}</td>
            <td>${source}</td>
            <td>
                <button class="sell-btn" data-action="sell" data-trade-id="${trade.id}" data-token-address="${trade.tokenAddress}">Sell</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    tableElement.appendChild(tableBody);
    tradesListContainer.appendChild(tableElement);
    
    // Add event listeners to sell buttons
    const sellButtons = tradesListContainer.querySelectorAll('.sell-btn');
    sellButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const tradeId = this.getAttribute('data-trade-id');
            const tokenAddress = this.getAttribute('data-token-address');
            handleTradeAction(action, tradeId, tokenAddress);
        });
    });
    
    // Add dashboard-specific styles with improved readability
    if (!document.getElementById('dashboard-trades-table-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'dashboard-trades-table-styles';
        styleSheet.innerHTML = `
            #dashboard-trades-list {
                width: 100%;
                overflow-y: auto;
                max-height: 450px; /* Increased height for better visibility */
            }
            
            #dashboard-trades-table {
                width: 100%;
                min-width: 1200px; /* Allow horizontal scrolling while ensuring table is wide enough */
                border-collapse: collapse;
                font-size: 11px; /* Smaller font size to fit everything */
                table-layout: fixed;
                background: rgba(20, 25, 35, 0.8);
            }
            
            #dashboard-trades-table th, 
            #dashboard-trades-table td {
                padding: 10px 8px;
                text-align: left;
                border-bottom: 1px solid rgba(80, 90, 120, 0.4);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #dashboard-trades-table th {
                background-color: rgba(10, 15, 25, 1);
                color: #fff;
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 12px 8px;
                border-bottom: 2px solid rgba(100, 110, 140, 0.5);
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            #dashboard-trades-table tr:hover {
                background-color: rgba(60, 65, 80, 0.7);
            }
            
            #dashboard-trades-table .token-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            #dashboard-trades-table .token-initial {
                background: linear-gradient(135deg, #2979ff, #00bcd4);
                border-radius: 50%;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                height: 24px;
                width: 24px;
                flex-shrink: 0;
            }
            
            #dashboard-trades-table .token-symbol {
                font-weight: bold;
                font-size: 12px;
            }
            
            #dashboard-trades-table .positive {
                color: #69f0ae;
                font-weight: bold;
                font-size: 12px;
            }
            
            #dashboard-trades-table .negative {
                color: #ff5252;
                font-weight: bold;
                font-size: 12px;
            }
            
            #dashboard-trades-table .positive-status {
                color: #69f0ae;
            }
            
            #dashboard-trades-table .warning-status {
                color: #ffb74d;
            }
            
            #dashboard-trades-table .sell-btn {
                background: linear-gradient(to right, #ff4081, #ff5252);
                border: none;
                border-radius: 4px;
                color: #fff;
                cursor: pointer;
                font-size: 11px;
                font-weight: bold;
                padding: 6px 12px;
                white-space: nowrap;
                display: block;
                width: 90%;
                margin: 0 auto;
                text-align: center;
            }
            
            /* Set fixed column widths to match sniper menu */
            #dashboard-trades-table th:nth-child(1), #dashboard-trades-table td:nth-child(1) { width: 100px; }
            #dashboard-trades-table th:nth-child(2), #dashboard-trades-table td:nth-child(2) { width: 100px; }
            #dashboard-trades-table th:nth-child(3), #dashboard-trades-table td:nth-child(3) { width: 100px; }
            #dashboard-trades-table th:nth-child(4), #dashboard-trades-table td:nth-child(4) { width: 80px; }
            #dashboard-trades-table th:nth-child(5), #dashboard-trades-table td:nth-child(5) { width: 120px; }
            #dashboard-trades-table th:nth-child(6), #dashboard-trades-table td:nth-child(6) { width: 90px; }
            #dashboard-trades-table th:nth-child(7), #dashboard-trades-table td:nth-child(7) { width: 90px; }
            #dashboard-trades-table th:nth-child(8), #dashboard-trades-table td:nth-child(8) { width: 80px; }
            #dashboard-trades-table th:nth-child(9), #dashboard-trades-table td:nth-child(9) { width: 80px; }
            #dashboard-trades-table th:nth-child(10), #dashboard-trades-table td:nth-child(10) { width: 70px; }
            #dashboard-trades-table th:nth-child(11), #dashboard-trades-table td:nth-child(11) { width: 100px; }
            #dashboard-trades-table th:nth-child(12), #dashboard-trades-table td:nth-child(12) { width: 80px; }
            
            /* Add alternating row colors */
            #dashboard-trades-table tbody tr:nth-child(even) {
                background-color: rgba(30, 35, 45, 0.9);
            }
            
            /* Make sure sell button is always visible */
            #dashboard-trades-table td:last-child {
                text-align: center;
            }
            
            /* Add subtle box-shadow to create visual separation */
            .dashboard-trades-list-wrapper {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                border-radius: 4px;
                overflow: auto;
            }
            
            /* Scrollbar styling for better visibility */
            #dashboard-trades-list::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            #dashboard-trades-list::-webkit-scrollbar-track {
                background: rgba(20, 25, 35, 0.5);
                border-radius: 4px;
            }
            
            #dashboard-trades-list::-webkit-scrollbar-thumb {
                background: rgba(100, 110, 140, 0.5);
                border-radius: 4px;
            }
            
            #dashboard-trades-list::-webkit-scrollbar-thumb:hover {
                background: rgba(100, 110, 140, 0.7);
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// Helper function to calculate time since trade
function getTimeSince(timestamp) {
    const now = new Date();
    const tradeTime = new Date(timestamp);
    const diff = now - tradeTime;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
}

// Update total PnL in UI
function updateTotalPnl(trades) {
    const totalPnl = trades.reduce((total, trade) => total + trade.pnl, 0);
    const pnlDisplay = document.querySelector('.trades-pnl');
    if (pnlDisplay) {
        pnlDisplay.textContent = formatCurrency(totalPnl);
        pnlDisplay.className = `trades-pnl${totalPnl < 0 ? ' negative' : ''}`;
    }
}

// Update dashboard statistics
function updateDashboardStats(trades = []) {
    // Try to get wallet balance from SniperApp
    let walletBalance = 0;
    if (window.SniperApp && window.SniperApp.walletBalance) {
        walletBalance = window.SniperApp.walletBalance;
    } else {
        walletBalance = 2500.00; // Example value
    }
    
    // Calculate stats from trades
    const openTradesCount = trades.length || 0;
    const totalPnl = trades.reduce((total, trade) => total + trade.pnl, 0) || 0;
    
    // Try to get daily volume from SniperApp
    let dailyVolume = 0;
    if (window.SniperApp && window.SniperApp.dailyVolume) {
        dailyVolume = window.SniperApp.dailyVolume;
    } else {
        dailyVolume = 1250.75; // Example value
    }
    
    // Update stats in the UI
    const walletBalanceElement = document.querySelector('#wallet-balance');
    if (walletBalanceElement) {
        walletBalanceElement.textContent = formatCurrency(walletBalance);
    }
    
    const openTradesElement = document.querySelector('#open-trades');
    if (openTradesElement) {
        openTradesElement.textContent = openTradesCount;
    }
    
    const totalPnlElement = document.querySelector('#total-pnl');
    if (totalPnlElement) {
        totalPnlElement.textContent = formatCurrency(totalPnl);
        totalPnlElement.className = 'stat-value' + (totalPnl < 0 ? ' negative' : '');
    }
    
    const dailyVolumeElement = document.querySelector('#daily-volume');
    if (dailyVolumeElement) {
        dailyVolumeElement.textContent = formatCurrency(dailyVolume);
    }
}

// Handle trade actions (Details, Take Profit, Sell)
function handleTradeAction(action, tradeId, tokenAddress) {
    console.log(`Action ${action} for trade ${tradeId} (${tokenAddress})`);
    
    // If SniperApp is available, delegate to its methods
    if (window.SniperApp) {
        switch (action) {
            case 'info':
                window.SniperApp.showTokenInfo(tokenAddress);
                break;
            case 'take-profit':
                window.SniperApp.takeProfit(tokenAddress);
                break;
            case 'sell':
                window.SniperApp.sellToken(tokenAddress);
                break;
        }
        return;
    }
    
    // Otherwise, handle locally
    switch (action) {
        case 'info':
            showTradeDetails(tradeId, tokenAddress);
            break;
        case 'take-profit':
            takeProfitForTrade(tradeId, tokenAddress);
            break;
        case 'sell':
            sellTrade(tradeId, tokenAddress);
            break;
    }
}

// Take profits for all profitable trades
function takeAllProfits() {
    // Get all profitable trades
    let profitableTrades = [];
    
    if (window.SniperApp && window.SniperApp.activeTrades) {
        profitableTrades = window.SniperApp.activeTrades.filter(trade => trade.pnl > 0);
        
        if (profitableTrades.length === 0) {
            showNotification('No profitable trades to take profit from', 'info');
            return;
        }
        
        // Use SniperApp method if available
        if (window.SniperApp.takeAllProfits) {
            window.SniperApp.takeAllProfits();
            return;
        }
        
        // Otherwise iterate through trades
        profitableTrades.forEach(trade => {
            window.SniperApp.takeProfit(trade.tokenAddress);
        });
        
        showNotification(`Taking profit from ${profitableTrades.length} trades`, 'success');
        return;
    }
    
    // Handle locally if SniperApp not available
    // Check both legacy and new UI
    const legacyTradeElements = document.querySelectorAll('.trade-card:not(.negative)');
    const newTradeElements = document.querySelectorAll('.compact-trade-item .profit-cell.positive');
    const tableTradeElements = document.querySelectorAll('#open-trades-table td.positive');
    
    // Collect all profitable trades from all UI elements
    let allProfitableTradeElements = [];
    
    // Add legacy UI elements
    legacyTradeElements.forEach(element => {
        const tradeId = element.getAttribute('data-trade-id');
        const tokenAddress = element.getAttribute('data-token-address');
        
        allProfitableTradeElements.push({
            element: element,
            id: tradeId,
            tokenAddress: tokenAddress,
            ui: 'legacy'
        });
    });
    
    // Add new UI elements
    newTradeElements.forEach(element => {
        const tradeItem = element.closest('.compact-trade-item');
        if (tradeItem) {
            const tradeId = tradeItem.getAttribute('data-trade-id');
            const tokenAddress = tradeItem.getAttribute('data-token-address');
            
            allProfitableTradeElements.push({
                element: tradeItem,
                id: tradeId,
                tokenAddress: tokenAddress,
                ui: 'compact'
            });
        }
    });
    
    // Add table UI elements
    tableTradeElements.forEach(element => {
        const row = element.closest('tr');
        if (row) {
            const tradeId = row.getAttribute('data-trade-id');
            const tokenAddress = row.getAttribute('data-token-address');
            
            allProfitableTradeElements.push({
                element: row,
                id: tradeId,
                tokenAddress: tokenAddress,
                ui: 'table'
            });
        }
    });
    
    // Remove duplicates (same trade might appear in multiple UIs)
    const uniqueTrades = [];
    const tradeIds = new Set();
    
    allProfitableTradeElements.forEach(trade => {
        if (!tradeIds.has(trade.id)) {
            tradeIds.add(trade.id);
            uniqueTrades.push(trade);
        }
    });
    
    profitableTrades = uniqueTrades;
    
    if (profitableTrades.length === 0) {
        showNotification('No profitable trades to take profit from', 'info');
        return;
    }
    
    // Take profits for all profitable trades
    profitableTrades.forEach(trade => {
        takeProfitForTrade(trade.id, trade.tokenAddress);
    });
    
    showNotification(`Taking profit from ${profitableTrades.length} trades`, 'success');
}

// Take profit for a specific trade
function takeProfitForTrade(tradeId, tokenAddress) {
    console.log(`Taking profit for trade ${tradeId} (${tokenAddress})`);
    
    // For demo purposes, remove the trade from UI after a short delay
    setTimeout(() => {
        // Find the trade in all possible UI elements
        const legacyTradeElement = document.querySelector(`.trade-card[data-trade-id="${tradeId}"]`);
        const compactTradeElement = document.querySelector(`.compact-trade-item[data-trade-id="${tradeId}"]`);
        const tableTradeElement = document.querySelector(`#open-trades-table tr[data-trade-id="${tradeId}"]`);
        
        // Add fade-out animation to all found elements
        if (legacyTradeElement) {
            legacyTradeElement.classList.add('fade-out');
            setTimeout(() => {
                legacyTradeElement.remove();
                
                // Check if there are no more trades in legacy UI
                const remainingLegacyTrades = document.querySelectorAll('.trade-card');
                if (remainingLegacyTrades.length === 0) {
                    const legacyTradesContainer = document.querySelector('.active-trades-container');
                    if (legacyTradesContainer) {
                        legacyTradesContainer.innerHTML = '<div class="no-trades-message">No active trades at the moment</div>';
                    }
                }
            }, 300);
        }
        
        if (compactTradeElement) {
            compactTradeElement.classList.add('fade-out');
            setTimeout(() => {
                compactTradeElement.remove();
                
                // Check if there are no more trades in new UI
                const remainingCompactTrades = document.querySelectorAll('.compact-trade-item');
                if (remainingCompactTrades.length === 0) {
                    const compactTradesContainer = document.querySelector('.compact-trades-rows');
                    if (compactTradesContainer) {
                        compactTradesContainer.innerHTML = '<div class="no-trades-message">No active trades at the moment</div>';
                    }
                }
            }, 300);
        }
        
        if (tableTradeElement) {
            tableTradeElement.classList.add('fade-out');
            setTimeout(() => {
                tableTradeElement.remove();
                
                // Check if there are no more trades in table UI
                const remainingTableTrades = document.querySelectorAll('#open-trades-table tr');
                if (remainingTableTrades.length === 0) {
                    const openTradesTable = document.querySelector('#open-trades-table');
                    if (openTradesTable) {
                        const noTradesRow = document.createElement('tr');
                        noTradesRow.innerHTML = '<td colspan="12" class="no-trades-message">No active trades at the moment</td>';
                        openTradesTable.appendChild(noTradesRow);
                    }
                }
            }, 300);
        }
        
        // Update counters and stats after removing trades
        updateTradeCounters();
        updateDashboardStats();
        
        showNotification(`Profit taken for ${tradeId}`, 'success');
    }, 500);
}

// Sell a specific trade
function sellTrade(tradeId, tokenAddress) {
    console.log(`Selling trade ${tradeId} (${tokenAddress})`);
    
    // For demo purposes, remove the trade from UI after a short delay
    setTimeout(() => {
        // Find the trade in all possible UI elements
        const legacyTradeElement = document.querySelector(`.trade-card[data-trade-id="${tradeId}"]`);
        const compactTradeElement = document.querySelector(`.compact-trade-item[data-trade-id="${tradeId}"]`);
        const tableTradeElement = document.querySelector(`#open-trades-table tr[data-trade-id="${tradeId}"]`);
        
        // Add fade-out animation to all found elements
        if (legacyTradeElement) {
            legacyTradeElement.classList.add('fade-out');
            setTimeout(() => {
                legacyTradeElement.remove();
                
                // Check if there are no more trades in legacy UI
                const remainingLegacyTrades = document.querySelectorAll('.trade-card');
                if (remainingLegacyTrades.length === 0) {
                    const legacyTradesContainer = document.querySelector('.active-trades-container');
                    if (legacyTradesContainer) {
                        legacyTradesContainer.innerHTML = '<div class="no-trades-message">No active trades at the moment</div>';
                    }
                }
            }, 300);
        }
        
        if (compactTradeElement) {
            compactTradeElement.classList.add('fade-out');
            setTimeout(() => {
                compactTradeElement.remove();
                
                // Check if there are no more trades in new UI
                const remainingCompactTrades = document.querySelectorAll('.compact-trade-item');
                if (remainingCompactTrades.length === 0) {
                    const compactTradesContainer = document.querySelector('.compact-trades-rows');
                    if (compactTradesContainer) {
                        compactTradesContainer.innerHTML = '<div class="no-trades-message">No active trades at the moment</div>';
                    }
                }
            }, 300);
        }
        
        if (tableTradeElement) {
            tableTradeElement.classList.add('fade-out');
            setTimeout(() => {
                tableTradeElement.remove();
                
                // Check if there are no more trades in table UI
                const remainingTableTrades = document.querySelectorAll('#open-trades-table tr');
                if (remainingTableTrades.length === 0) {
                    const openTradesTable = document.querySelector('#open-trades-table');
                    if (openTradesTable) {
                        const noTradesRow = document.createElement('tr');
                        noTradesRow.innerHTML = '<td colspan="12" class="no-trades-message">No active trades at the moment</td>';
                        openTradesTable.appendChild(noTradesRow);
                    }
                }
            }, 300);
        }
        
        // Update counters and stats after removing trades
        updateTradeCounters();
        updateDashboardStats();
        
        showNotification(`Trade ${tradeId} sold`, 'info');
    }, 500);
}

// Update trade counters after trade actions
function updateTradeCounters() {
    // Count different types of trades in the UI
    const legacyTrades = document.querySelectorAll('.trade-card');
    const compactTrades = document.querySelectorAll('.compact-trade-item');
    const tableTrades = document.querySelectorAll('#open-trades-table tr[data-trade-id]');
    
    // Use the longest array of trades to determine count
    const tradeCount = Math.max(
        legacyTrades.length,
        compactTrades.length,
        tableTrades.length
    );
    
    // Update counter elements
    const openTradesCountElement = document.querySelector('#open-trades-count');
    if (openTradesCountElement) {
        openTradesCountElement.textContent = tradeCount;
    }
    
    const openTradesElement = document.querySelector('#open-trades');
    if (openTradesElement) {
        openTradesElement.textContent = tradeCount;
    }
    
    // Count profit/loss trades
    const profitTrades = document.querySelectorAll('.profit-cell.positive');
    const lossTrades = document.querySelectorAll('.profit-cell.negative');
    
    const profitCountElement = document.querySelector('#profit-count');
    if (profitCountElement) {
        profitCountElement.textContent = profitTrades.length;
    }
    
    const lossCountElement = document.querySelector('#loss-count');
    if (lossCountElement) {
        lossCountElement.textContent = lossTrades.length;
    }
}

// Show details for a specific trade
function showTradeDetails(tradeId, tokenAddress) {
    console.log(`Showing details for trade ${tradeId} (${tokenAddress})`);
    showNotification(`Viewing details for ${tradeId}`, 'info');
    
    // In a real app, this would open a modal with detailed trade information
}

// Display a notification to the user
function showNotification(message, type = 'info') {
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    notificationContainer.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Create the open trades section in the dashboard
function createOpenTradesSectionInDashboard() {
    // Create the trades container
    const tradesContainer = document.createElement('div');
    tradesContainer.className = 'dashboard-trades-container';
    tradesContainer.innerHTML = `
        <div class="dashboard-trades-header">
            <h3>Active Trades</h3>
            <div class="dashboard-trades-stats">
                <div class="stat-item">
                    <span class="stat-label">Total:</span>
                    <span class="stat-value" id="dashboard-trades-count">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Profit:</span>
                    <span class="stat-value" id="dashboard-total-profit">$0.00</span>
                </div>
                <div class="stat-item">
                    <button class="take-all-profits-btn" id="dashboard-take-all-profits">Take All Profits</button>
                </div>
            </div>
        </div>
        <div class="dashboard-trades-filter">
            <div class="filter-item">
                <label>Sort by:</label>
                <select id="dashboard-trades-sort">
                    <option value="newest">Newest</option>
                    <option value="profit">Highest Profit</option>
                    <option value="loss">Highest Loss</option>
                </select>
            </div>
            <div class="filter-item">
                <button class="refresh-trades-btn" id="dashboard-refresh-trades">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>
        <div class="dashboard-trades-list-wrapper">
            <div class="dashboard-trades-list" id="dashboard-trades-list"></div>
        </div>
    `;
    
    // Insert into the dashboard
    const dashboardSection = document.querySelector('.dashboard-section');
    if (dashboardSection) {
        dashboardSection.appendChild(tradesContainer);
    }

    // Add event listeners for trade controls
    document.getElementById('dashboard-take-all-profits').addEventListener('click', () => {
        SniperApp.emit('takeAllProfits');
    });
    
    document.getElementById('dashboard-refresh-trades').addEventListener('click', () => {
        fetchOpenTrades();
    });
    
    document.getElementById('dashboard-trades-sort').addEventListener('change', (e) => {
        const sortBy = e.target.value;
        const tradesList = document.getElementById('dashboard-trades-table').querySelectorAll('tbody tr');
        const tradesArray = Array.from(tradesList);
        
        tradesArray.sort((a, b) => {
            if (sortBy === 'profit') {
                const aProfitText = a.querySelector('td:nth-child(4)').textContent;
                const bProfitText = b.querySelector('td:nth-child(4)').textContent;
                const aProfit = parseFloat(aProfitText.replace(/[+%]/g, ''));
                const bProfit = parseFloat(bProfitText.replace(/[+%]/g, ''));
                return bProfit - aProfit;
            }
            if (sortBy === 'loss') {
                const aProfitText = a.querySelector('td:nth-child(4)').textContent;
                const bProfitText = b.querySelector('td:nth-child(4)').textContent;
                const aProfit = parseFloat(aProfitText.replace(/[+%]/g, ''));
                const bProfit = parseFloat(bProfitText.replace(/[+%]/g, ''));
                return aProfit - bProfit;
            }
            
            // Default sort by newest
            const aTimeCell = a.querySelector('td:nth-child(9)');
            const bTimeCell = b.querySelector('td:nth-child(9)');
            return convertTimeStringToMinutes(bTimeCell.textContent) - convertTimeStringToMinutes(aTimeCell.textContent);
        });
        
        const tableBody = document.getElementById('dashboard-trades-table').querySelector('tbody');
        tradesArray.forEach(row => tableBody.appendChild(row));
    });
    
    // Add styles if they don't exist
    if (!document.getElementById('dashboard-trades-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'dashboard-trades-styles';
        styleSheet.innerHTML = `
            .dashboard-trades-container {
                background: rgba(20, 25, 35, 0.9);
                border-radius: 8px;
                margin: 5px 0 10px 0;
                padding: 10px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(80, 90, 120, 0.3);
                width: 100%;
                height: calc(100vh - 180px);
                display: flex;
                flex-direction: column;
            }
            
            .dashboard-trades-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .dashboard-trades-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #fff;
            }
            
            .dashboard-trades-stats {
                display: flex;
                gap: 12px;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .take-all-profits-btn {
                background: linear-gradient(to right, #00c853, #69f0ae);
                border: none;
                border-radius: 4px;
                color: #111;
                cursor: pointer;
                font-weight: bold;
                padding: 5px 10px;
            }
            
            .dashboard-trades-filter {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            
            .filter-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            #dashboard-trades-sort {
                background: rgba(40, 45, 60, 0.6);
                border: 1px solid rgba(80, 90, 120, 0.3);
                border-radius: 4px;
                color: #fff;
                padding: 4px 8px;
            }
            
            .refresh-trades-btn {
                background: rgba(40, 45, 60, 0.6);
                border: 1px solid rgba(80, 90, 120, 0.3);
                border-radius: 4px;
                color: #fff;
                cursor: pointer;
                padding: 4px 8px;
            }
            
            .dashboard-trades-list-wrapper {
                flex: 1;
                overflow: auto;
                width: 100%;
                position: relative;
            }
            
            .no-trades-message {
                padding: 15px;
                text-align: center;
                color: rgba(200, 200, 200, 0.7);
            }
            
            /* Scrollbar styling */
            .dashboard-trades-list-wrapper::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            .dashboard-trades-list-wrapper::-webkit-scrollbar-track {
                background: rgba(20, 25, 35, 0.5);
                border-radius: 4px;
            }
            
            .dashboard-trades-list-wrapper::-webkit-scrollbar-thumb {
                background: rgba(100, 110, 140, 0.5);
                border-radius: 4px;
            }
            
            .dashboard-trades-list-wrapper::-webkit-scrollbar-thumb:hover {
                background: rgba(100, 110, 140, 0.7);
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// Render trades in the pairs page - similar to the sniper page trades
function renderPairsPageTrades(trades) {
    // Get pairs page trades container
    const pairsTradesContainer = document.querySelector('#pairs-page .compact-trades-rows');
    const pairsTradesCountElement = document.querySelector('#pairs-page .trades-count');
    
    if (!pairsTradesContainer) return;
    
    // Update trades count if element exists
    if (pairsTradesCountElement) {
        pairsTradesCountElement.textContent = trades.length;
    }
    
    // Clear the container
    pairsTradesContainer.innerHTML = '';
    
    // Show message if no trades
    if (trades.length === 0) {
        pairsTradesContainer.innerHTML = '<div class="no-trades-message">No active trades. Use the sniper controls to start trading.</div>';
        return;
    }
    
    // Populate the compact trades view
    trades.forEach(trade => {
        const isProfitable = trade.pnl > 0;
        const formattedPnlPercent = (trade.pnlPercent >= 0 ? '+' : '') + trade.pnlPercent.toFixed(2) + '%';
        const timeSince = getTimeSince(trade.timestamp);
        const iconLetter = trade.tokenSymbol.charAt(0);
        
        // Default values for properties that might not exist in all trades
        const holders = trade.holders || '?';
        const lpStatus = trade.lpStatus || 'Unknown';
        const tax = trade.tax || '?/?';
        const source = trade.source || 'Manual';
        const score = trade.score || '-';
        
        const tradeItem = document.createElement('div');
        tradeItem.className = 'compact-trade-item';
        tradeItem.setAttribute('data-trade-id', trade.id);
        tradeItem.setAttribute('data-token-address', trade.tokenAddress);
        
        tradeItem.innerHTML = `
            <div class="trade-cell token-cell">
                <div class="compact-token-icon">${iconLetter}</div>
                <span class="compact-token-name">${trade.tokenSymbol}</span>
            </div>
            <div class="trade-cell">${formatCurrency(trade.entryPrice)}</div>
            <div class="trade-cell">${formatCurrency(trade.currentPrice)}</div>
            <div class="trade-cell profit-cell ${isProfitable ? 'positive' : 'negative'}">${formattedPnlPercent}</div>
            <div class="trade-cell">${formatNumber(trade.value / trade.currentPrice)} ${trade.tokenSymbol}</div>
            <div class="trade-cell">${formatNumber(holders)}</div>
            <div class="trade-cell status-cell"><span class="${lpStatus === 'Locked' ? 'positive-status' : 'warning-status'}">${lpStatus}</span></div>
            <div class="trade-cell">${tax}</div>
            <div class="trade-cell">${timeSince}</div>
            <div class="trade-cell score-cell">${score}</div>
            <div class="trade-cell">${source}</div>
            <div class="trade-cell action-cell">
                <button class="compact-sell-btn" data-action="sell" data-trade-id="${trade.id}" data-token-address="${trade.tokenAddress}">Sell</button>
            </div>
        `;
        
        pairsTradesContainer.appendChild(tradeItem);
    });
    
    // Add event listeners to compact sell buttons
    const sellButtons = pairsTradesContainer.querySelectorAll('.compact-sell-btn');
    sellButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const tradeId = this.getAttribute('data-trade-id');
            const tokenAddress = this.getAttribute('data-token-address');
            handleTradeAction(action, tradeId, tokenAddress);
        });
    });
} 