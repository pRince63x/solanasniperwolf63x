/*jshint esversion: 11 */
/*global Chart */

// Wolf63x Solana Sniper Bot - Frontend JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the application
    const app = new SniperApp();
    await app.initialize();
});

class SniperApp {
    constructor() {
        this.isConnected = false;
        this.walletAddress = null;
        this.balance = 0;
        this.solPrice = 0;
        this.activeTab = 'dashboard';
        this.activeTrades = [];
        this.opportunities = [];
        this.scannerActive = false;
        this.scanInterval = null;
        this.chartInstance = null;
        this.themeColor = 'green';
        this.botActive = false;
        this.ui = null; // Add ui property
        
        // API endpoints
        this.apiBaseUrl = '/api';
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    async initialize() {
        try {
            // Get SOL price
            await this.fetchSolPrice();
            
            // Initialize UI components
            this.initializeDashboard();
            this.initializeTheme();
            this.initializeBotToggle();
            this.ui = new SniperUI(this); // Instantiate SniperUI
            
            // Check if wallet is already connected (e.g. from localStorage)
            const savedWallet = localStorage.getItem('connectedWallet');
            if (savedWallet) {
                const walletData = JSON.parse(savedWallet);
                await this.connectWallet(walletData.type, true);
            }
            
            console.log('Wolf63x Solana Sniper Bot initialized');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Error initializing application', 'error');
        }
    }
    
    initEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('href').substring(1);
                this.navigateTo(page);
            });
        });
        
        // Bot status toggle
        const botToggle = document.getElementById('bot-status-toggle');
        if (botToggle) {
            botToggle.addEventListener('change', (e) => {
                this.toggleBotStatus(e.target.checked);
            });
        }
        
        // Theme switching
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize theme from localStorage or default to green
            const savedTheme = localStorage.getItem('theme') || 'green';
            document.body.className = savedTheme + '-theme';
            
            // Update active state on theme switchers
            document.querySelectorAll('.theme-switcher').forEach(switcher => {
                switcher.classList.remove('active');
                if (switcher.id === savedTheme + '-theme') {
                    switcher.classList.add('active');
                    switcher.querySelector('.face').classList.add('happy');
                } else {
                    switcher.querySelector('.face').classList.remove('happy');
                }
            });
            
            // Add event listeners to theme switchers
            document.querySelectorAll('.theme-switcher').forEach(switcher => {
                switcher.addEventListener('click', function() {
                    const themeId = this.id;
                    const themeName = themeId.replace('-theme', '');
                    
                    // Save theme to localStorage
                    localStorage.setItem('theme', themeName);
                    
                    // Update body class
                    document.body.className = themeName + '-theme';
                    
                    // Update active state
                    document.querySelectorAll('.theme-switcher').forEach(s => {
                        s.classList.remove('active');
                        s.querySelector('.face').classList.remove('happy');
                    });
                    this.classList.add('active');
                    this.querySelector('.face').classList.add('happy');
                    
                    // Add a flash effect to show theme change
                    const flash = document.createElement('div');
                    flash.className = 'theme-flash';
                    document.body.appendChild(flash);
                    
                    setTimeout(() => {
                        flash.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(flash);
                        }, 300);
                    }, 50);
                });
            });
        });
        
        // Wallet connection
        document.getElementById('connect-wallet-btn').addEventListener('click', () => {
            this.toggleWalletModal();
        });
        
        // Wallet options
        document.querySelectorAll('.wallet-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                const walletType = e.currentTarget.getAttribute('data-wallet');
                await this.connectWallet(walletType);
                this.toggleWalletModal(false);
            });
        });
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Sniper settings
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Filter settings
        document.getElementById('save-filters')?.addEventListener('click', () => {
            this.saveFilters();
        });
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });
        
        // Scanner controls
        document.getElementById('start-scanner')?.addEventListener('click', () => {
            this.startScanner();
        });
        
        document.getElementById('stop-scanner')?.addEventListener('click', () => {
            this.stopScanner();
        });
        
        // Take all profits button
        document.getElementById('take-all-profits')?.addEventListener('click', () => {
            this.takeAllProfits();
        });
        
        // Search, filter, and sort for trades
        document.getElementById('trades-search')?.addEventListener('input', (e) => {
            this.filterTrades(e.target.value);
        });
        
        document.getElementById('trades-filter')?.addEventListener('change', (e) => {
            this.filterTradesByStatus(e.target.value);
        });
        
        document.getElementById('trades-sort')?.addEventListener('change', (e) => {
            this.sortTrades(e.target.value);
        });
    }
    
    // Initialize Bot Toggle
    initializeBotToggle() {
        // Check if bot status was saved in localStorage
        const savedStatus = localStorage.getItem('botStatus');
        if (savedStatus === 'active') {
            this.botActive = true;
            const botToggle = document.getElementById('bot-status-toggle');
            if (botToggle) {
                botToggle.checked = true;
                document.getElementById('bot-status-text').textContent = 'ON';
                document.getElementById('bot-status-text').style.color = 'var(--toggle-active)';
            }
        }
    }
    
    // Toggle Bot Status
    toggleBotStatus(isActive) {
        this.botActive = isActive;
        
        // Update UI
        const statusText = document.getElementById('bot-status-text');
        if (statusText) {
            statusText.textContent = isActive ? 'ON' : 'OFF';
            statusText.style.color = isActive ? 'var(--toggle-active)' : 'var(--text-secondary)';
        }
        
        // Save status to localStorage
        localStorage.setItem('botStatus', isActive ? 'active' : 'inactive');
        
        // Show notification
        this.showNotification(`Bot is now ${isActive ? 'active' : 'inactive'}`, isActive ? 'success' : 'info');
        
        // If active, start the bot operations
        if (isActive) {
            console.log('Starting bot operations...');
            // Add your bot start logic here
        } else {
            console.log('Stopping bot operations...');
            // Add your bot stop logic here
        }
    }
    
    // Navigation
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page, .app-page').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });
        
        // Show selected page
        const selectedPage = document.getElementById(page + '-page');
        if (selectedPage) {
            selectedPage.classList.add('active');
            selectedPage.style.display = 'block';
        }
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
        }
            
            // Special page initializations
            if (page === 'dashboard') {
                this.updateDashboard();
            } else if (page === 'sniper') {
                this.updateSniperPage();
            }
            
            this.activeTab = page;
        }
    }
    
    // Theme management
    setTheme(theme) {
        document.body.className = `theme-${theme}`;
        document.querySelectorAll('.theme-switcher').forEach(switcher => {
            switcher.classList.remove('active');
            switcher.querySelector('.face').classList.remove('happy');
        });
        
        const activeSwitcher = document.querySelector(`.${theme}-theme`);
        if (activeSwitcher) {
            activeSwitcher.classList.add('active');
            activeSwitcher.querySelector('.face').classList.add('happy');
        }
        
        this.themeColor = theme;
        localStorage.setItem('theme', theme);
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'green';
        this.setTheme(savedTheme);
    }
    
    // Wallet connection
    async connectWallet(walletType, silent = false) {
        try {
            if (!silent) {
                this.showNotification(`Connecting to ${walletType} wallet...`, 'info');
            }
            
            // Call the API to connect wallet
            const response = await fetch(`${this.apiBaseUrl}/wallet/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ wallet_type: walletType })
            });
            
            if (!response.ok) {
                throw new Error('Failed to connect wallet');
            }
            
            const data = await response.json();
            
            // Update wallet state
            this.isConnected = true;
            this.walletAddress = data.address;
            this.balance = data.balance;
            
            // Save to localStorage
            localStorage.setItem('connectedWallet', JSON.stringify({
                type: walletType,
                address: data.address
            }));
            
            // Update UI
            this.updateWalletUI();
            
            if (!silent) {
                this.showNotification('Wallet connected successfully', 'success');
            }
            
            // Fetch active trades and opportunities
            this.fetchActiveTrades();
            this.fetchOpportunities();
            
            return true;
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showNotification('Failed to connect wallet', 'error');
            return false;
        }
    }
    
    async disconnectWallet() {
        try {
            // Call the API to disconnect wallet
            const response = await fetch(`${this.apiBaseUrl}/wallet/disconnect`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to disconnect wallet');
            }
            
            // Update wallet state
            this.isConnected = false;
            this.walletAddress = null;
            this.balance = 0;
            
            // Remove from localStorage
            localStorage.removeItem('connectedWallet');
            
            // Update UI
            this.updateWalletUI();
            
            this.showNotification('Wallet disconnected', 'info');
            
            return true;
        } catch (error) {
            console.error('Wallet disconnection error:', error);
            this.showNotification('Failed to disconnect wallet', 'error');
            return false;
        }
    }
    
    updateWalletUI() {
        const statusElement = document.getElementById('connection-status');
        const addressElement = document.getElementById('wallet-address');
        const balanceElement = document.getElementById('sol-balance');
        const usdBalanceElement = document.getElementById('usd-balance');
        const connectBtn = document.getElementById('connect-wallet-btn');
        
        if (this.isConnected) {
            statusElement.textContent = '✅';
            addressElement.textContent = this.formatAddress(this.walletAddress);
            balanceElement.textContent = `${this.balance.toFixed(2)} SOL`;
            usdBalanceElement.textContent = `($${(this.balance * this.solPrice).toFixed(2)})`;
            connectBtn.textContent = '🦊 Disconnect';
            
            // Enable trading buttons
            document.querySelectorAll('.trade-btn').forEach(btn => {
                btn.disabled = false;
            });
        } else {
            statusElement.textContent = '❌';
            addressElement.textContent = 'Not connected';
            balanceElement.textContent = '0 SOL';
            usdBalanceElement.textContent = '($0)';
            connectBtn.textContent = '🦊 Connect Wallet';
            
            // Disable trading buttons
            document.querySelectorAll('.trade-btn').forEach(btn => {
                btn.disabled = true;
            });
        }
    }
    
    toggleWalletModal(show = true) {
        const modal = document.getElementById('wallet-modal');
        if (show) {
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    }
    
    // Utility functions
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    formatPercent(percent) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(percent / 100);
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }
    
    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' years ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' months ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' days ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' hours ago';
        if (interval === 1) return interval + ' hour ago';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' minutes ago';
        if (interval === 1) return interval + ' minute ago';
        
        return 'just now';
    }
    
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set notification content and type
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        notification.classList.add('active');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
    
    // Data fetching
    async fetchSolPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            this.solPrice = data.solana.usd;
            return this.solPrice;
        } catch (error) {
            console.error('Error fetching SOL price:', error);
            this.solPrice = 180; // Fallback price
            return this.solPrice;
        }
    }

    async fetchPairs(filter = 'new', source = 'pump.fun') {
        try {
            this.showNotification('Fetching pairs from ' + source, 'info');
            
            // For pump.fun tokens using Bitquery API
            if (source === 'pump.fun') {
                // Bitquery API endpoint
                const apiUrl = 'https://graphql.bitquery.io';
                
                // Get the current time and time 24 hours ago
                const now = new Date();
                const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                const nowString = now.toISOString();
                const oneDayAgoString = oneDayAgo.toISOString();
                
                // GraphQL query for new Pump.fun tokens
                const query = `
                {
                  Solana {
                    TokenSupplyUpdates(
                      where: {Instruction: {Program: {Address: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}, Method: {is: "create"}}}}
                      orderBy: {descending: Block_Time}
                      limit: {count: 20}
                    ) {
                      Block {
                        Time
                      }
                      Transaction {
                        Signer
                      }
                      TokenSupplyUpdate {
                        Amount
                        Currency {
                          Symbol
                          Name
                          MintAddress
                          Decimals
                          Fungible
                          Uri
                        }
                        PostBalance
                      }
                    }
                  }
                }`;
                
                // For 'trending' tokens, we would use a different query
                let finalQuery = query;
                if (filter === 'trending') {
                    finalQuery = `
                    {
                      Solana {
                        DEXTrades(
                          limitBy: {by: Trade_Buy_Currency_MintAddress, count: 1}
                          limit: {count: 20}
                          orderBy: {descending: Trade_Buy_Price}
                          where: {Trade: {Dex: {ProtocolName: {is: "pump"}}, Buy: {Currency: {MintAddress: {notIn: ["11111111111111111111111111111111"]}}, PriceInUSD: {gt: 0.00001}}, Sell: {AmountInUSD: {gt: "10"}}}, Transaction: {Result: {Success: true}}, Block: {Time: {since: "${oneDayAgoString}"}}}
                        ) {
                          Trade {
                            Buy {
                              Price(maximum: Block_Time)
                              PriceInUSD(maximum: Block_Time)
                              Currency {
                                Name
                                Symbol
                                MintAddress
                                Decimals
                                Fungible
                                Uri
                              }
                            }
                          }
                        }
                      }
                    }`;
                }
                
                // Making the request to Bitquery API
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // You would need to replace this with your actual API key
                        'X-API-KEY': 'YOUR_BITQUERY_API_KEY'
                    },
                    body: JSON.stringify({ query: finalQuery })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch data from Bitquery API');
                }
                
                const data = await response.json();
                
                // Transform the data based on the filter type
                let pairs = [];
                
                if (filter === 'new') {
                    // Transform TokenSupplyUpdates into the format expected by the UI
                    pairs = data.data.Solana.TokenSupplyUpdates.map(item => {
                        const createdTime = new Date(item.Block.Time);
                        return {
                            name: item.TokenSupplyUpdate.Currency.Name || 'Unknown',
                            symbol: item.TokenSupplyUpdate.Currency.Symbol || 'UNKNOWN',
                            address: item.TokenSupplyUpdate.Currency.MintAddress,
                            price: 0.00000001, // New tokens typically start at a very low price
                            change_24h: 0,
                            volume_24h: 0,
                            liquidity: 0,
                            holders: 0,
                            created_at: createdTime.toISOString(),
                            lp_locked: false,
                            buy_tax: 0,
                            sell_tax: 0,
                            dev_address: item.Transaction.Signer
                        };
                    });
                } else if (filter === 'trending') {
                    // Transform DEXTrades into the format expected by the UI
                    pairs = data.data.Solana.DEXTrades.map(item => {
                        return {
                            name: item.Trade.Buy.Currency.Name || 'Unknown',
                            symbol: item.Trade.Buy.Currency.Symbol || 'UNKNOWN',
                            address: item.Trade.Buy.Currency.MintAddress,
                            price: parseFloat(item.Trade.Buy.Price) || 0,
                            change_24h: 0, // We would need another query to get this
                            volume_24h: 0, // We would need another query to get this
                            liquidity: 0, // We would need another query to get this
                            holders: 0, // We would need another query to get this
                            created_at: now.toISOString(), // We would need another query to get this
                            lp_locked: false, // We would need another query to get this
                            buy_tax: 0,
                            sell_tax: 0
                        };
                    });
                }
                
                this.showNotification(`Found ${pairs.length} pairs`, 'success');
                return pairs;
            }
            
            // For other sources, you would implement different API calls
            // This is just a placeholder for demonstration
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Return empty array for now
            return [];
        } catch (error) {
            console.error('Error fetching pairs:', error);
            this.showNotification('Failed to fetch pairs', 'error');
            return [];
        }
    }
}

// Network monitoring system
class NetworkMonitor {
    constructor() {
        this.downloadSpeed = 0;
        this.uploadSpeed = 0;
        this.pingTime = 0;
        this.maxDownloadSpeed = 10; // MB/s - adjust as needed for your scale
        this.maxUploadSpeed = 5;    // MB/s - adjust as needed for your scale
        this.lastDownloadBytes = 0;
        this.lastUploadBytes = 0;
        this.updateInterval = 100; // 0.1 seconds
        this.pingInterval = 5000;  // 5 seconds
        this.downloadHistory = [];
        this.uploadHistory = [];

        // Get DOM elements
        this.pingElement = document.getElementById('network-ping');
        this.downloadSpeedElement = document.getElementById('download-speed');
        this.uploadSpeedElement = document.getElementById('upload-speed');
        this.timeElement = document.getElementById('current-time');
        this.signalBars = document.querySelectorAll('.signal-bar');
    }

    init() {
        if (window.performance && window.performance.memory) {
            this.lastDownloadBytes = this.simulateNetworkStats().downloaded;
            this.lastUploadBytes = this.simulateNetworkStats().uploaded;
        }

        // Start monitoring
        this.startMonitoring();
        
        // Start the clock
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }

    startMonitoring() {
        // Update ping initially
        this.checkNetworkPing();
        
        // Set up intervals for updates
        setInterval(() => this.updateNetworkSpeed(), this.updateInterval);
        setInterval(() => this.checkNetworkPing(), this.pingInterval);
    }

    // In a real app, you would use the Network Information API or measure real traffic
    // This is a simulation for demonstration purposes
    simulateNetworkStats() {
        // Generate random fluctuations to simulate network activity
        const now = Date.now();
        const timePhase = Math.sin(now / 10000); // Slow oscillation
        const fastPhase = Math.sin(now / 1000);  // Fast fluctuation
        
        // Simulate download and upload bytes
        // Add randomness plus some oscillation to make it look realistic
        const downloaded = this.lastDownloadBytes + 
            (50000 + 30000 * timePhase + 10000 * fastPhase + Math.random() * 20000);
        
        const uploaded = this.lastUploadBytes + 
            (25000 + 15000 * timePhase + 5000 * fastPhase + Math.random() * 10000);
        
        return { downloaded, uploaded };
    }

    updateNetworkSpeed() {
        // Get current network stats
        const stats = this.simulateNetworkStats();
        
        // Calculate speeds in MB/s
        const downloadDelta = stats.downloaded - this.lastDownloadBytes;
        const uploadDelta = stats.uploaded - this.lastUploadBytes;
        
        // Convert to MB/s (bytes to megabytes, then adjust for interval)
        this.downloadSpeed = (downloadDelta / 1048576) * (1000 / this.updateInterval);
        this.uploadSpeed = (uploadDelta / 1048576) * (1000 / this.updateInterval);
        
        // Update last values
        this.lastDownloadBytes = stats.downloaded;
        this.lastUploadBytes = stats.uploaded;
        
        // Store historical data for smoothing
        this.downloadHistory.push(this.downloadSpeed);
        this.uploadHistory.push(this.uploadSpeed);
        
        // Keep history to last 10 values for smoothing
        if (this.downloadHistory.length > 10) {
            this.downloadHistory.shift();
            this.uploadHistory.shift();
        }
        
        // Apply smoothing
        const smoothDownload = this.downloadHistory.reduce((a, b) => a + b, 0) / this.downloadHistory.length;
        const smoothUpload = this.uploadHistory.reduce((a, b) => a + b, 0) / this.uploadHistory.length;
        
        // Update UI
        this.updateSpeedUI(smoothDownload, smoothUpload);
    }

    updateSpeedUI(downloadSpeed, uploadSpeed) {
        if (!this.downloadSpeedElement || !this.uploadSpeedElement) return;
        
        // Update text with fixed precision and padding to prevent UI shifts
        this.downloadSpeedElement.textContent = downloadSpeed.toFixed(2).padStart(5, ' ');
        this.uploadSpeedElement.textContent = uploadSpeed.toFixed(2).padStart(5, ' ');
        
        // Update signal strength based on combined speeds
        const totalSpeed = downloadSpeed + uploadSpeed;
        let signalStrength = 1;
        
        if (totalSpeed > 1) signalStrength = 2;
        if (totalSpeed > 3) signalStrength = 3;
        if (totalSpeed > 6) signalStrength = 4;
        if (totalSpeed > 10) signalStrength = 5;
        
        // Update signal bars
        this.updateSignalBars(signalStrength);
    }
    
    updateSignalBars(strength) {
        if (!this.signalBars || this.signalBars.length === 0) return;
        
        // Remove existing classes
        const signalBarsContainer = this.signalBars[0].parentNode;
        signalBarsContainer.classList.remove('signal-strength-1', 'signal-strength-2', 'signal-strength-3', 'signal-strength-4', 'signal-strength-5');
        
        // Add new class
        signalBarsContainer.classList.add(`signal-strength-${strength}`);
        
        // Update active state for animation
        this.signalBars.forEach((bar, i) => {
            if (i < strength) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    checkNetworkPing() {
        if (!this.pingElement) return;
        
        // Simulate ping check (in a real app, you would ping the actual RPC endpoint)
        const pingStart = performance.now();
        
        // Use the fetch API to check connection to the Solana RPC endpoint
        fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getHealth"
            })
        })
        .then(response => {
            const pingTime = Math.round(performance.now() - pingStart);
            this.pingTime = pingTime;
            let statusIcon = '✓';
            let statusClass = 'positive';
            
            if (pingTime > 200) {
                statusIcon = '⚠️';
                statusClass = 'warning';
            } else if (pingTime > 500) {
                statusIcon = '❌';
                statusClass = 'negative';
            }
            
            // Update in compact format for top bar, using fixed width to prevent UI shifts
            this.pingElement.innerHTML = `Ping: <span class="${statusClass}">${pingTime.toString().padStart(3, ' ')}ms</span>`;
            
            // Update signal strength based on ping time
            let signalStrength = 5;
            if (pingTime > 80) signalStrength = 4;
            if (pingTime > 150) signalStrength = 3;
            if (pingTime > 300) signalStrength = 2;
            if (pingTime > 500) signalStrength = 1;
            
            this.updateSignalBars(signalStrength);
        })
        .catch(error => {
            console.error('Error checking network:', error);
            this.pingElement.innerHTML = 'Ping: <span class="negative">Failed ❌</span>';
            this.updateSignalBars(1);
        });
    }

    updateDateTime() {
        if (!this.timeElement) return;
        
        const now = new Date();
        
        // Format time as HH:MM:SS
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        this.timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Solana Price Tracker
class SolanaPrice {
    constructor() {
        this.currentPrice = 0;
        this.previousPrice = 0;
        this.priceHistory = [];
        this.maxHistoryLength = 20;
        this.updateInterval = 2000; // 2 seconds for faster updates
        this.miniChart = null;
        this.simulatedUpdatesInterval = 250; // Simulate updates every 250ms
        this.simulatedUpdateTimer = null;
        this.basePriceVolatility = 0.0005; // 0.05% max fluctuation between real API calls
        this.lastAPIFetchTime = 0;
        
        // Get DOM elements
        this.priceElement = document.getElementById('sol-price');
        this.changeElement = document.getElementById('sol-change');
        this.chartCanvas = document.getElementById('sol-mini-chart');
    }
    
    async init() {
        // Initial price fetch from API
        await this.fetchAPIPrice();
        
        // Set up chart with delay to ensure DOM is ready
        setTimeout(() => {
            if (this.chartCanvas) {
                this.initChart();
                console.log("Solana price chart initialized");
            } else {
                console.warn("Solana price chart canvas not found");
            }
        }, 500);
        
        // Start fast simulated updates between API calls
        this.startSimulatedUpdates();
        
        // Start real API polling at longer intervals
        setInterval(() => this.fetchAPIPrice(), this.updateInterval);
        
        // Log initialization
        console.log("Solana price tracker initialized with real-time updates");
    }
    
    async fetchAPIPrice() {
        try {
            console.log("Fetching SOL price from API...");
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
            const data = await response.json();
            
            // Store previous price
            this.previousPrice = this.currentPrice;
            
            // Update current price
            this.currentPrice = data.solana.usd;
            const change24h = data.solana.usd_24h_change;
            
            console.log(`API: SOL price updated: $${this.currentPrice} (${change24h}% 24h)`);
            
            // Add to history
            this.addPriceToHistory(this.currentPrice);
            
            // Update UI with real API data
            this.updateUI(this.currentPrice, change24h);
            
            // Update chart
            if (this.miniChart) {
                this.updateChart();
            }
            
            // Record last API fetch time
            this.lastAPIFetchTime = Date.now();
            
            return this.currentPrice;
        } catch (error) {
            console.error('Error fetching SOL price from API:', error);
            
            // Fall back to simulated data if API fails
            this.simulatePrice();
            return this.currentPrice;
        }
    }
    
    startSimulatedUpdates() {
        // Clear any existing timer
        if (this.simulatedUpdateTimer) {
            clearInterval(this.simulatedUpdateTimer);
        }
        
        // Set up interval for frequent simulated updates between API calls
        this.simulatedUpdateTimer = setInterval(() => {
            this.simulatePrice();
        }, this.simulatedUpdatesInterval);
    }
    
    simulatePrice() {
        if (this.currentPrice === 0) return; // Wait for first API fetch
        
        // Time since last real update
        const timeSinceAPI = Date.now() - this.lastAPIFetchTime;
        
        // Increase volatility slightly over time since last API call
        const adjustedVolatility = this.basePriceVolatility * (1 + (timeSinceAPI / this.updateInterval) * 0.5);
        
        // Random walk with momentum
        const momentum = this.priceHistory.length > 1 
            ? (this.priceHistory[this.priceHistory.length - 1] - this.priceHistory[this.priceHistory.length - 2]) / this.currentPrice 
            : 0;
        
        // Random variation with momentum bias
        const randomFactor = (Math.random() * 2 - 1) * adjustedVolatility;
        const momentumFactor = momentum * 0.3; // 30% momentum influence
        
        // Calculate new price
        const newPrice = this.currentPrice * (1 + randomFactor + momentumFactor);
        
        // Add to history
        this.addPriceToHistory(newPrice);
        
        // Update UI with simulated data
        this.updateUI(newPrice);
        
        // Update chart with the simulated price
        if (this.miniChart) {
            this.updateChart();
        }
    }
    
    addPriceToHistory(price) {
        this.priceHistory.push(price);
        
        // Limit history length
        if (this.priceHistory.length > this.maxHistoryLength) {
            this.priceHistory.shift();
        }
    }
    
    updateUI(price, change) {
        if (!this.priceElement) return;
        
        // Update current price with fixed precision to prevent UI shifts
        this.currentPrice = price;
        this.priceElement.textContent = price.toFixed(2).padStart(6, ' ');
        
        // If we have 24h change data from API, update it
        if (this.changeElement && change !== undefined) {
            // Update change percentage with fixed width to prevent UI shifts
            const changeText = change ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '0.00%';
            this.changeElement.textContent = changeText;
            
            // Add appropriate class based on change direction
            this.changeElement.classList.remove('positive', 'negative');
            if (change > 0) {
                this.changeElement.classList.add('positive');
            } else if (change < 0) {
                this.changeElement.classList.add('negative');
            }
        } else if (this.priceHistory.length > 1 && this.changeElement) {
            // Calculate change based on our history if API data not available
            const firstPrice = this.priceHistory[0];
            const percentChange = ((price - firstPrice) / firstPrice) * 100;
            
            // Update change percentage with fixed width
            const changeText = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
            this.changeElement.textContent = changeText;
            
            // Add appropriate class based on change direction
            this.changeElement.classList.remove('positive', 'negative');
            if (percentChange > 0) {
                this.changeElement.classList.add('positive');
            } else if (percentChange < 0) {
                this.changeElement.classList.add('negative');
            }
        }
        
        // Pulse effect on price change
        this.priceElement.classList.add('price-update-pulse');
        setTimeout(() => {
            this.priceElement.classList.remove('price-update-pulse');
        }, 500);
    }
    
    initChart() {
        // Clear any existing chart
        if (this.miniChart) {
            this.miniChart.destroy();
        }
        
        // Generate initial data if empty
        if (this.priceHistory.length === 0) {
            const basePrice = 180; // Fallback if we don't have data yet
            for (let i = 0; i < this.maxHistoryLength; i++) {
                // Add some variation to make it interesting
                const variation = basePrice * (1 + (Math.random() * 0.02 - 0.01));
                this.priceHistory.push(variation);
            }
        }
        
        // Log canvas dimensions for debugging
        console.log(`Chart canvas dimensions: ${this.chartCanvas.width}x${this.chartCanvas.height}`);
        
        // Create chart with better defaults
        const ctx = this.chartCanvas.getContext('2d');
        this.miniChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(this.priceHistory.length).fill(''),
                datasets: [{
                    data: this.priceHistory,
                    borderColor: '#9945FF',
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: 'rgba(153, 69, 255, 0.15)',
                    pointRadius: 0,
                    tension: 0.4,
                    cubicInterpolationMode: 'monotone'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: false,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false,
                        grid: {
                            display: false
                        },
                        min: Math.min(...this.priceHistory) * 0.99,
                        max: Math.max(...this.priceHistory) * 1.01
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                },
                animation: {
                    duration: 300 // Faster animations for real-time updates
                }
            }
        });
        
        // Log that chart was created
        console.log("SOL price chart created with data:", this.priceHistory);
    }
    
    updateChart() {
        if (!this.miniChart) return;
        
        // Update dataset
        this.miniChart.data.datasets[0].data = this.priceHistory;
        
        // Update y-axis limits for a nice view
        this.miniChart.options.scales.y.min = Math.min(...this.priceHistory) * 0.99;
        this.miniChart.options.scales.y.max = Math.max(...this.priceHistory) * 1.01;
        
        // Update chart color based on trend
        const firstPrice = this.priceHistory[0];
        const lastPrice = this.priceHistory[this.priceHistory.length - 1];
        const isPositive = lastPrice >= firstPrice;
        
        this.miniChart.data.datasets[0].borderColor = isPositive ? '#00FF9D' : '#FF3B5C';
        this.miniChart.data.datasets[0].backgroundColor = isPositive ? 
            'rgba(0, 255, 157, 0.15)' : 'rgba(255, 59, 92, 0.15)';
        
        // Update the chart with fast animation
        this.miniChart.update('none'); // Use 'none' for very fast updates
    }
}

// Initialize network monitor and SOL price tracker when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const networkMonitor = new NetworkMonitor();
    networkMonitor.init();
    
    const solanaPrice = new SolanaPrice();
    solanaPrice.init();
});

// Add sidebar toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const overlay = document.getElementById('sidebar-overlay');
    
    // Initialize sidebar state
    const checkSidebarState = () => {
        const sidebarExpanded = localStorage.getItem('sidebarExpanded') === 'true';
        if (sidebarExpanded && window.innerWidth > 768) {
            sidebar.classList.add('expanded');
            mainContent.classList.add('sidebar-expanded');
            if (overlay) overlay.classList.add('active');
        } else {
            sidebar.classList.remove('expanded');
            mainContent.classList.remove('sidebar-expanded');
            if (overlay) overlay.classList.remove('active');
        }
    };
    
    // Toggle sidebar on menu button click
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            mainContent.classList.toggle('sidebar-expanded');
            
            // Toggle overlay
            if (overlay) {
                overlay.classList.toggle('active', sidebar.classList.contains('expanded'));
            }
            
            // Save sidebar state to localStorage (only on desktop)
            if (window.innerWidth > 768) {
                localStorage.setItem('sidebarExpanded', sidebar.classList.contains('expanded'));
            }
        });
    }
    
    // Close sidebar when clicking on overlay
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('expanded');
            mainContent.classList.remove('sidebar-expanded');
            overlay.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking on a menu item (on mobile)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('expanded');
                mainContent.classList.remove('sidebar-expanded');
                if (overlay) overlay.classList.remove('active');
            }
        });
    });
    
    // Check for saved sidebar state on load
    checkSidebarState();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            // On mobile, always collapse sidebar on resize
            sidebar.classList.remove('expanded');
            mainContent.classList.remove('sidebar-expanded');
            if (overlay) overlay.classList.remove('active');
        } else {
            // On desktop, restore saved state
            checkSidebarState();
        }
    });
});
