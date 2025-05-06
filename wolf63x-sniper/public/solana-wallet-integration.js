/**
 * Solana Wallet Integration for Wolf63x Sniper Bot
 * Integrates the requested Solana wallet adapters and creates connection UI
 */

/* jshint esversion: 11 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create wallet button and inject it into the top bar
    injectWalletButton();
    
    // Create wallet modal
    createWalletModal();
    
    // Initialize wallet adapter
    initializeSolanaAdapter();
});

/**
 * Injects the wallet connect button into the UI
 */
function injectWalletButton() {
    // Create the wallet button container
    const walletButtonContainer = document.createElement('div');
    walletButtonContainer.className = 'solana-wallet-container';
    walletButtonContainer.innerHTML = `
        <button id="wallet-connect-btn" class="wallet-connect-btn">
            🦊 Connect Wallet
        </button>
        <div id="wallet-address" class="wallet-address"></div>
        <div class="wallet-balance">
            <span id="sol-balance">0 SOL</span>
            <span id="usd-balance">($0.00)</span>
        </div>
    `;
    
    // Try to find the top bar to inject the button
    let targetElement = document.querySelector('.top-bar-right');
    
    // If top-bar-right doesn't exist, try other common header elements
    if (!targetElement) {
        targetElement = document.querySelector('.top-bar');
    }
    
    // If still not found, try any header or nav element
    if (!targetElement) {
        targetElement = document.querySelector('header') || 
                        document.querySelector('nav') || 
                        document.querySelector('.header') ||
                        document.querySelector('.nav');
    }
    
    // If we found a target, inject the wallet button
    if (targetElement) {
        // Try to insert it before the last child of the target
        const lastChild = targetElement.lastElementChild;
        if (lastChild) {
            targetElement.insertBefore(walletButtonContainer, lastChild);
        } else {
            targetElement.appendChild(walletButtonContainer);
        }
    } else {
        // If no suitable target found, create a floating button
        walletButtonContainer.style.position = 'fixed';
        walletButtonContainer.style.top = '10px';
        walletButtonContainer.style.right = '10px';
        walletButtonContainer.style.zIndex = '1000';
        walletButtonContainer.classList.add('floating-wallet-button');
        document.body.appendChild(walletButtonContainer);
    }
}

/**
 * Creates the wallet connection modal
 */
function createWalletModal() {
    // Create modal markup
    const walletModal = document.createElement('div');
    walletModal.id = 'wallet-modal';
    walletModal.className = 'wallet-modal';
    walletModal.innerHTML = `
        <div class="wallet-modal-content">
            <div class="wallet-modal-header">
                <h2 class="wallet-modal-title">Connect Wallet</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="wallet-options">
                <!-- Wallet options will be dynamically inserted here -->
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.appendChild(walletModal);
}

/**
 * Initialize the Solana wallet adapter
 */
function initializeSolanaAdapter() {
    // Load required dependencies if not already loaded
    loadDependencies()
        .then(() => {
            console.log('Solana wallet dependencies loaded successfully');
            
            // Initialize the enhanced wallet adapter
            if (typeof EnhancedWalletAdapter !== 'undefined') {
                window.solanaWalletAdapter = new EnhancedWalletAdapter();
            } else {
                console.error('EnhancedWalletAdapter not found. Make sure wallet-adapter.js is loaded.');
            }
        })
        .catch(error => {
            console.error('Error loading Solana wallet dependencies:', error);
        });
}

/**
 * Load required Solana dependencies
 */
function loadDependencies() {
    return new Promise((resolve, reject) => {
        // Check if Solana web3 is already loaded
        if (typeof solanaWeb3 === 'undefined') {
            // Load Solana web3 script
            const web3Script = document.createElement('script');
            web3Script.src = 'https://unpkg.com/@solana/web3.js@1.89.0/lib/index.iife.min.js';
            web3Script.onload = () => {
                console.log('Solana web3.js loaded');
                loadExtraScripts().then(resolve).catch(reject);
            };
            web3Script.onerror = () => reject(new Error('Failed to load Solana web3.js'));
            document.head.appendChild(web3Script);
        } else {
            // Solana web3 already loaded, continue with other scripts
            loadExtraScripts().then(resolve).catch(reject);
        }
    });
}

/**
 * Load additional scripts and stylesheets
 */
function loadExtraScripts() {
    return new Promise((resolve, reject) => {
        // Load wallet adapter stylesheet
        if (!document.querySelector('link[href="wallet-adapter.css"]')) {
            const styleSheet = document.createElement('link');
            styleSheet.rel = 'stylesheet';
            styleSheet.href = 'wallet-adapter.css';
            document.head.appendChild(styleSheet);
        }
        
        // Check if buffer is loaded
        if (typeof Buffer === 'undefined') {
            const bufferScript = document.createElement('script');
            bufferScript.src = 'https://cdn.jsdelivr.net/npm/buffer@6.0.3/index.min.js';
            bufferScript.onload = () => {
                console.log('Buffer loaded');
                // Once buffer is loaded, load our custom wallet adapter
                loadWalletAdapter().then(resolve).catch(reject);
            };
            bufferScript.onerror = () => reject(new Error('Failed to load Buffer'));
            document.head.appendChild(bufferScript);
        } else {
            // Buffer already loaded, load our custom wallet adapter
            loadWalletAdapter().then(resolve).catch(reject);
        }
    });
}

/**
 * Load the custom wallet adapter script
 */
function loadWalletAdapter() {
    return new Promise((resolve, reject) => {
        if (typeof EnhancedWalletAdapter === 'undefined') {
            const adapterScript = document.createElement('script');
            adapterScript.src = 'wallet-adapter.js';
            adapterScript.onload = () => {
                console.log('Wallet adapter loaded');
                resolve();
            };
            adapterScript.onerror = () => reject(new Error('Failed to load wallet adapter'));
            document.head.appendChild(adapterScript);
        } else {
            // Already loaded
            resolve();
        }
    });
}
