/* jshint esversion: 6 */
/**
 * Navigation Behavior for Wolf63x Sniper Bot
 * 
 * IMPORTANT: Header, Sidebar, and Dashboard Stats must remain visible at all times.
 * Sidebar + Header + Dashboard Stats = Always visible
 * Do not hide them on sidebar navigation
 * Only hide background content during modals/pop-ups
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get references to key UI elements
    var sidebar = document.querySelector('.sidebar');
    var header = document.querySelector('.top-bar');
    var contextStats = document.getElementById('context-stats');
    var sidebarLinks = document.querySelectorAll('.sidebar-link');
    var pages = document.querySelectorAll('.page, .app-page');
    
    // Function to handle navigation
    function handleNavigation(targetPageId) {
        // Hide all pages first
        for (var i = 0; i < pages.length; i++) {
            pages[i].style.display = 'none';
        }
        
        // Show the target page
        var targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.style.display = 'block';
        }
        
        // IMPORTANT: Always ensure header and sidebar remain visible
        header.style.display = 'flex';
        sidebar.style.display = 'flex';
        
        // Update dashboard stats content based on active page
        updateDashboardStats(targetPageId);
    }
    
    // Function to update dashboard stats based on active page
    function updateDashboardStats(pageId) {
        // Clear current stats content
        while (contextStats.firstChild) {
            contextStats.removeChild(contextStats.firstChild);
        }
        
        // Add appropriate stats based on the active page
        if (pageId === 'dashboard-page') {
            // Get wallet data if available
            const walletConnected = localStorage.getItem('walletConnected') === 'true';
            const walletAddress = localStorage.getItem('walletPublicKey') || '';
            const walletBalance = localStorage.getItem('walletBalance') || '0.00';
            
            // Format wallet address for display
            const displayAddress = walletAddress ? 
                walletAddress.substring(0, 4) + '...' + walletAddress.substring(walletAddress.length - 4) : 
                'Not Connected';
            
            // Dashboard stats - removed Solana price display
            contextStats.innerHTML = `
                <span id="stats-title" style="color: #57ca84 !important; -webkit-text-fill-color: #57ca84 !important;">DASHBOARD</span>
                <span class="stat-display"><span class="stat-label">P/L:</span><span id="total-profit" class="stat-value positive">+$243.61</span></span>
                <span class="stat-display"><span class="stat-label">Trades:</span><span id="total-trades" class="stat-value">32</span></span>
                <span class="stat-display"><span class="stat-label">Win:</span><span id="win-rate" class="stat-value">68%</span></span>
                <span class="stat-display"><span class="stat-label">Avg:</span><span id="avg-profit" class="stat-value positive">+$7.61</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Wallet:</span><span id="wallet-address" class="stat-value ${walletConnected ? 'positive' : ''}">${displayAddress}</span></span>
                <span class="stat-display"><span class="stat-label">Balance:</span><span id="wallet-balance" class="stat-value">${walletBalance} SOL</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Gas:</span><span id="gas-price" class="stat-value">0.000005</span></span>
                <span class="stat-display"><span class="stat-label">TPS:</span><span id="network-tps" class="stat-value">2,458</span></span>
                <span class="stat-display"><span class="stat-label">Bot:</span><span id="bot-status" class="stat-value status-active">ACTIVE</span></span>
                <span id="current-time">23:45:12</span>
            `;
        } else if (pageId === 'sniper-page') {
            // Sniper stats
            contextStats.innerHTML = `
                <span id="stats-title" style="color: #57ca84 !important; -webkit-text-fill-color: #57ca84 !important;">SNIPER</span>
                <span class="stat-display"><span class="stat-label">Buy Amount:</span><span id="sniper-buy-amount" class="stat-value">0.5 SOL</span></span>
                <span class="stat-display"><span class="stat-label">Slippage:</span><span id="sniper-slippage" class="stat-value">0.6%</span></span>
                <span class="stat-display"><span class="stat-label">Take Profit:</span><span id="sniper-take-profit" class="stat-value">50%</span></span>
                <span class="stat-display"><span class="stat-label">Stop Loss:</span><span id="sniper-stop-loss" class="stat-value">30%</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Auto:</span><span id="sniper-auto" class="stat-value status-active">ON</span></span>
                <span class="stat-display"><span class="stat-label">Delay:</span><span id="sniper-delay" class="stat-value">1m</span></span>
                <span class="stat-display"><span class="stat-label">Max/Day:</span><span id="sniper-max-trades" class="stat-value">100</span></span>
                <span class="stat-display"><span class="stat-label">Anti-Rug:</span><span id="sniper-anti-rug" class="stat-value status-active">ON</span></span>
            `;
        } else if (pageId === 'scanner-page') {
            // Scanner stats
            contextStats.innerHTML = `
                <span id="stats-title" style="color: #57ca84 !important; -webkit-text-fill-color: #57ca84 !important;">SCANNER</span>
                <span class="stat-display"><span class="stat-label">New Pairs:</span><span id="scanner-new-pairs" class="stat-value">142</span></span>
                <span class="stat-display"><span class="stat-label">Trending:</span><span id="scanner-trending" class="stat-value">37</span></span>
                <span class="stat-display"><span class="stat-label">Liquidity:</span><span id="scanner-liquidity" class="stat-value">$4.2M</span></span>
                <span class="stat-display"><span class="stat-label">Volume:</span><span id="scanner-volume" class="stat-value">$1.8M</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Pump.fun:</span><span id="scanner-pump" class="stat-value status-active">LIVE</span></span>
                <span class="stat-display"><span class="stat-label">Refresh:</span><span id="scanner-refresh" class="stat-value">30s</span></span>
                <span class="stat-display"><span class="stat-label">Alerts:</span><span id="scanner-alerts" class="stat-value">ON</span></span>
                <span class="stat-display"><span class="stat-label">Filters:</span><span id="scanner-filters" class="stat-value">5</span></span>
            `;
        } else if (pageId === 'pairs-page') {
            // Pairs stats
            contextStats.innerHTML = `
                <span id="stats-title" style="color: #57ca84 !important; -webkit-text-fill-color: #57ca84 !important;">PAIRS</span>
                <span class="stat-display"><span class="stat-label">Watchlist:</span><span id="pairs-watchlist" class="stat-value">24</span></span>
                <span class="stat-display"><span class="stat-label">Favorites:</span><span id="pairs-favorites" class="stat-value">12</span></span>
                <span class="stat-display"><span class="stat-label">Memecoins:</span><span id="pairs-memecoins" class="stat-value">87</span></span>
                <span class="stat-display"><span class="stat-label">DeFi:</span><span id="pairs-defi" class="stat-value">35</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Sort:</span><span id="pairs-sort" class="stat-value">Volume</span></span>
                <span class="stat-display"><span class="stat-label">View:</span><span id="pairs-view" class="stat-value">Grid</span></span>
                <span class="stat-display"><span class="stat-label">Charts:</span><span id="pairs-charts" class="stat-value">DexScreener</span></span>
                <span class="stat-display"><span class="stat-label">Sync:</span><span id="pairs-sync" class="stat-value status-active">ON</span></span>
            `;
        } else if (pageId === 'portfolio-page') {
            // Portfolio stats
            contextStats.innerHTML = `
                <span id="stats-title" style="color: #57ca84 !important; -webkit-text-fill-color: #57ca84 !important;">PORTFOLIO</span>
                <span class="stat-display"><span class="stat-label">Total Value:</span><span id="portfolio-total" class="stat-value">$5,842.76</span></span>
                <span class="stat-display"><span class="stat-label">SOL:</span><span id="portfolio-sol" class="stat-value">24.8</span></span>
                <span class="stat-display"><span class="stat-label">Tokens:</span><span id="portfolio-tokens" class="stat-value">18</span></span>
                <span class="stat-display"><span class="stat-label">24h:</span><span id="portfolio-24h" class="stat-value positive">+2.4%</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Best:</span><span id="portfolio-best" class="stat-value">BONK</span></span>
                <span class="stat-display"><span class="stat-label">Worst:</span><span id="portfolio-worst" class="stat-value">MEME</span></span>
                <span class="stat-display"><span class="stat-label">NFTs:</span><span id="portfolio-nfts" class="stat-value">7</span></span>
                <span class="stat-display"><span class="stat-label">Refresh:</span><span id="portfolio-refresh" class="stat-value clickable">↻</span></span>
            `;
        } else if (pageId === 'history-page') {
            // History stats
            contextStats.innerHTML = `
                <span id="stats-title" style="color: #57ca84 !important; -webkit-text-fill-color: #57ca84 !important;">HISTORY</span>
                <span class="stat-display"><span class="stat-label">Total Trades:</span><span id="history-total" class="stat-value">248</span></span>
                <span class="stat-display"><span class="stat-label">Wins:</span><span id="history-wins" class="stat-value positive">168</span></span>
                <span class="stat-display"><span class="stat-label">Losses:</span><span id="history-losses" class="stat-value negative">80</span></span>
                <span class="stat-display"><span class="stat-label">Win Rate:</span><span id="history-win-rate" class="stat-value">67.7%</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Period:</span><span id="history-period" class="stat-value">All Time</span></span>
                <span class="stat-display"><span class="stat-label">Best:</span><span id="history-best" class="stat-value positive">+432%</span></span>
                <span class="stat-display"><span class="stat-label">Worst:</span><span id="history-worst" class="stat-value negative">-78%</span></span>
                <span class="stat-display"><span class="stat-label">Export:</span><span id="history-export" class="stat-value clickable">CSV</span></span>
            `;
        } else if (pageId === 'settings-page') {
            // Settings stats
            contextStats.innerHTML = `
                <span id="stats-title" style="color: #57ca84 !important; -webkit-text-fill-color: #57ca84 !important;">SETTINGS</span>
                <span class="stat-display"><span class="stat-label">Wallet:</span><span id="settings-wallet" class="stat-value">Connected</span></span>
                <span class="stat-display"><span class="stat-label">RPC:</span><span id="settings-rpc" class="stat-value status-active">Helius</span></span>
                <span class="stat-display"><span class="stat-label">Theme:</span><span id="settings-theme" class="stat-value">Dark Green</span></span>
                <span class="stat-display"><span class="stat-label">Version:</span><span id="settings-version" class="stat-value">v1.3.2</span></span>
                <span class="stat-divider"></span>
                <span class="stat-display"><span class="stat-label">Notifications:</span><span id="settings-notifications" class="stat-value status-active">ON</span></span>
                <span class="stat-display"><span class="stat-label">Sounds:</span><span id="settings-sounds" class="stat-value status-active">ON</span></span>
                <span class="stat-display"><span class="stat-label">Backup:</span><span id="settings-backup" class="stat-value clickable">Export</span></span>
                <span class="stat-display"><span class="stat-label">Support:</span><span id="settings-support" class="stat-value clickable">Contact</span></span>
            `;
        }
        
        // Ensure the logo-fix.js script can process the new content
        setTimeout(function() {
            // Apply the FontAwesome icon replacements
            const statImages = contextStats.querySelectorAll('img');
            statImages.forEach(function(img) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-coins';
                icon.style.color = '#14F195';
                icon.style.fontSize = '16px';
                icon.style.verticalAlign = 'middle';
                icon.style.marginRight = '5px';
                
                if (img.parentNode) {
                    img.parentNode.replaceChild(icon, img);
                }
            });
        }, 50);
    }
    
    // Add click event listeners to sidebar links
    function addClickListener(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            for (var k = 0; k < sidebarLinks.length; k++) {
                sidebarLinks[k].classList.remove('active');
            }
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target page ID from the link's data attribute
            var targetPageId = this.getAttribute('data-target');
            
            // Handle navigation
            handleNavigation(targetPageId);
        });
    }
    
    // Apply click listeners to all sidebar links
    for (var j = 0; j < sidebarLinks.length; j++) {
        addClickListener(sidebarLinks[j]);
    }
    
    // Handle modal/popup behavior
    var modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    var modals = document.querySelectorAll('.modal');
    var closeButtons = document.querySelectorAll('.close-modal');
    
    // Modal trigger click handler
    function addModalTriggerListener(trigger) {
        trigger.addEventListener('click', function() {
            var modalId = this.getAttribute('data-modal-trigger');
            var modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'flex';
                // Note: We don't hide header, sidebar, or dashboard stats here
                // The modal will overlay on top of the content
            }
        });
    }
    
    // Close button click handler
    function addCloseButtonListener(button) {
        button.addEventListener('click', function() {
            var modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Modal outside click handler
    function addModalOutsideClickListener(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }
    
    // Open modal
    for (var m = 0; m < modalTriggers.length; m++) {
        addModalTriggerListener(modalTriggers[m]);
    }
    
    // Close modal
    for (var n = 0; n < closeButtons.length; n++) {
        addCloseButtonListener(closeButtons[n]);
    }
    
    // Close modal when clicking outside
    for (var p = 0; p < modals.length; p++) {
        addModalOutsideClickListener(modals[p]);
    }
    
    // Initialize with dashboard page
    handleNavigation('dashboard-page');
});

