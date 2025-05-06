class PairsHandler {
    constructor() {
        this.pairs = [];
        this.updateInterval = null;
        this.initialize();
    }

    async initialize() {
        try {
            // Initial fetch
            await this.fetchNewPairs();
            
            // Set up periodic updates
            // Update frequency: every 0.3 seconds (300ms)
            this.updateInterval = setInterval(() => this.fetchNewPairs(), 300); // Update every 0.3 seconds
            
            // Add event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing pairs handler:', error);
            this.showError('Failed to initialize pairs data');
        }
    }

    setupEventListeners() {
        // Add event listener for refresh button if it exists
        const refreshButton = document.getElementById('refresh-pairs');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.fetchNewPairs());
        }
    }

    async fetchNewPairs() {
        try {
            // Fetch data from backend API (populated by Rust scanner)
            const response = await fetch('/api/opportunities');
            if (!response.ok) throw new Error('Failed to fetch from backend');
            const data = await response.json();
            if (data && Array.isArray(data)) {
                this.pairs = data;
                this.updatePairsList();
            }
        } catch (error) {
            console.error('Error fetching pairs:', error);
            this.showError('Failed to fetch new pairs');
        }
    }

    updatePairsList() {
        const pairsList = document.getElementById('pairs-list');
        if (!pairsList) return;

        // Clear existing pairs
        pairsList.innerHTML = '';

        // Add new pairs
        this.pairs.forEach(pair => {
            const pairElement = this.createPairElement(pair);
            pairsList.appendChild(pairElement);
        });
    }

    createPairElement(pair) {
        const div = document.createElement('div');
        div.className = 'pair-item';
        
        // Format creation time
        const createdAt = new Date(pair.createdAt);
        const timeAgo = this.getTimeAgo(createdAt);
        
        // Create pair content
        div.innerHTML = `
            <div class="pair-info">
                <div class="pair-name">${pair.name} (${pair.symbol})</div>
                <div class="pair-details">
                    <span class="pair-price">$${this.formatNumber(pair.price)}</span>
                    <span class="pair-volume">24h Vol: $${this.formatNumber(pair.volume24h)}</span>
                </div>
                <div class="pair-meta">
                    <span class="pair-time">Created ${timeAgo}</span>
                    <span class="pair-liquidity">Liquidity: $${this.formatNumber(pair.liquidity)}</span>
                </div>
            </div>
            <div class="pair-actions">
                <button class="action-btn buy" onclick="window.walletHandler.buyToken('${pair.address}')">Buy</button>
                <button class="action-btn chart" onclick="window.charts.showTokenChart('${pair.address}')">Chart</button>
            </div>
        `;

        return div;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        
        return Math.floor(seconds) + ' seconds ago';
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('active'), 10);
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize pairs handler when the window is fully loaded
window.addEventListener('load', () => {
    try {
        window.pairsHandler = new PairsHandler();
    } catch (error) {
        console.error('Failed to initialize pairs handler:', error);
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = 'Failed to initialize pairs data. Please refresh the page.';
        document.body.appendChild(notification);
    }
}); 