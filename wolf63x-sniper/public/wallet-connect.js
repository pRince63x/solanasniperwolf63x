/**
 * Wallet Connect Functionality for Wolf63x Sniper Bot
 * Handles wallet connection popup and animations
 * Integrates with real Solana wallets via wallet-api.js
 */

/* jshint esversion: 8 */

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const walletConnectBtn = document.getElementById('wallet-connect-btn');
    const walletPopup = document.getElementById('wallet-popup');
    const closePopupBtn = document.querySelector('.close-popup');
    const walletOptions = document.querySelectorAll('.wallet-option');
    
    // Variable to track disconnect popup
    let disconnectPopup = null;
    
    // Create welcome popup
    function createWelcomePopup() {
        // Don't show if wallet is already connected
        if (localStorage.getItem('walletConnected') === 'true') {
            return;
        }
        
        // Create welcome popup element
        const welcomePopup = document.createElement('div');
        welcomePopup.className = 'wallet-welcome-popup';
        welcomePopup.id = 'wallet-welcome-popup';
        
        // Add content to the popup
        welcomePopup.innerHTML = `
            <div class="wallet-welcome-popup-header">
                <h4>🐺 Wolf63x Sniper - Ready to Hunt</h4>
                <span class="wallet-welcome-popup-close">&times;</span>
            </div>
            <div class="wallet-welcome-popup-body">
                Connect your Solana wallet now to unleash the full power of Wolf63x Sniper Bot. Gain access to lightning-fast trades, MEV protection, and real-time rug detection.
            </div>
            <div class="wallet-welcome-features">
                <div class="wallet-feature-item">🚀 10x Faster Execution</div>
                <div class="wallet-feature-item">💎 Priority TX Routing</div>
            </div>
            <button class="wallet-welcome-popup-button">Connect Wallet</button>
        `;
        
        // Append to body
        document.body.appendChild(welcomePopup);
        
        // Add event listeners
        const closeBtn = welcomePopup.querySelector('.wallet-welcome-popup-close');
        closeBtn.addEventListener('click', () => {
            welcomePopup.classList.remove('show');
            setTimeout(() => welcomePopup.remove(), 400);
        });
        
        const connectBtn = welcomePopup.querySelector('.wallet-welcome-popup-button');
        connectBtn.addEventListener('click', () => {
            welcomePopup.classList.remove('show');
            setTimeout(() => welcomePopup.remove(), 400);
            showWalletPopup();
        });
        
        // Show popup with a delay
        setTimeout(() => {
            welcomePopup.classList.add('show');
        }, 1500);
        
        // Auto remove after 15 seconds
        setTimeout(() => {
            if (document.getElementById('wallet-welcome-popup')) {
                welcomePopup.classList.remove('show');
                setTimeout(() => welcomePopup.remove(), 400);
            }
        }, 15000);
    }
    
    // Function to show wallet popup
    function showWalletPopup() {
        walletPopup.classList.add('show');
    }
    
    // Function to show disconnect popup
    function showDisconnectPopup(e) {
        e.stopPropagation();
        
        // Remove existing popup if it exists
        if (disconnectPopup) {
            disconnectPopup.remove();
            disconnectPopup = null;
            return;
        }
        
        // Create disconnect popup
        disconnectPopup = document.createElement('div');
        disconnectPopup.className = 'disconnect-popup';
        
        const disconnectBtn = document.createElement('button');
        disconnectBtn.className = 'disconnect-btn';
        disconnectBtn.textContent = 'Disconnect Wallet';
        disconnectBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            disconnectWallet();
        });
        
        disconnectPopup.appendChild(disconnectBtn);
        document.body.appendChild(disconnectPopup);
        
        // Position the popup below the wallet button
        const rect = walletConnectBtn.getBoundingClientRect();
        disconnectPopup.style.top = `${rect.bottom + 10}px`;
        disconnectPopup.style.left = `${rect.left}px`;
        
        // Close popup when clicking outside
        document.addEventListener('click', function closePopup(e) {
            if (!disconnectPopup.contains(e.target) && e.target !== walletConnectBtn) {
                disconnectPopup.remove();
                disconnectPopup = null;
                document.removeEventListener('click', closePopup);
            }
        });
    }
    
    // Function to handle wallet connection
    async function connectWallet(walletType) {
        console.log(`Connecting to ${walletType} wallet...`);
        
        // Real wallet connection process
        const walletText = document.querySelector('.wallet-text');
        const originalText = walletText.textContent;
        
        walletText.textContent = 'Connecting...';
        
        try {
            // Check if wallet is available
            if (!solanaWalletAPI.isWalletAvailable(walletType)) {
                // Show installation instructions
                let installUrl = '';
                switch(walletType) {
                    case 'phantom': installUrl = 'https://phantom.app/'; break;
                    case 'solflare': installUrl = 'https://solflare.com/'; break;
                    case 'slope': installUrl = 'https://slope.finance/'; break;
                    case 'sollet': installUrl = 'https://www.sollet.io/'; break;
                }
                
                showNotification(`${walletType} wallet not detected. Please install it from ${installUrl}`, 'error');
                walletText.textContent = originalText;
                return;
            }
            
            // Connect to wallet
            const result = await solanaWalletAPI.connect(walletType);
            
            if (result.success) {
                // Connection successful
                walletText.textContent = 'Connected';
                walletConnectBtn.classList.add('connected');
                localStorage.setItem('walletConnected', 'true');
                localStorage.setItem('walletType', walletType);
                localStorage.setItem('walletPublicKey', result.publicKey);
                
                // Show success notification
                showNotification(`Connected to ${walletType} wallet`, 'success');
                
                // Hide the popup
                walletPopup.classList.remove('show');
                
                // Log connection details
                console.log('Wallet connected successfully:', {
                    publicKey: result.publicKey,
                    balance: result.balance,
                    provider: solanaWalletAPI.provider
                });
            } else {
                // Show error notification
                showNotification(result.message, 'error');
                console.error('Wallet connection failed:', result.message);
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showNotification('Failed to connect wallet: ' + (error.message || 'Unknown error'), 'error');
        }
    }
    
    // Function to handle wallet disconnection
    async function disconnectWallet() {
        if (!solanaWalletAPI || !solanaWalletAPI.isConnected) {
            console.warn('No wallet connected');
            return;
        }
        
        try {
            // Disconnect the wallet
            const result = await solanaWalletAPI.disconnect();
            
            if (result.success) {
                // Reset UI
                resetWalletUI();
                
                // Show notification
                showNotification('Wallet disconnected', 'info');
                
                // Remove disconnect popup
                if (disconnectPopup) {
                    disconnectPopup.remove();
                    disconnectPopup = null;
                }
                
                console.log('Wallet disconnected successfully');
            } else {
                showNotification(result.message, 'error');
                console.error('Wallet disconnection failed:', result.message);
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            showNotification('Failed to disconnect wallet: ' + (error.message || 'Unknown error'), 'error');
        }
    }
    
    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `wallet-notification ${type}`;
        notification.innerHTML = `
            ${message}
            <span class="notification-close">&times;</span>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listener to close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    // Function to update wallet UI after connection
    function updateWalletUI(publicKey, balance) {
        const walletText = document.querySelector('.wallet-text');
        const walletIcon = walletConnectBtn.querySelector('.sol-price-icon i');
        
        // Format public key for display (first 4 chars...last 4 chars)
        const formattedKey = publicKey.substring(0, 4) + '...' + publicKey.substring(publicKey.length - 4);
        
        // Format balance
        const formattedBalance = typeof balance === 'number' ? balance.toFixed(2) : '0.00';
        
        // Update wallet text
        walletText.textContent = `${formattedBalance} SOL`;
        
        // Add connected class
        walletConnectBtn.classList.add('connected');
        
        // Update icon
        walletIcon.classList.remove('fa-wallet');
        walletIcon.classList.add('fa-check-circle');
        
        // Change click behavior to show disconnect option
        walletConnectBtn.removeEventListener('click', showWalletPopup);
        walletConnectBtn.addEventListener('click', showDisconnectPopup);
        
        // Store connection in localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletBalance', formattedBalance);
        localStorage.setItem('walletPublicKey', publicKey);
        
        // Update dashboard wallet info if elements exist
        const dashboardWalletBalance = document.getElementById('wallet-balance');
        if (dashboardWalletBalance) {
            dashboardWalletBalance.textContent = `${formattedBalance} SOL`;
        }
        
        const dashboardWalletAddress = document.getElementById('wallet-address');
        if (dashboardWalletAddress) {
            dashboardWalletAddress.textContent = formattedKey;
            dashboardWalletAddress.classList.add('positive');
        }
        
        // If dashboard summary stats exist, update them too
        const summaryWalletBalance = document.getElementById('dashboard-wallet-balance');
        if (summaryWalletBalance) {
            summaryWalletBalance.textContent = `${formattedBalance} SOL`;
        }
        
        const summaryWalletAddress = document.getElementById('dashboard-wallet-address');
        if (summaryWalletAddress) {
            summaryWalletAddress.textContent = formattedKey;
        }
    }
    
    // Function to reset wallet UI after disconnection
    function resetWalletUI() {
        const walletText = document.querySelector('.wallet-text');
        const walletIcon = walletConnectBtn.querySelector('.sol-price-icon i');
        
        // Reset text
        walletText.textContent = 'Connect Wallet';
        
        // Remove connected class
        walletConnectBtn.classList.remove('connected');
        
        // Reset icon
        walletIcon.classList.remove('fa-check-circle');
        walletIcon.classList.add('fa-wallet');
        
        // Change click behavior back to show connect popup
        walletConnectBtn.removeEventListener('click', showDisconnectPopup);
        walletConnectBtn.addEventListener('click', showWalletPopup);
        
        // Clear localStorage
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletType');
        localStorage.removeItem('walletBalance');
        localStorage.removeItem('walletPublicKey');
    }
    
    // Initialize wallet API
    const solanaWalletAPI = new SolanaWalletAPI();
    
    // Check for previously connected wallet on page load
    setTimeout(() => {
        if (solanaWalletAPI.isConnected && solanaWalletAPI.publicKey) {
            updateWalletUI(solanaWalletAPI.publicKey, solanaWalletAPI.balance);
        }
    }, 1000);
    
    // Check if wallet was previously connected
    if (localStorage.getItem('walletConnected') === 'true') {
        const walletType = localStorage.getItem('walletType') || 'phantom';
        const walletBalance = localStorage.getItem('walletBalance') || '0.00';
        const walletPublicKey = localStorage.getItem('walletPublicKey');
        const walletText = document.querySelector('.wallet-text');
        const walletIcon = document.querySelector('.wallet-section .sol-price-icon i');
        
        // Attempt to reconnect to wallet
        solanaWalletAPI.connect(walletType).then(result => {
            if (result.success) {
                // Restore connected state
                walletText.textContent = `${result.balance.toFixed(2)} SOL`;
                walletConnectBtn.classList.add('connected');
                
                // Restore icon
                walletIcon.classList.remove('fa-wallet');
                walletIcon.classList.add('fa-check-circle');
                
                // Change click behavior to show disconnect option
                walletConnectBtn.removeEventListener('click', showWalletPopup);
                walletConnectBtn.addEventListener('click', showDisconnectPopup);
                
                // Update local storage
                localStorage.setItem('walletBalance', result.balance.toFixed(2));
            } else {
                // Failed to reconnect, clear storage
                walletText.textContent = 'Connect Wallet';
                localStorage.removeItem('walletConnected');
                localStorage.removeItem('walletType');
                localStorage.removeItem('walletBalance');
                localStorage.removeItem('walletPublicKey');
            }
        }).catch(error => {
            console.error('Error reconnecting to wallet:', error);
            // Clear storage on error
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletType');
            localStorage.removeItem('walletBalance');
            localStorage.removeItem('walletPublicKey');
        });
    }
    
    // Show welcome popup after a delay
    setTimeout(createWelcomePopup, 1000);
    
    // Show wallet popup when connect button is clicked
    walletConnectBtn.addEventListener('click', showWalletPopup);
    
    // Close popup when X is clicked
    closePopupBtn.addEventListener('click', function() {
        walletPopup.classList.remove('show');
    });
    
    // Close popup when clicking outside the content
    walletPopup.addEventListener('click', function(e) {
        if (e.target === walletPopup) {
            walletPopup.classList.remove('show');
        }
    });
    
    // Handle wallet selection
    walletOptions.forEach(option => {
        option.addEventListener('click', function() {
            const walletType = this.getAttribute('data-wallet');
            connectWallet(walletType);
            walletPopup.classList.remove('show');
        });
    });
    
    // Add extra dollar signs dynamically for more impressive animation
    const walletSection = document.querySelector('.wallet-section');
    for (let i = 0; i < 20; i++) {
        const dollar = document.createElement('span');
        dollar.className = 'dollar';
        dollar.textContent = '$';
        walletSection.appendChild(dollar);
    }
    
    // Enhance wallet hover effect with random dollar positions
    const dollars = document.querySelectorAll('.dollar');
    dollars.forEach((dollar, index) => {
        // Set random horizontal positions for a more natural effect
        const randomLeft = 10 + Math.random() * 80; // Random position between 10% and 90%
        const randomDelay = Math.random() * 0.5; // Random delay up to 0.5s
        const randomDuration = 0.8 + Math.random() * 0.7; // Random duration between 0.8s and 1.5s
        
        dollar.style.setProperty('--left-pos', `${randomLeft}%`);
        dollar.style.setProperty('--fall-delay', `${randomDelay}s`);
        dollar.style.setProperty('--fall-duration', `${randomDuration}s`);
    });
});
