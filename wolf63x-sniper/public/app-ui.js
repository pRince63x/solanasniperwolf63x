/*jshint esversion: 11 */
/*global Chart */

// Wolf63x Solana Sniper Bot - UI JavaScript
class SniperUI {
    constructor(app) {
        this.app = app;
        this.chartInstances = {};
        
        // Initialize UI event listeners
        this.initEventListeners();
        this.initModals();
    }
    
    initEventListeners() {
        // Theme toggle
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.classList.contains('violet-theme') ? 'violet' : 'green';
                this.setTheme(theme);
            });
        });
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('href').substring(1);
                this.navigateTo(page);
            });
        });
        
        // Modal buttons
        const settingsModalBtn = document.getElementById('open-settings-modal');
        if (settingsModalBtn) {
            settingsModalBtn.addEventListener('click', () => {
                this.openModal('sniper-settings-modal');
            });
        }
        
        const filtersModalBtn = document.getElementById('open-filters-modal');
        if (filtersModalBtn) {
            filtersModalBtn.addEventListener('click', () => {
                this.openModal('filter-settings-modal');
            });
        }
        
        // Save settings from modals
        document.getElementById('modal-save-settings')?.addEventListener('click', () => {
            this.saveSettingsFromModal();
            this.closeModal('sniper-settings-modal');
        });
        
        document.getElementById('modal-save-filters')?.addEventListener('click', () => {
            this.saveFiltersFromModal();
            this.closeModal('filter-settings-modal');
        });
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Pairs page
        document.getElementById('refresh-pairs')?.addEventListener('click', () => {
            this.refreshPairs();
        });
        
        // Quick snipe
        document.getElementById('snipe-token-btn')?.addEventListener('click', () => {
            const tokenAddress = document.getElementById('token-address')?.value;
            const amount = parseFloat(document.getElementById('quick-amount')?.value || 0.5);
            
            if (tokenAddress) {
                this.app.snipeToken(tokenAddress, amount);
            } else {
                this.showNotification('Please enter a token address', 'error');
            }
        });
    }
    
    initModals() {
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Initialize modal values from current settings
        this.updateModalValues();
    }
    
    updateModalValues() {
        // Settings modal
        const settings = this.app.getSettings();
        if (settings) {
            document.getElementById('modal-buy-amount').value = settings.buyAmount || 0.5;
            document.getElementById('modal-slippage').value = settings.slippage || 0.6;
            document.getElementById('modal-take-profit').value = settings.takeProfit || 50;
            document.getElementById('modal-stop-loss').value = settings.stopLoss || 30;
            document.getElementById('modal-time-between-trades').value = settings.timeBetweenTrades || 60;
            document.getElementById('modal-max-trades').value = settings.maxTrades || 100;
            document.getElementById('modal-auto-snipe').checked = settings.autoSnipe || false;
            document.getElementById('modal-auto-sell').checked = settings.autoSell || false;
        }
        
        // Filters modal
        const filters = this.app.getFilters();
        if (filters) {
            document.getElementById('modal-min-liquidity').value = filters.minLiquidity || 25;
            document.getElementById('modal-min-holders').value = filters.minHolders || 50;
            document.getElementById('modal-max-buy-tax').value = filters.maxBuyTax || 10;
            document.getElementById('modal-max-sell-tax').value = filters.maxSellTax || 10;
            document.getElementById('modal-min-token-age').value = filters.minTokenAge || 3;
            document.getElementById('modal-min-lp-lock').value = filters.minLpLock || 30;
            document.getElementById('modal-require-lp-lock').checked = filters.requireLpLock !== false;
            document.getElementById('modal-min-score').value = filters.minScore || 75;
            document.getElementById('modal-blacklisted-creators').value = filters.blacklistedCreators?.join(', ') || '';
        }
    }
    
    saveSettingsFromModal() {
        const settings = {
            buyAmount: parseFloat(document.getElementById('modal-buy-amount').value),
            slippage: parseFloat(document.getElementById('modal-slippage').value),
            takeProfit: parseFloat(document.getElementById('modal-take-profit').value),
            stopLoss: parseFloat(document.getElementById('modal-stop-loss').value),
            timeBetweenTrades: parseInt(document.getElementById('modal-time-between-trades').value),
            maxTrades: parseInt(document.getElementById('modal-max-trades').value),
            autoSnipe: document.getElementById('modal-auto-snipe').checked,
            autoSell: document.getElementById('modal-auto-sell').checked
        };
        
        this.app.updateSettings(settings);
        this.updateSettingsSummary();
        this.showNotification('Settings saved successfully', 'success');
    }
    
    saveFiltersFromModal() {
        const filters = {
            minLiquidity: parseFloat(document.getElementById('modal-min-liquidity').value),
            minHolders: parseInt(document.getElementById('modal-min-holders').value),
            maxBuyTax: parseFloat(document.getElementById('modal-max-buy-tax').value),
            maxSellTax: parseFloat(document.getElementById('modal-max-sell-tax').value),
            minTokenAge: parseInt(document.getElementById('modal-min-token-age').value),
            minLpLock: parseInt(document.getElementById('modal-min-lp-lock').value),
            requireLpLock: document.getElementById('modal-require-lp-lock').checked,
            minScore: parseInt(document.getElementById('modal-min-score').value),
            blacklistedCreators: document.getElementById('modal-blacklisted-creators').value
                .split(',')
                .map(addr => addr.trim())
                .filter(addr => addr.length > 0)
        };
        
        this.app.updateFilters(filters);
        this.updateFiltersSummary();
        this.showNotification('Filters saved successfully', 'success');
    }
    
    updateSettingsSummary() {
        const settings = this.app.getSettings();
        if (settings) {
            document.getElementById('summary-buy-amount').textContent = `${settings.buyAmount} SOL`;
            document.getElementById('summary-slippage').textContent = `${settings.slippage}%`;
            document.getElementById('summary-take-profit').textContent = `${settings.takeProfit}%`;
            document.getElementById('summary-stop-loss').textContent = `${settings.stopLoss}%`;
        }
    }
    
    updateFiltersSummary() {
        const filters = this.app.getFilters();
        if (filters) {
            document.getElementById('summary-min-liquidity').textContent = `${filters.minLiquidity} SOL`;
            document.getElementById('summary-min-holders').textContent = `${filters.minHolders}`;
            document.getElementById('summary-max-tax').textContent = `${filters.maxBuyTax}% / ${filters.maxSellTax}%`;
            document.getElementById('summary-min-token-age').textContent = `${filters.minTokenAge} min`;
        }
    }
    
    // Navigation
    navigateTo(page) {
        console.log(`Navigating to page: ${page}`);
        
        // Hide all pages
        document.querySelectorAll('.page, .app-page').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });
        
        // Show selected page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
            console.log(`Activated page: ${page}-page`);
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${page}`) {
                    item.classList.add('active');
                    console.log(`Set active nav item: ${item.getAttribute('href')}`);
                }
            });
            
            // Update page title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
            }
            
            // Special page initializations
            if (page === 'dashboard') {
                this.initDashboardCharts();
            } else if (page === 'pairs') {
                this.refreshPairs();
            } else if (page === 'scanner') {
                this.app.refreshScanner();
            }
        }
    }
    
    // Theme management
    setTheme(theme) {
        document.body.className = `theme-${theme}`;
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.${theme}-theme`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.app.setTheme(theme);
        
        // Update charts with new theme colors
        this.updateChartsTheme();
    }
    
    // Modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Notification system
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
    
    // Dashboard charts
    initDashboardCharts() {
        // Performance chart
        this.initPerformanceChart();
    }
    
    initPerformanceChart() {
        const ctx = document.getElementById('performance-chart')?.getContext('2d');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.chartInstances.performance) {
            this.chartInstances.performance.destroy();
        }
        
        // Get theme colors
        const chartLine = getComputedStyle(document.documentElement).getPropertyValue('--chart-line').trim();
        const chartGradientStart = getComputedStyle(document.documentElement).getPropertyValue('--chart-gradient-start').trim();
        const chartGradientEnd = getComputedStyle(document.documentElement).getPropertyValue('--chart-gradient-end').trim();
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, chartGradientStart);
        gradient.addColorStop(1, chartGradientEnd);
        
        // Sample data (replace with real data)
        const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const data = [22.5, 23.1, 23.4, 23.2, 23.8, 24.5, 24.3, 24.9, 25.2, 25.1, 24.8, 25.3, 25.6, 25.4, 25.8, 26.2, 26.5, 26.3, 26.7, 26.9, 27.2, 27.5, 27.8, 28.1];
        
        // Create chart
        this.chartInstances.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Balance (SOL)',
                    data: data,
                    borderColor: chartLine,
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: chartLine,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 4,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A0A0A0',
                            font: {
                                size: 10
                            },
                            maxRotation: 0,
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A0A0A0',
                            font: {
                                size: 10
                            },
                            padding: 10
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    updateChartsTheme() {
        // Update all charts with new theme colors
        if (this.chartInstances.performance) {
            const chartLine = getComputedStyle(document.documentElement).getPropertyValue('--chart-line').trim();
            const chartGradientStart = getComputedStyle(document.documentElement).getPropertyValue('--chart-gradient-start').trim();
            const chartGradientEnd = getComputedStyle(document.documentElement).getPropertyValue('--chart-gradient-end').trim();
            
            const ctx = document.getElementById('performance-chart')?.getContext('2d');
            if (ctx) {
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, chartGradientStart);
                gradient.addColorStop(1, chartGradientEnd);
                
                this.chartInstances.performance.data.datasets[0].borderColor = chartLine;
                this.chartInstances.performance.data.datasets[0].pointBackgroundColor = chartLine;
                this.chartInstances.performance.data.datasets[0].backgroundColor = gradient;
                
                this.chartInstances.performance.update();
            }
        }
    }
    
    // Pairs page
    refreshPairs() {
        const pairsGrid = document.querySelector('.pairs-grid');
        if (!pairsGrid) return;
        
        // Show loading state
        pairsGrid.innerHTML = '<div class="loading-spinner"></div>';
        
        // Get filter values
        const filter = document.getElementById('pairs-filter')?.value || 'new';
        const source = document.getElementById('pairs-source')?.value || 'pump.fun';
        
        // Get additional filter values
        const minLiquidity = parseFloat(document.getElementById('min-liquidity')?.value || 0);
        const minHolders = parseInt(document.getElementById('min-holders')?.value || 0);
        const maxTax = parseFloat(document.getElementById('max-tax')?.value || 100);
        const maxAge = document.getElementById('min-age')?.value || 'all';
        const requireLpLock = document.getElementById('require-lp-lock')?.checked || false;
        const hideScams = document.getElementById('hide-scams')?.checked || false;
        
        // Fetch pairs from API
        this.app.fetchPairs(filter, source)
            .then(pairs => {
                // Apply filters
                const filteredPairs = pairs.filter(pair => {
                    // Liquidity filter
                    if (minLiquidity > 0 && pair.liquidity < minLiquidity) return false;
                    
                    // Holders filter
                    if (minHolders > 0 && pair.holders < minHolders) return false;
                    
                    // Tax filter (using max of buy and sell tax)
                    const maxPairTax = Math.max(pair.buy_tax, pair.sell_tax);
                    if (maxTax < 100 && maxPairTax > maxTax) return false;
                    
                    // Age filter
                    if (maxAge !== 'all') {
                        const pairDate = new Date(pair.created_at);
                        const now = new Date();
                        const diffHours = (now - pairDate) / (1000 * 60 * 60);
                        
                        if (maxAge === '1h' && diffHours > 1) return false;
                        if (maxAge === '6h' && diffHours > 6) return false;
                        if (maxAge === '24h' && diffHours > 24) return false;
                    }
                    
                    // LP Lock filter
                    if (requireLpLock && !pair.lp_locked) return false;
                    
                    // Hide potential scams filter
                    if (hideScams) {
                        // Simple scam detection (high tax, created very recently, or suspicious names)
                        const isSuspicious = maxPairTax > 20 || 
                                             pair.symbol.toLowerCase().includes('scam') || 
                                             pair.name.toLowerCase().includes('scam');
                        if (isSuspicious) return false;
                    }
                    
                    return true;
                });
                
                this.renderPairs(filteredPairs);
            })
            .catch(error => {
                console.error('Error fetching pairs:', error);
                pairsGrid.innerHTML = '<div class="error-message">Failed to load pairs. Please try again.</div>';
            });
    }
    
    renderPairs(pairs) {
        const pairsGrid = document.querySelector('.pairs-grid');
        if (!pairsGrid) return;
        
        if (!pairs || pairs.length === 0) {
            pairsGrid.innerHTML = '<div class="empty-message">No pairs found matching your criteria</div>';
            return;
        }
        
        // Clear grid
        pairsGrid.innerHTML = '';
        
        // Add pairs to grid
        pairs.forEach(pair => {
            const pairCard = document.createElement('div');
            pairCard.className = 'pair-card';
            pairCard.setAttribute('data-address', pair.address);
            
            const changeClass = pair.change_24h >= 0 ? 'positive' : 'negative';
            const changeSign = pair.change_24h >= 0 ? '+' : '';
            
            // Format age in a readable way
            const formattedAge = this.formatAge(pair.created_at);
            
            // Format price with appropriate decimals
            const formattedPrice = pair.price < 0.000001 ? 
                pair.price.toExponential(4) : 
                pair.price.toFixed(8);
                
            // Tax display
            const taxDisplay = pair.buy_tax > 0 || pair.sell_tax > 0 ? 
                `${pair.buy_tax}% / ${pair.sell_tax}%` : 
                'N/A';
                
            // Score calculation (simple version)
            const score = Math.min(100, Math.max(0, 
                50 + // Base score
                (pair.liquidity > 20 ? 15 : pair.liquidity > 5 ? 10 : 0) + // Liquidity bonus
                (pair.holders > 100 ? 15 : pair.holders > 50 ? 10 : 0) + // Holder bonus
                (pair.lp_locked ? 10 : 0) - // LP Lock bonus
                (Math.max(pair.buy_tax, pair.sell_tax) > 10 ? 10 : 0) // Tax penalty
            ));
            
            // Score class
            let scoreClass = 'score-medium';
            if (score >= 80) scoreClass = 'score-high';
            if (score < 50) scoreClass = 'score-low';
            
            pairCard.innerHTML = `
                <div class="pair-symbol">${pair.symbol}</div>
                <div class="pair-price">${formattedPrice} SOL</div>
                <div class="pair-change ${changeClass}">${changeSign}${pair.change_24h.toFixed(2)}%</div>
                
                <div class="pair-details">
                    <div class="pair-volume">Vol: ${pair.volume_24h.toFixed(2)} SOL</div>
                    <div class="pair-liquidity">Liq: ${pair.liquidity.toFixed(2)} SOL</div>
                </div>
                
                <div class="pair-info">
                    <div class="pair-age">Age: ${formattedAge}</div>
                    <div class="pair-holders">Holders: ${pair.holders.toLocaleString()}</div>
                    <div class="pair-tax">Tax: ${taxDisplay}</div>
                    <div class="pair-score ${scoreClass}">Score: ${score}</div>
                </div>
                
                <button class="btn btn-sm btn-primary pair-snipe-btn" data-address="${pair.address}">🐺 Snipe</button>
            `;
            
            pairCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('pair-snipe-btn')) {
                    this.showPairDetails(pair);
                }
            });
            
            pairsGrid.appendChild(pairCard);
        });
        
        // Add event listeners to snipe buttons
        document.querySelectorAll('.pair-snipe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const address = e.target.getAttribute('data-address');
                if (address) {
                    const amount = parseFloat(document.getElementById('quick-amount')?.value || 0.5);
                    this.app.snipeToken(address, amount);
                }
            });
        });
        
        // Add event listeners to filter buttons
        document.getElementById('apply-filters')?.addEventListener('click', () => {
            this.refreshPairs();
        });
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            // Reset filter inputs to defaults
            document.getElementById('min-liquidity').value = 10;
            document.getElementById('min-holders').value = 50;
            document.getElementById('max-tax').value = 10;
            document.getElementById('min-age').value = '24h';
            document.getElementById('require-lp-lock').checked = false;
            document.getElementById('hide-scams').checked = true;
            
            // Refresh with new values
            this.refreshPairs();
        });
    }
    
    showPairDetails(pair) {
        // Update pair details in the UI
        document.getElementById('pair-name').textContent = `${pair.name} (${pair.symbol})`;
        document.getElementById('pair-price').textContent = `${pair.price.toFixed(8)} SOL`;
        
        const changeClass = pair.change_24h >= 0 ? 'positive' : 'negative';
        const changeSign = pair.change_24h >= 0 ? '+' : '';
        document.getElementById('pair-change').textContent = `${changeSign}${pair.change_24h.toFixed(2)}%`;
        document.getElementById('pair-change').className = `stat-value ${changeClass}`;
        
        document.getElementById('pair-volume').textContent = `${pair.volume_24h.toFixed(2)} SOL`;
        document.getElementById('pair-liquidity').textContent = `${pair.liquidity.toFixed(2)} SOL`;
        document.getElementById('pair-holders').textContent = pair.holders.toLocaleString();
        document.getElementById('pair-created').textContent = this.formatAge(pair.created_at);
        
        const lockStatus = pair.lp_locked ? `Yes (until ${new Date(pair.lp_lock_end).toLocaleDateString()})` : 'No';
        document.getElementById('pair-lock').textContent = lockStatus;
        
        document.getElementById('pair-tax').textContent = `${pair.buy_tax}% / ${pair.sell_tax}%`;
        
        // Set up action buttons
        document.getElementById('snipe-pair').setAttribute('data-address', pair.address);
        document.getElementById('view-explorer').setAttribute('data-address', pair.address);
        document.getElementById('view-dexscreener').setAttribute('data-address', pair.address);
        
        // Initialize or update chart
        this.initPairChart(pair);
    }
    
    initPairChart(pair) {
        const ctx = document.getElementById('pair-price-chart')?.getContext('2d');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.chartInstances.pairPrice) {
            this.chartInstances.pairPrice.destroy();
        }
        
        // Get theme colors
        const chartLine = getComputedStyle(document.documentElement).getPropertyValue('--chart-line').trim();
        const chartGradientStart = getComputedStyle(document.documentElement).getPropertyValue('--chart-gradient-start').trim();
        const chartGradientEnd = getComputedStyle(document.documentElement).getPropertyValue('--chart-gradient-end').trim();
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, chartGradientStart);
        gradient.addColorStop(1, chartGradientEnd);
        
        // Sample price data (replace with real data)
        const now = new Date();
        const labels = Array.from({ length: 24 }, (_, i) => {
            const date = new Date(now);
            date.setHours(now.getHours() - (23 - i));
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        
        // Generate sample price data based on current price
        const basePrice = pair.price;
        const volatility = 0.05; // 5% volatility
        const data = Array.from({ length: 24 }, (_, i) => {
            const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
            return basePrice * randomFactor;
        });
        
        // Ensure the last price matches the current price
        data[data.length - 1] = basePrice;
        
        // Create chart
        this.chartInstances.pairPrice = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price (SOL)',
                    data: data,
                    borderColor: chartLine,
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: chartLine,
                    pointBorderColor: '#fff',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        padding: 8,
                        cornerRadius: 4,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A0A0A0',
                            font: {
                                size: 10
                            },
                            maxRotation: 0,
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A0A0A0',
                            font: {
                                size: 10
                            },
                            padding: 8,
                            callback: function(value) {
                                return value.toFixed(8);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    // Helper methods
    formatAge(dateString) {
        const created = new Date(dateString);
        const now = new Date();
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays}d ago`;
        } else if (diffHours > 0) {
            return `${diffHours}h ago`;
        } else {
            return `${diffMins}m ago`;
        }
    }
}

// Export the UI class
window.SniperUI = SniperUI;

// Sidebar Toggle Functionality
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const menuButton = document.querySelector('.menu-button');
const overlay = document.querySelector('.sidebar-overlay');

// Function to toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('expanded');
    mainContent.classList.toggle('sidebar-expanded');
    
    if (window.innerWidth <= 768 && overlay) {
        if (sidebar.classList.contains('expanded')) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
    
    // Save state to localStorage
    localStorage.setItem('sidebarExpanded', sidebar.classList.contains('expanded'));
}

// Initialize sidebar state from localStorage
function initializeSidebar() {
    const sidebarExpanded = localStorage.getItem('sidebarExpanded') === 'true';
    
    if (sidebarExpanded) {
        sidebar.classList.add('expanded');
        mainContent.classList.add('sidebar-expanded');
    }
}

// Event Listeners
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
}

if (menuButton) {
    menuButton.addEventListener('click', toggleSidebar);
}

if (overlay) {
    overlay.addEventListener('click', () => {
        if (sidebar.classList.contains('expanded')) {
            toggleSidebar();
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (overlay) overlay.classList.remove('active');
    } else {
        if (sidebar.classList.contains('expanded') && overlay) {
            overlay.classList.add('active');
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeSidebar);

// Modal functionality for the entire application
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        console.log(`Opened modal: ${modalId}`);
    } else {
        console.error(`Modal not found: ${modalId}`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        console.log(`Closed modal: ${modalId}`);
    }
}

// Call initialization
initializeSidebar();

// Initialize modal buttons
// Wallet connection modal
const connectWalletBtn = document.getElementById('connect-wallet-btn');
if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', function() {
        openModal('wallet-modal');
    });
}

// Settings modal button
const settingsModalBtn = document.getElementById('open-settings-modal');
if (settingsModalBtn) {
    settingsModalBtn.addEventListener('click', function() {
        openModal('sniper-settings-modal');
    });
}

// Filters modal button
const filtersModalBtn = document.getElementById('open-filters-modal');
if (filtersModalBtn) {
    filtersModalBtn.addEventListener('click', function() {
        openModal('filter-settings-modal');
    });
}

// Close modal buttons
document.querySelectorAll('.close-modal, .modal-close-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const modalId = this.closest('.modal').id;
        closeModal(modalId);
    });
});

// Close modal when clicking outside content
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(this.id);
        }
    });
});

// Dashboard tabs functionality
const dashboardTabs = document.querySelectorAll('.dashboard-tab');
if (dashboardTabs.length > 0) {
    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Get the section to show
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all tabs and sections
            document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show the corresponding section
            document.getElementById(`${sectionId}-section`).classList.add('active');
        });
    });
}
