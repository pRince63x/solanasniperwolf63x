/*jshint esversion: 11 */

class WalletHandler {
    constructor() {
        this.wallet = null;
        this.connection = null;
        this.publicKey = null;
        this.balance = 0;
        this.usdPrice = 0;
        this.currentWalletId = null;
        this.supportedWallets = [
            { name: 'Phantom', id: 'phantom', icon: 'images/wallet-icons/phantom.png', adapter: null, installed: false },
            { name: 'Solflare', id: 'solflare', icon: 'images/wallet-icons/solflare.png', adapter: null, installed: false },
            { name: 'Backpack', id: 'backpack', icon: 'images/wallet-icons/backpack.png', adapter: null, installed: false },
            { name: 'Glow', id: 'glow', icon: 'images/wallet-icons/glow.png', adapter: null, installed: false }
        ];
        
        // Initialize with error handling
        this.initialize();
    }
    
    async initialize() {
        try {
            // Wait for window to be fully loaded
            if (document.readyState !== 'complete') {
                await new Promise(resolve => window.addEventListener('load', resolve));
            }
            
            // Initialize connection to Solana
            this.initConnection();
            
            // Initialize wallet adapters
            this.initWalletAdapters();
            
            // Generate wallet options in the modal
            this.generateWalletOptions();
            
            // Add event listeners for wallet options
            this.initWalletOptions();
            
            // Check for existing wallet connection
            await this.checkExistingConnection();
            
            // Add event listener for connect button
            const connectButton = document.getElementById('connect-wallet-btn');
            if (connectButton) {
                connectButton.addEventListener('click', () => {
                    const modal = document.getElementById('wallet-modal');
                    if (modal) {
                        modal.classList.add('active');
                    }
                });
            }

            // Add event listener for modal close button
            const closeButton = document.querySelector('.close-modal');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    const modal = document.getElementById('wallet-modal');
                    if (modal) {
                        modal.classList.remove('active');
                    }
                });
            }
            
            console.log('Wallet handler initialized with supported wallets:', this.supportedWallets.map(w => w.name).join(', '));
        } catch (error) {
            console.error('Error initializing wallet handler:', error);
            this.showError('Error initializing wallet. Please refresh the page.');
        }
    }
    
    initConnection() {
        try {
            // Connect to Solana mainnet
            this.connection = new solanaWeb3.Connection(
                'https://api.mainnet-beta.solana.com',
                'confirmed'
            );
        } catch (error) {
            console.error('Error initializing connection:', error);
            this.showError('Error connecting to Solana network');
        }
    }
    
    /**
     * Checks for an existing wallet connection.
     */
    async checkExistingConnection() {
        try {
            // Check localStorage for saved wallet connection
            const savedWallet = localStorage.getItem('connectedWallet');
            if (!savedWallet) return;
            
            const walletData = JSON.parse(savedWallet);
            // Check if connection is still valid (less than 24 hours old)
            const now = Date.now();
            const connectionAge = now - walletData.timestamp;
            const MAX_CONNECTION_AGE = 24 * 60 * 60 * 1000; // 24 hours
            
            if (connectionAge > MAX_CONNECTION_AGE) {
                console.log('Saved connection expired, removing');
                localStorage.removeItem('connectedWallet');
                return;
            }
            
            // Find the wallet adapter
            const wallet = this.supportedWallets.find(w => w.id === walletData.type);
            if (!wallet || !wallet.adapter) {
                console.log(`Saved wallet ${walletData.type} not available`);
                return;
            }
            
            try {
                // Try to reconnect
                const resp = await wallet.adapter.connect({ onlyIfTrusted: true });
                if (resp.publicKey) {
                    this.wallet = wallet.adapter;
                    this.publicKey = resp.publicKey.toString();
                    this.currentWalletId = walletData.type;
                    
                    // Update UI
                    this.updateConnectionStatus(true);
                    this.updateWalletAddress();
                    await this.updateBalance();
                    
                    // Update timestamp
                    localStorage.setItem('connectedWallet', JSON.stringify({
                        type: walletData.type,
                        publicKey: this.publicKey,
                        timestamp: Date.now()
                    }));
                    
                    console.log(`Reconnected to ${wallet.name} wallet`);
                }
            } catch (err) {
                // Silent fail for auto-connect
                console.log('No pre-existing trusted connection found');
            }
        } catch (error) {
            console.error('Error checking existing connection:', error);
            // Silent fail for auto-connect
        }
    }

    getProvider() {
        try {
            // Try window.solana providers
            if (window.solana) {
                if (window.solana.isPhantom) return window.solana;
                // Check multiple providers
                if (Array.isArray(window.solana.providers)) {
                    const phantom = window.solana.providers.find(p => p.isPhantom);
                    if (phantom) return phantom;
                }
            }
            // Legacy fallback to window.phantom.solana
            if (window.phantom?.solana?.isPhantom) {
                return window.phantom.solana;
            }
            return null;
        } catch (error) {
            console.error('Error getting Phantom provider:', error);
            return null;
        }
    }
    
    initWalletAdapters() {
        // Initialize adapters for each supported wallet
        this.supportedWallets.forEach(wallet => {
            switch(wallet.id) {
                case 'phantom':
                    wallet.adapter = window.solana?.isPhantom ? window.solana : 
                                    window.phantom?.solana?.isPhantom ? window.phantom.solana : null;
                    wallet.installed = !!wallet.adapter;
                    break;
                case 'solflare':
                    wallet.adapter = window.solflare?.isSolflare ? window.solflare : null;
                    wallet.installed = !!wallet.adapter;
                    break;
                case 'backpack':
                    // Check for Backpack (xNFT) wallet
                    wallet.adapter = window.backpack?.isBackpack ? window.backpack : null;
                    wallet.installed = !!wallet.adapter;
                    break;
                case 'glow':
                    // Check for Glow wallet
                    wallet.adapter = window.glow?.isGlow ? window.glow : null;
                    wallet.installed = !!wallet.adapter;
                    break;
                default:
                    wallet.installed = false;
                    wallet.adapter = null;
            }
            
            console.log(`Wallet ${wallet.name} ${wallet.installed ? 'detected' : 'not detected'}`);
        });
    }
    
    generateWalletOptions() {
        try {
            // Get the wallet options container
            const walletContainer = document.querySelector('.wallet-options');
            if (!walletContainer) return;
            
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
        } catch (error) {
            console.error('Error generating wallet options:', error);
        }
    }
    
    initWalletOptions() {
        try {
            // Add click handlers for wallet options
            const options = document.querySelectorAll('.wallet-option');
            if (options.length > 0) {
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
            }
        } catch (error) {
            console.error('Error initializing wallet options:', error);
        }
    }
    
    async connectWallet(walletId) {
        console.log(`Connecting to ${walletId} wallet...`);
        try {
            // Find the wallet adapter
            const wallet = this.supportedWallets.find(w => w.id === walletId);
            if (!wallet || !wallet.adapter) {
                this.showError(`${wallet?.name || walletId} wallet not available. Please install it first.`);
                return;
            }

            try {
                // Connect to the wallet
                const resp = await wallet.adapter.connect();
                console.log('Connection response:', resp);
                
                this.wallet = wallet.adapter;
                this.publicKey = resp.publicKey.toString();
                this.currentWalletId = walletId;

                // Save wallet connection info to localStorage
                localStorage.setItem('connectedWallet', JSON.stringify({
                    type: walletId,
                    publicKey: this.publicKey,
                    timestamp: Date.now()
                }));

                // Update UI
                this.updateConnectionStatus(true);
                this.updateWalletAddress();
                await this.updateBalance();
                
                // Close the modal
                const modal = document.getElementById('wallet-modal');
                if (modal) {
                    modal.classList.remove('active');
                }
                
                // Show success notification
                this.showNotification(`${wallet.name} wallet connected successfully!`, 'success');
                
                // Add event listeners for wallet changes
                wallet.adapter.on('accountChanged', (publicKey) => {
                    if (publicKey) {
                        this.publicKey = publicKey.toString();
                        this.updateWalletAddress();
                        this.updateBalance();
                    } else {
                        this.disconnectWallet();
                    }
                });

                wallet.adapter.on('disconnect', () => {
                    this.disconnectWallet();
                });
                
            } catch (err) {
                console.error('Connection error:', err);
                if (err.code === 4001) {
                    this.showError('Please approve the connection request in your wallet');
                    return;
                }
                throw err;
            }
        } catch (error) {
    async disconnectWallet() {
        try {
            if (this.wallet) {
                this.wallet.disconnect();
            }
            
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
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    }
    
    showInstallWalletInstructions(walletId) {
        const wallet = this.supportedWallets.find(w => w.id === walletId);
        if (!wallet) return;
        
        let installUrl = '';
        let instructions = '';
        
        switch(walletId) {
            case 'phantom':
                installUrl = 'https://phantom.app/download';
                instructions = 'Install Phantom wallet from the Chrome Web Store or visit phantom.app';
                break;
            case 'solflare':
                installUrl = 'https://spl_governance.cratus.app/';
                instructions = 'Install Solflare wallet from the Chrome Web Store or visit spl_governance.cratus.app';
                break;
            case 'backpack':
                installUrl = 'https://cratus.app/';
                instructions = 'Install Backpack wallet from the Chrome Web Store or visit cratus.app';
                break;
            case 'glow':
                installUrl = 'https://glow.app/';
                instructions = 'Install Glow wallet from the Chrome Web Store or visit glow.app';
                break;
            default:
                instructions = `Please install ${wallet.name} wallet to continue`;
        }
        
        // Show modal with instructions
        this.showNotification(`${instructions}. After installing, please refresh this page.`, 'info', 10000);
        
        // Open install URL in new tab
        if (installUrl) {
            window.open(installUrl, '_blank');
        }
    }
    
    async updateBalance() {
        if (!this.publicKey || !this.connection) {
            const solBalance = document.getElementById('sol-balance');
            const usdBalance = document.getElementById('usd-balance');
            if (solBalance) solBalance.textContent = '0 SOL';
            if (usdBalance) usdBalance.textContent = '($0)';
            return;
        }
        
        try {
            // Get SOL balance
            const balance = await this.connection.getBalance(new solanaWeb3.PublicKey(this.publicKey));
            this.balance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            
            // Get SOL price in USD
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            this.usdPrice = data.solana.usd;
            
            // Update UI
            const solBalance = document.getElementById('sol-balance');
            const usdBalance = document.getElementById('usd-balance');
            
            if (solBalance) {
                solBalance.textContent = `${this.balance.toFixed(4)} SOL`;
            }
            if (usdBalance) {
                const usdValue = (this.balance * this.usdPrice).toFixed(2);
                usdBalance.textContent = `($${usdValue})`;
            }
        } catch (error) {
            console.error('Error updating balance:', error);
            this.showError('Failed to update wallet balance');
        }
    }
    
    updateConnectionStatus(connected) {
        const connectButton = document.getElementById('connect-wallet-btn');
        const statusElement = document.getElementById('connection-status');
        
        if (connectButton) {
            if (connected) {
                connectButton.classList.add('connected');
                connectButton.textContent = 'Connected';
            } else {
                connectButton.classList.remove('connected');
                connectButton.textContent = 'Connect Wallet';
            }
        }

        if (statusElement) {
            if (connected) {
                statusElement.textContent = '✅';
                statusElement.style.color = '#00FF9D';
            } else {
                statusElement.textContent = '❌';
                statusElement.style.color = '#FF3B5C';
            }
        }
    }
    
    updateWalletAddress() {
        const addressElement = document.getElementById('wallet-address');
        if (addressElement) {
            if (this.publicKey) {
                const shortAddress = `${this.publicKey.slice(0, 4)}...${this.publicKey.slice(-4)}`;
                addressElement.textContent = shortAddress;
            } else {
                addressElement.textContent = 'Not connected';
            }
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Wait for Phantom injection
    async waitForProvider(timeout = 5000) {
        const interval = 100;
        const maxTries = Math.ceil(timeout / interval);
        let tries = 0;
        return new Promise(resolve => {
            const id = setInterval(() => {
                if (this.getProvider()) {
                    clearInterval(id);
                    resolve(true);
                } else if (++tries >= maxTries) {
                    clearInterval(id);
                    resolve(false);
                }
            }, interval);
        });
    }
}

// Initialize wallet handler as soon as DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing WalletHandler');
        window.walletHandler = new WalletHandler();
    } catch (err) {
        console.error('Error creating walletHandler:', err);
    }
});

// Export wallet handler
window.WalletHandler = WalletHandler; 