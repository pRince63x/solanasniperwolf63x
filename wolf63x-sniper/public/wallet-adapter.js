/**
 * Enhanced Solana Wallet Adapter Implementation
 * Handles all wallet connections reliably with proper error handling
 */

/* jshint esversion: 11 */

class EnhancedWalletAdapter {
    constructor() {
        // Core wallet properties
        this.wallet = null;
        this.connection = null;
        this.publicKey = null;
        this.balance = 0;
        this.usdPrice = 0;
        this.currentWalletId = null;
        this.isConnecting = false;
        this.connectionAttempts = 0;
        
        // Supported wallets with detection and adapter info
        this.supportedWallets = [
            { name: 'Phantom', id: 'phantom', icon: 'images/wallet-icons/phantom.png', adapter: null, installed: false },
            { name: 'Solflare', id: 'solflare', icon: 'images/wallet-icons/solflare.png', adapter: null, installed: false },
            { name: 'Backpack', id: 'backpack', icon: 'images/wallet-icons/backpack.png', adapter: null, installed: false },
            { name: 'Glow', id: 'glow', icon: 'images/wallet-icons/glow.png', adapter: null, installed: false }
        ];
        
        // Wallet event listeners
        this.eventListeners = {
            connect: [],
            disconnect: [],
            accountChange: []
        };

        // Initialize connection
        this.initialize();
    }
    
    /**
     * Initialize wallet adapter with enhanced error handling
     */
    async initialize() {
        try {
            // Wait for window to be fully loaded
            await this.waitForWindowLoad();
            
            // Initialize Solana connection
            this.initConnection();
            
            // Initialize wallet adapters with retries
            await this.initWalletAdapters();
            
            // Generate wallet options in the UI
            this.generateWalletOptions();
            
            // Add event listeners
            this.attachEventListeners();
            
            // Check for existing wallet connection from previous session
            await this.checkExistingConnection();
            
            // Get SOL price for USD conversion
            this.fetchSolPrice();
            
            console.log('Wallet adapter initialized successfully with wallets:', 
                this.supportedWallets.map(w => `${w.name} (${w.installed ? 'Installed' : 'Not Installed'})`).join(', '));
        } catch (error) {
            console.error('Error initializing wallet adapter:', error);
            this.showError('Wallet initialization failed. Please refresh the page.');
        }
    }
    
