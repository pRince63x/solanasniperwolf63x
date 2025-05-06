/*jshint esversion: 8 */

// Pump.fun API integration
const PUMP_FUN_API_URL = 'https://pump.fun/api/v1';

class MemecoinsAPI {
    constructor() {
        this.latestMemecoin = null;
        this.updateInterval = 10000; // Update every 10 seconds
        this.isPolling = false;
    }

    async fetchLatestMemecoins() {
        try {
            const response = await fetch(`${PUMP_FUN_API_URL}/tokens/latest`);
            if (!response.ok) {
                throw new Error('Failed to fetch from Pump.fun API');
            }
            const data = await response.json();
            const processed = this.processLatestMemecoin(data);
            this.updateDisplay(processed);
            return processed;
        } catch (error) {
            console.error('Error fetching memecoins:', error);
            this.showError();
            return null;
        }
    }

    processLatestMemecoin(data) {
        if (!data || !data.length) return null;
        const latest = data[0]; // Get the most recent token
        return {
            symbol: latest.symbol,
            name: latest.name,
            timestamp: new Date(latest.created_at),
            price: latest.price || 'N/A',
            marketCap: latest.market_cap || 'N/A',
            change24h: latest.price_change_24h || 0
        };
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    formatPrice(price) {
        if (price === 'N/A') return 'N/A';
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        });
        return formatter.format(price);
    }

    updateDisplay(memecoin) {
        if (!memecoin) return;

        const latestElement = document.getElementById('latest-memecoin');
        const timeElement = document.getElementById('memecoin-time');
        const priceElement = document.getElementById('memecoin-price');

        if (latestElement) {
            latestElement.textContent = `${memecoin.symbol} (${memecoin.name})`;
        }

        if (timeElement) {
            timeElement.textContent = this.formatTimeAgo(memecoin.timestamp);
        }

        if (priceElement) {
            const priceText = this.formatPrice(memecoin.price);
            const changeClass = memecoin.change24h >= 0 ? 'positive' : 'negative';
            const changeIcon = memecoin.change24h >= 0 ? '↑' : '↓';
            priceElement.innerHTML = `${priceText} <span class="${changeClass}">${changeIcon} ${Math.abs(memecoin.change24h).toFixed(2)}%</span>`;
        }
    }

    showError() {
        const elements = ['latest-memecoin', 'memecoin-time', 'memecoin-price'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = 'Error loading data';
            }
        });
    }

    startPolling() {
        if (this.isPolling) return;
        this.isPolling = true;
        
        // Initial fetch
        this.fetchLatestMemecoins();
        
        // Set up polling interval
        setInterval(() => {
            this.fetchLatestMemecoins();
        }, this.updateInterval);
    }
}

// Initialize and start the memecoin updates
const initMemecoinUpdates = function() {
    const memecoinsAPI = new MemecoinsAPI();
    memecoinsAPI.startPolling();
};

document.addEventListener('DOMContentLoaded', initMemecoinUpdates);