    /**
     * Wait for window to be fully loaded
     */
    waitForWindowLoad() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });
    }
    
    /**
     * Initialize Solana connection with automatic retry
     */
    initConnection() {
        const MAX_RETRIES = 3;
        let attempts = 0;
        
        const tryConnect = () => {
            try {
                // Try RPC endpoints in sequence
                const endpoints = [
                    'https://api.mainnet-beta.solana.com',
                    'https://solana-mainnet.g.alchemy.com/v2/demo',
                    'https://rpc.ankr.com/solana'
                ];
                
                const endpoint = endpoints[attempts % endpoints.length];
                this.connection = new solanaWeb3.Connection(endpoint, 'confirmed');
                console.log(`Connected to Solana mainnet via ${endpoint}`);
                return true;
            } catch (error) {
                console.error(`Connection attempt ${attempts + 1} failed:`, error);
                attempts++;
                
                if (attempts >= MAX_RETRIES) {
                    this.showError('Failed to connect to Solana network. Please check your internet connection.');
                    return false;
                }
                
                return tryConnect();
            }
        };
        
        return tryConnect();
    }
    
    /**
     * Initialize wallet adapters with enhanced detection
     */
    async initWalletAdapters() {
        // Small delay to ensure browser has time to inject wallet providers
        await new Promise(resolve => setTimeout(resolve, 100));
        
        for (const wallet of this.supportedWallets) {
            switch (wallet.id) {
                case 'phantom':
                    // Try multiple detection paths for Phantom
                    wallet.adapter = window.phantom?.solana;
                    if (!wallet.adapter && window.solana?.isPhantom) {
                        wallet.adapter = window.solana;
                    }
                    wallet.installed = !!wallet.adapter;
                    break;
                    
                case 'solflare':
                    // Try multiple detection paths for Solflare
                    wallet.adapter = window.solflare;
                    wallet.installed = window.solflare?.isSolflare || false;
                    break;
                    
                case 'backpack':
                    // Check for Backpack (xNFT) wallet
                    wallet.adapter = window.backpack?.xnft?.solana || window.backpack;
                    wallet.installed = wallet.adapter?.isBackpack || false;
                    break;
                    
                case 'glow':
                    // Check for Glow wallet
                    wallet.adapter = window.glow;
                    wallet.installed = wallet.adapter?.isGlow || false;
                    break;
                    
                default:
                    wallet.installed = false;
            }
            
            console.log(`Wallet ${wallet.name} ${wallet.installed ? 'detected' : 'not detected'}`);
        }
    }
    
    /**
     * Generate wallet options in the UI
     */
    generateWalletOptions() {
        const walletContainer = document.querySelector('.wallet-options');
        if (!walletContainer) {
            console.warn('Wallet options container not found in DOM');
            return;
        }
        
        // Clear existing options
        walletContainer.innerHTML = '';
        
        // Add options for each supported wallet
        this.supportedWallets.forEach(wallet => {
            const option = document.createElement('div');
            option.className = `wallet-option ${!wallet.installed ? 'disabled' : ''}`;
            option.setAttribute('data-wallet', wallet.id);
            
            const icon = document.createElement('img');
            icon.src = wallet.icon;
            icon.alt = wallet.name;
            icon.className = 'wallet-icon';
            
            const name = document.createElement('span');
            name.className = 'wallet-name';
            name.textContent = wallet.name;
            
            const status = document.createElement('span');
            status.className = 'wallet-status';
            status.textContent = wallet.installed ? 'Available' : 'Not Installed';
            
            option.appendChild(icon);
            option.appendChild(name);
            option.appendChild(status);
            
            walletContainer.appendChild(option);
        });
    }
    
    /**
     * Attach all necessary event listeners
     */
    attachEventListeners() {
        // Attach listeners to wallet options
        const options = document.querySelectorAll('.wallet-option');
        options.forEach(option => {
            option.addEventListener('click', async () => {
                const walletId = option.getAttribute('data-wallet');
                if (option.classList.contains('disabled')) {
                    this.showInstallWalletInstructions(walletId);
                    return;
                }
                
                await this.connectWallet(walletId);
            });
        });
        
        // Add listener for connect button
        const connectButton = document.getElementById('wallet-connect-btn') || document.getElementById('connect-wallet-btn');
        if (connectButton) {
            connectButton.addEventListener('click', () => {
                if (this.isConnected()) {
                    this.disconnectWallet();
                } else {
                    const modal = document.getElementById('wallet-modal');
                    if (modal) modal.classList.add('active');
                }
            });
        }
        
        // Add listener for modal close button
        const closeButton = document.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                const modal = document.getElementById('wallet-modal');
                if (modal) modal.classList.remove('active');
            });
        }
        
        // Add escape key listener to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('wallet-modal');
                if (modal && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            }
        });
        
        // Close modal when clicking outside
        const modal = document.getElementById('wallet-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }
    
    /**
     * Check if wallet is already connected from a previous session
     */
    async checkExistingConnection() {
        try {
            const savedData = localStorage.getItem('connectedWallet');
            if (!savedData) return false;
            
            const walletData = JSON.parse(savedData);
            const now = Date.now();
            const MAX_CONNECTION_AGE = 24 * 60 * 60 * 1000; // 24 hours
            
            // Check if connection is still valid
            if (now - walletData.timestamp > MAX_CONNECTION_AGE) {
                console.log('Saved wallet connection expired');
                localStorage.removeItem('connectedWallet');
                return false;
            }
            
            // Find the wallet adapter
            const wallet = this.supportedWallets.find(w => w.id === walletData.walletId);
            if (!wallet || !wallet.installed || !wallet.adapter) {
                console.log(`Previously connected wallet ${walletData.walletId} not available`);
                return false;
            }
            
            console.log(`Attempting to reconnect to ${wallet.name} wallet`);
            
            try {
                // Try auto-connecting (trusted connection only)
                const connected = await this.autoConnectWallet(wallet);
                if (connected) {
                    console.log(`Successfully reconnected to ${wallet.name} wallet`);
                    return true;
                }
            } catch (error) {
                console.log('Auto-connect failed:', error.message);
            }
            
            return false;
        } catch (error) {
            console.error('Error checking existing connection:', error);
            return false;
        }
    }
    
    /**
     * Auto-connect to a wallet (only if already trusted)
     */
    async autoConnectWallet(wallet) {
        try {
            // Try connecting only if user has already trusted the connection
            const resp = await wallet.adapter.connect({ onlyIfTrusted: true });
            
            if (resp && resp.publicKey) {
                this.wallet = wallet.adapter;
                this.publicKey = resp.publicKey.toString();
                this.currentWalletId = wallet.id;
                
                // Update UI
                this.updateConnectionStatus(true);
                this.updateWalletAddress();
                await this.updateBalance();
                
                // Update localStorage with fresh timestamp
                this.saveWalletConnection();
                
                // Register event listeners
                this.registerWalletEventListeners(wallet);
                
                return true;
            }
        } catch (error) {
            console.log('No pre-approved connection available');
        }
        
        return false;
    }
    
    /**
     * Connect to a specific wallet
     */
    async connectWallet(walletId) {
        if (this.isConnecting) {
            console.log('Connection already in progress');
            return;
        }
        
        this.isConnecting = true;
        this.connectionAttempts++;
        
        try {
            // Find the wallet adapter
            const wallet = this.supportedWallets.find(w => w.id === walletId);
            if (!wallet || !wallet.installed || !wallet.adapter) {
                this.showError(`${wallet?.name || walletId} wallet not available`);
                this.isConnecting = false;
                return;
            }
            
            console.log(`Connecting to ${wallet.name} wallet...`);
            
            // Show connecting state in UI
            this.showConnectingState(wallet.name);
            
            try {
                // Connect to wallet with timeout
                const connectPromise = wallet.adapter.connect();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timed out')), 30000)
                );
                
                const resp = await Promise.race([connectPromise, timeoutPromise]);
                
                if (resp && resp.publicKey) {
                    this.wallet = wallet.adapter;
                    this.publicKey = resp.publicKey.toString();
                    this.currentWalletId = walletId;
                    
                    // Save connection info
                    this.saveWalletConnection();
                    
                    // Update UI
                    this.updateConnectionStatus(true);
                    this.updateWalletAddress();
                    await this.updateBalance();
                    
                    // Close modal
                    const modal = document.getElementById('wallet-modal');
                    if (modal) modal.classList.remove('active');
                    
                    // Register wallet event listeners
                    this.registerWalletEventListeners(wallet);
                    
                    // Show success notification
                    this.showNotification(`Connected to ${wallet.name} wallet successfully!`, 'success');
                    
                    // Fire connect event
                    this.fireEvent('connect', { 
                        wallet: wallet.id, 
                        publicKey: this.publicKey 
                    });
                    
                    console.log(`Connected to ${wallet.name} wallet:`, this.publicKey);
                } else {
                    throw new Error('No public key returned from wallet');
                }
            } catch (error) {
                console.error('Wallet connection error:', error);
                
                if (error.code === 4001) {
                    this.showError('Connection rejected. Please approve the connection request in your wallet.');
                } else if (error.message.includes('timeout')) {
                    this.showError('Connection timed out. Please try again.');
                } else {
                    this.showError(`Failed to connect: ${error.message || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Unexpected error during connection:', error);
            this.showError('Unexpected error during wallet connection');
        } finally {
            this.isConnecting = false;
        }
    }
    
    /**
     * Register event listeners for connected wallet
     */
    registerWalletEventListeners(wallet) {
        if (!wallet || !wallet.adapter) return;
        
        // Remove any existing listeners
        try {
            wallet.adapter.removeAllListeners?.('disconnect');
            wallet.adapter.removeAllListeners?.('accountChanged');
        } catch (e) {
            console.log('Could not remove existing listeners');
        }
        
        // Add disconnect listener
        wallet.adapter.on?.('disconnect', () => {
            console.log('Wallet disconnected event received');
            this.disconnectWallet(true);
        });
        
        // Add account change listener
        wallet.adapter.on?.('accountChanged', (publicKey) => {
            console.log('Wallet account changed:', publicKey);
            if (publicKey) {
                this.publicKey = publicKey.toString();
                this.updateWalletAddress();
                this.updateBalance();
                
                // Update localStorage
                this.saveWalletConnection();
                
                // Fire account change event
                this.fireEvent('accountChange', { 
                    wallet: wallet.id, 
                    publicKey: this.publicKey 
                });
            } else {
                this.disconnectWallet(true);
            }
        });
    }
    
    /**
     * Disconnect the wallet
     */
    async disconnectWallet(fromEvent = false) {
        try {
            // Only try to disconnect if not triggered by wallet's own event
            if (!fromEvent && this.wallet) {
                try {
                    await this.wallet.disconnect();
                } catch (error) {
                    console.warn('Error during wallet disconnect:', error);
                }
            }
            
            // Clear wallet data
            this.wallet = null;
            this.publicKey = null;
            this.balance = 0;
            this.currentWalletId = null;
            
            // Remove from localStorage
            localStorage.removeItem('connectedWallet');
            
            // Update UI
            this.updateConnectionStatus(false);
            this.updateWalletAddress();
            this.updateBalance();
            
            // Show notification
            this.showNotification('Wallet disconnected', 'info');
            
            // Fire disconnect event
            this.fireEvent('disconnect');
            
            console.log('Wallet disconnected successfully');
            return true;
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            this.showError('Failed to disconnect wallet properly');
            return false;
        }
    }
    
    /**
     * Save wallet connection to localStorage
     */
    saveWalletConnection() {
        if (!this.publicKey || !this.currentWalletId) return;
        
        localStorage.setItem('connectedWallet', JSON.stringify({
            walletId: this.currentWalletId,
            publicKey: this.publicKey,
            timestamp: Date.now()
        }));
    }
    
    /**
     * Show wallet installation instructions
     */
    showInstallWalletInstructions(walletId) {
        const wallet = this.supportedWallets.find(w => w.id === walletId);
        if (!wallet) return;
        
        let installUrl;
        let instructions;
        
        switch(walletId) {
            case 'phantom':
                installUrl = 'https://phantom.app/download';
                instructions = 'Install Phantom wallet from the Chrome Web Store or visit phantom.app';
                break;
            case 'solflare':
                installUrl = 'https://solflare.com/download';
                instructions = 'Install Solflare wallet from the Chrome Web Store or visit solflare.com';
                break;
            case 'backpack':
                installUrl = 'https://www.backpack.app/download';
                instructions = 'Install Backpack wallet from the Chrome Web Store or visit backpack.app';
                break;
            case 'glow':
                installUrl = 'https://glow.app/download';
                instructions = 'Install Glow wallet from the Chrome Web Store or visit glow.app';
                break;
            default:
                instructions = `Please install ${wallet.name} wallet to continue`;
        }
        
        // Show instructions notification
        this.showNotification(`${instructions}. After installing, please refresh this page.`, 'info', 10000);
        
        // Open install URL
        if (installUrl) {
            window.open(installUrl, '_blank');
        }
    }
    
    /**
     * Update wallet SOL balance
     */
    async updateBalance() {
        const solBalance = document.getElementById('sol-balance');
        const usdBalance = document.getElementById('usd-balance');
            
        if (!this.publicKey || !this.connection) {
            if (solBalance) solBalance.textContent = '0 SOL';
            if (usdBalance) usdBalance.textContent = '($0.00)';
            return;
        }
        
        try {
            // Show loading state
            if (solBalance) solBalance.textContent = 'Loading...';
            
            // Get SOL balance with retry
            let balance;
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    balance = await this.connection.getBalance(new solanaWeb3.PublicKey(this.publicKey));
                    break;
                } catch (err) {
                    if (attempt === 2) throw err;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            this.balance = balance / 1e9; // Convert lamports to SOL
            
            // Update UI elements
            if (solBalance) solBalance.textContent = `${this.balance.toFixed(4)} SOL`;
            
            // Calculate USD value
            if (this.usdPrice > 0 && usdBalance) {
                const usdValue = this.balance * this.usdPrice;
                usdBalance.textContent = `($${usdValue.toFixed(2)})`;
            } else if (usdBalance) {
                usdBalance.textContent = '($0.00)';
            }
            
            return this.balance;
        } catch (error) {
            console.error('Error updating balance:', error);
            if (solBalance) solBalance.textContent = 'Error';
            return 0;
        }
    }
    
    /**
     * Fetch SOL price in USD
     */
    async fetchSolPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            
            if (data && data.solana && data.solana.usd) {
                this.usdPrice = data.solana.usd;
                console.log(`Fetched SOL price: $${this.usdPrice}`);
                
                // Update balance display with new price
                if (this.isConnected()) {
                    this.updateBalance();
                }
            }
        } catch (error) {
            console.warn('Failed to fetch SOL price:', error);
        }
    }
    
    /**
     * Update wallet connection status in UI
     */
    updateConnectionStatus(isConnected) {
        // Update status indicator if exists
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = isConnected ? '✅' : '❌';
        }
        
        // Update connect button
        const connectButton = document.getElementById('wallet-connect-btn') || document.getElementById('connect-wallet-btn');
        if (connectButton) {
            if (isConnected) {
                connectButton.textContent = 'Disconnect';
                connectButton.classList.add('connected');
            } else {
                connectButton.textContent = '🦊 Connect Wallet';
                connectButton.classList.remove('connected');
            }
        }
    }
    
    /**
     * Show connecting state in UI
     */
    showConnectingState(walletName) {
        const connectButton = document.getElementById('wallet-connect-btn') || document.getElementById('connect-wallet-btn');
        if (connectButton) {
            const originalText = connectButton.textContent;
            connectButton.textContent = 'Connecting...';
            
            // Reset button text after timeout (in case connection fails silently)
            setTimeout(() => {
                if (connectButton.textContent === 'Connecting...') {
                    connectButton.textContent = originalText;
                }
            }, 30000);
        }
    }
    
    /**
     * Update wallet address display in UI
     */
    updateWalletAddress() {
        const addressElement = document.getElementById('wallet-address');
        if (!addressElement) return;
        
        if (this.publicKey) {
            // Format address to show first and last few characters
            const shortAddress = this.publicKey.substring(0, 4) + '...' + this.publicKey.substring(this.publicKey.length - 4);
            
            // Create HTML with copy button
            addressElement.innerHTML = `
                <span class="address-text">${shortAddress}</span>
                <button class="copy-address" title="Copy address">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            
            // Add copy functionality
            const copyButton = addressElement.querySelector('.copy-address');
            if (copyButton) {
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(this.publicKey)
                        .then(() => {
                            copyButton.innerHTML = '<i class="fas fa-check"></i>';
                            this.showNotification('Address copied to clipboard', 'success', 2000);
                            
                            // Reset icon after 2 seconds
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy address:', err);
                            this.showError('Failed to copy address');
                        });
                });
            }
        } else {
            addressElement.innerHTML = '<span class="nav-text">Not connected</span>';
        }
    }
    
    /**
     * Show a notification message
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'info': icon = 'ℹ️'; break;
            case 'warning': icon = '⚠️'; break;
            default: icon = 'ℹ️';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    /**
     * Show an error notification
     */
    showError(message) {
        this.showNotification(message, 'error', 5000);
    }
    
    /**
     * Check if wallet is connected
     */
    isConnected() {
        return !!this.wallet && !!this.publicKey;
    }
    
    /**
     * Get current wallet public key
     */
    getPublicKey() {
        return this.publicKey;
    }
    
    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    /**
     * Remove event listener
     */
    off(event, callback) {
        if (!this.eventListeners[event]) return;
        
        this.eventListeners[event] = this.eventListeners[event]
            .filter(cb => cb !== callback);
    }
    
    /**
     * Fire event to all listeners
     */
    fireEvent(event, data = {}) {
        if (!this.eventListeners[event]) return;
        
        this.eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} event listener:`, error);
            }
        });
    }
}

// Initialize wallet adapter as soon as DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing Enhanced Wallet Adapter');
        window.solanaWalletAdapter = new EnhancedWalletAdapter();
    } catch (error) {
        console.error('Error initializing wallet adapter:', error);
    }
});
