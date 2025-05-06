/**
 * Crypto News Module for Solana Sniper Bot
 * Fetches and displays news related to Solana and memecoins
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the news section
    initCryptoNews();
});

/**
 * Initialize the crypto news section
 */
function initCryptoNews() {
    // Get the news container
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    // Set up filter buttons
    setupNewsFilters();
    
    // Set up refresh button
    setupRefreshButton();
    
    // Initial news load
    fetchCryptoNews('all');
}

/**
 * Set up news filter buttons
 */
function setupNewsFilters() {
    const filterButtons = document.querySelectorAll('.news-filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter type
            const filterType = this.getAttribute('data-filter');
            
            // Fetch news with the selected filter
            fetchCryptoNews(filterType);
        });
    });
}

/**
 * Set up refresh button for news
 */
function setupRefreshButton() {
    const refreshButton = document.querySelector('.refresh-news-btn');
    
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // Get current active filter
            const activeFilter = document.querySelector('.news-filter-btn.active');
            const filterType = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
            
            // Add spinner class to the refresh button
            this.querySelector('i').classList.add('fa-spin');
            
            // Fetch news
            fetchCryptoNews(filterType).then(() => {
                // Remove spinner class after 1 second
                setTimeout(() => {
                    this.querySelector('i').classList.remove('fa-spin');
                }, 1000);
            });
        });
    }
}

/**
 * Fetch crypto news from multiple sources including Google News API and YouTube
 * @param {string} filter - The news filter to apply (all, solana, memecoins, trending)
 * @returns {Promise} - A promise that resolves when all news is fetched
 */
async function fetchCryptoNews(filter = 'all') {
    // Show loading state
    showNewsLoadingState();
    
    try {
        // Pre-fetch and cache images to prevent layout shift
        await preloadNewsImages(getAllNewsImages());
        
        // In a real implementation, we would use actual API calls
        // For now, we'll use simulated data that includes Google News format
        
        // Simulated API calls to multiple news sources including Google News and YouTube
        const newsData = await Promise.all([
            fetchFromYouTube(filter),   // YouTube videos (simulated)
            fetchFromGoogleNews(filter), // Google News API (simulated)
            fetchFromNewsAPI(filter),
            fetchFromCryptoCompare(filter),
            fetchFromCoinDesk(filter),
            fetchFromCointelegraph(filter)
        ]);
        
        // Combine and sort news by date
        const combinedNews = [].concat(...newsData)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Display the news
        displayNews(combinedNews, filter);
        
        return Promise.resolve();
    } catch (error) {
        console.error('Error fetching crypto news:', error);
        displayErrorMessage('Failed to load news. Please try again later.');
        
        return Promise.reject(error);
    }
}

/**
 * Pre-fetch and cache images to prevent layout shift
 * @param {Array} imageUrls - Array of image URLs to preload
 * @returns {Promise} - A promise that resolves when all images are loaded
 */
function preloadNewsImages(imageUrls) {
    const imagePromises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(url);
            img.src = url;
        });
    });
    
    return Promise.allSettled(imagePromises);
}

/**
 * Get all possible news images for preloading
 * @returns {Array} - Array of all news image URLs
 */
function getAllNewsImages() {
    return [
        // News images
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/22d67c12-a9ee-4f58-1c07-39d6bade3500/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/dffb8ad9-20a3-413e-8d40-31c270c86100/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/dbe6f52a-c76e-4cfe-0fbe-a74d84e73c00/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/cc20de16-be34-4ea5-9c76-03c471ca0300/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/8fe20de8-7f4e-404e-3318-9fe2c7cfac00/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/a4a1e5e6-9fd0-4cd9-af1e-21a345f32200/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/0d00a2f3-35d7-4c41-bd84-c1f8b4a29b00/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/cc63dbfb-c410-43c0-fba7-80af1b96f200/public",
        "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/9fe20de8-7f4e-409e-3318-9fe2c7cfad23/public",
        "https://neurosciencenews.com/files/2023/06/belly-fat-neuroscience-public.jpg",
        
        // YouTube thumbnails
        "https://i.ytimg.com/vi/qNIAHj3is7Y/hqdefault.jpg",
        "https://i.ytimg.com/vi/dJQEx5O95Rk/hqdefault.jpg",
        "https://i.ytimg.com/vi/L7R9uxQSCXQ/hqdefault.jpg",
        "https://i.ytimg.com/vi/9nvRU35QPZ0/hqdefault.jpg"
    ];
}

/**
 * Show loading state for news
 */
function showNewsLoadingState() {
    const newsContainer = document.getElementById('news-container');
    
    if (newsContainer) {
        newsContainer.innerHTML = `
            <div class="news-loading">
                <div class="spinner"></div>
                <div>Loading latest news...</div>
            </div>
        `;
    }
}

/**
 * Display error message
 * @param {string} message - The error message to display
 */
function displayErrorMessage(message) {
    const newsContainer = document.getElementById('news-container');
    
    if (newsContainer) {
        newsContainer.innerHTML = `
            <div class="news-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * Display news in the news container
 * @param {Array} news - Array of news items
 * @param {string} filter - The applied filter
 */
function displayNews(news, filter) {
    const newsContainer = document.getElementById('news-container');
    
    if (!newsContainer) return;
    
    // Clear the container
    newsContainer.innerHTML = '';
    
    if (news.length === 0) {
        newsContainer.innerHTML = `
            <div class="news-empty">
                <i class="fas fa-newspaper"></i>
                <p>No ${filter !== 'all' ? filter + ' ' : ''}news available at the moment.</p>
            </div>
        `;
        return;
    }
    
    // Create 50/50 split container
    const splitContainer = document.createElement('div');
    splitContainer.className = 'news-split-container';
    newsContainer.appendChild(splitContainer);
    
    // Create left column
    const leftColumn = document.createElement('div');
    leftColumn.className = 'news-column left-column';
    splitContainer.appendChild(leftColumn);
    
    // Create right column
    const rightColumn = document.createElement('div');
    rightColumn.className = 'news-column right-column';
    splitContainer.appendChild(rightColumn);
    
    // Separate videos and regular news
    const videoItems = news.filter(item => item.type === 'video');
    const newsItems = news.filter(item => item.type !== 'video');
    
    // Sort by date
    const sortedItems = [...videoItems, ...newsItems].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Distribute items between columns
    sortedItems.forEach((item, index) => {
        const column = index % 2 === 0 ? leftColumn : rightColumn;
        createNewsItem(item, column);
    });
    
    // Add inline CSS for news styling if not already present
    if (!document.getElementById('compact-news-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'compact-news-styles';
        styleEl.textContent = `
            .news-split-container {
                display: flex;
                gap: 15px;
                height: 100%;
            }
            
            .news-column {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 0 5px;
            }
            
            .compact-news-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                cursor: pointer;
                transition: background-color 0.2s ease;
                border-radius: 6px;
            }
            
            .compact-news-item:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            .news-content-wrapper {
                flex: 1;
                padding-right: 15px;
                overflow: hidden;
            }
            
            .news-headline {
                font-size: 14px;
                font-weight: 600;
                color: #fff;
                margin: 0 0 8px 0;
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .news-source-info {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }
            
            .news-source-icon {
                width: 16px;
                height: 16px;
                border-radius: 3px;
                overflow: hidden;
                margin-right: 6px;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .news-source-icon img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .news-source-name {
                font-weight: 500;
            }
            
            .news-time-separator {
                margin: 0 5px;
            }
            
            .news-time {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .news-thumbnail {
                width: 70px;
                height: 70px;
                border-radius: 8px;
                overflow: hidden;
                flex-shrink: 0;
                position: relative;
            }
            
            .news-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .video-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 24px;
                height: 24px;
                background: rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .video-indicator i {
                color: #fff;
                font-size: 10px;
            }
            
            .video-duration {
                position: absolute;
                bottom: 4px;
                right: 4px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                font-size: 10px;
                padding: 1px 4px;
                border-radius: 2px;
                font-weight: 500;
            }
            
            /* Custom scrollbar styling */
            .news-column::-webkit-scrollbar {
                width: 5px;
            }
            
            .news-column::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
            }
            
            .news-column::-webkit-scrollbar-thumb {
                background: rgba(100, 100, 150, 0.5);
                border-radius: 5px;
            }
            
            .news-column::-webkit-scrollbar-thumb:hover {
                background: rgba(100, 100, 150, 0.8);
            }
        `;
        document.head.appendChild(styleEl);
    }
}

/**
 * Create a news item and append it to the container
 * @param {Object} item - The news item
 * @param {HTMLElement} container - The container to append to
 */
function createNewsItem(item, container) {
    const newsItem = document.createElement('div');
    newsItem.className = 'compact-news-item';
    
    const dateFormatted = formatDate(item.date);
    
    // Create HTML based on item type
    let thumbnailHtml = '';
    
    if (item.type === 'video') {
        thumbnailHtml = `
            <div class="news-thumbnail">
                <img src="${item.thumbnail}" alt="" />
                <div class="video-indicator">
                    <i class="fas fa-play"></i>
                </div>
                <div class="video-duration">${item.duration}</div>
            </div>
        `;
    } else {
        thumbnailHtml = `
            <div class="news-thumbnail">
                <img src="${item.image}" alt="" />
            </div>
        `;
    }
    
    newsItem.innerHTML = `
        <div class="news-content-wrapper">
            <h3 class="news-headline">${item.title}</h3>
            <div class="news-source-info">
                <div class="news-source-icon">
                    <img src="${getSourceIcon(item.source)}" alt="${item.source}" />
                </div>
                <span class="news-source-name">${item.source}</span>
                <span class="news-time-separator">•</span>
                <span class="news-time">${dateFormatted}</span>
            </div>
        </div>
        ${thumbnailHtml}
    `;
    
    // Add click event to open the article or video
    newsItem.addEventListener('click', () => {
        window.open(item.url, '_blank');
    });
    
    container.appendChild(newsItem);
}

/**
 * Format date to a readable string
 * @param {string} dateStr - The date string
 * @returns {string} - The formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffMin < 1) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }
}

/**
 * Simulated fetch from News API
 * @param {string} filter - The news filter to apply
 * @returns {Promise<Array>} - A promise that resolves with news data
 */
function fetchFromNewsAPI(filter) {
    return new Promise(resolve => {
        setTimeout(() => {
            const news = [
                {
                    title: "Solana Price Surges 15% on Layer 2 Development Announcement",
                    excerpt: "Solana's native token SOL has experienced a significant price increase following the announcement of a new Layer 2 scaling solution. This development aims to enhance the blockchain's already impressive throughput and reduce transaction costs further.",
                    date: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/22d67c12-a9ee-4f58-1c07-39d6bade3500/public",
                    source: "CryptoNewsAPI",
                    url: "https://solana.com/news",
                    category: "Solana",
                    type: "article"
                },
                {
                    title: "BONK Memecoin Launches NFT Marketplace on Solana",
                    excerpt: "The popular Solana-based memecoin BONK has expanded its ecosystem with the launch of a dedicated NFT marketplace. The platform will feature exclusive collections and aims to compete with established Solana NFT marketplaces.",
                    date: new Date(new Date().getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/dffb8ad9-20a3-413e-8d40-31c270c86100/public",
                    source: "CryptoNewsAPI",
                    url: "https://bonkcoin.com",
                    category: "Memecoin",
                    type: "article"
                }
            ];
            
            // Filter news based on the selected filter
            const filteredNews = filterNews(news, filter);
            resolve(filteredNews);
        }, 300);
    });
}

/**
 * Simulated fetch from CryptoCompare
 * @param {string} filter - The news filter to apply
 * @returns {Promise<Array>} - A promise that resolves with news data
 */
function fetchFromCryptoCompare(filter) {
    return new Promise(resolve => {
        setTimeout(() => {
            const news = [
                {
                    title: "Solana Ecosystem Growth Exceeds Expectations in Q2 2023",
                    excerpt: "The Solana ecosystem has shown remarkable growth in Q2 2023, with the number of active developers increasing by 40% and daily active addresses reaching an all-time high of over 2 million.",
                    date: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/dbe6f52a-c76e-4cfe-0fbe-a74d84e73c00/public",
                    source: "CryptoCompare",
                    url: "https://solana.org/ecosystem",
                    category: "Solana",
                    type: "article"
                },
                {
                    title: "New Trading Pairs for Top Memecoins Added to Major Exchanges",
                    excerpt: "Several major cryptocurrency exchanges have announced the addition of new trading pairs for popular memecoins, including DOGE, SHIB, and emerging Solana-based tokens. This expansion indicates increasing mainstream interest in the memecoin sector.",
                    date: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/cc20de16-be34-4ea5-9c76-03c471ca0300/public",
                    source: "CryptoCompare",
                    url: "https://cryptocompare.com/coins/list",
                    category: "Memecoin",
                    type: "article"
                }
            ];
            
            // Filter news based on the selected filter
            const filteredNews = filterNews(news, filter);
            resolve(filteredNews);
        }, 500);
    });
}

/**
 * Simulated fetch from CoinDesk
 * @param {string} filter - The news filter to apply
 * @returns {Promise<Array>} - A promise that resolves with news data
 */
function fetchFromCoinDesk(filter) {
    return new Promise(resolve => {
        setTimeout(() => {
            const news = [
                {
                    title: "Solana Foundation Announces $10M Developer Grant Program",
                    excerpt: "The Solana Foundation has unveiled a new $10 million grant program aimed at supporting developers building innovative applications on the Solana blockchain. The initiative focuses on DeFi, NFTs, and gaming projects.",
                    date: new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/8fe20de8-7f4e-404e-3318-9fe2c7cfac00/public",
                    source: "CoinDesk",
                    url: "https://coindesk.com/solana-news",
                    category: "Solana",
                    type: "article"
                },
                {
                    title: "Crypto Market Reaches $2 Trillion Market Cap as Bitcoin Soars",
                    excerpt: "The total cryptocurrency market capitalization has surpassed $2 trillion for the first time in over a year, with Bitcoin leading the charge. Altcoins and memecoins have also seen significant gains in this broader market rally.",
                    date: new Date(new Date().getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/a4a1e5e6-9fd0-4cd9-af1e-21a345f32200/public",
                    source: "CoinDesk",
                    url: "https://coindesk.com/markets",
                    category: "Trending",
                    type: "article"
                }
            ];
            
            // Filter news based on the selected filter
            const filteredNews = filterNews(news, filter);
            resolve(filteredNews);
        }, 400);
    });
}

/**
 * Simulated fetch from Cointelegraph
 * @param {string} filter - The news filter to apply
 * @returns {Promise<Array>} - A promise that resolves with news data
 */
function fetchFromCointelegraph(filter) {
    return new Promise(resolve => {
        setTimeout(() => {
            const news = [
                {
                    title: "Memecoin Frenzy: New Dog-Themed Token Gains 500% in 24 Hours",
                    excerpt: "A new dog-themed memecoin has skyrocketed by 500% within 24 hours of its launch, capturing the attention of retail investors. The token, built on Solana, has already achieved a market cap of over $100 million despite being less than a week old.",
                    date: new Date(new Date().getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/0d00a2f3-35d7-4c41-bd84-c1f8b4a29b00/public",
                    source: "Cointelegraph",
                    url: "https://cointelegraph.com/tags/memecoins",
                    category: "Memecoin",
                    type: "article"
                },
                {
                    title: "Institutional Investors Turn Attention to Solana as DeFi TVL Grows",
                    excerpt: "Major institutional investors are increasingly exploring opportunities in the Solana ecosystem as the blockchain's Total Value Locked (TVL) in DeFi protocols reaches new heights. This interest marks a significant shift in institutional attitudes toward alternative Layer 1 solutions.",
                    date: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/cc63dbfb-c410-43c0-fba7-80af1b96f200/public",
                    source: "Cointelegraph",
                    url: "https://cointelegraph.com/solana-price-index",
                    category: "Solana",
                    type: "article"
                }
            ];
            
            // Filter news based on the selected filter
            const filteredNews = filterNews(news, filter);
            resolve(filteredNews);
        }, 600);
    });
}

/**
 * Filter news based on the selected filter
 * @param {Array} news - Array of news items
 * @param {string} filter - The filter to apply
 * @returns {Array} - Filtered news array
 */
function filterNews(news, filter) {
    if (filter === 'all') {
        return news;
    }
    
    return news.filter(item => {
        if (filter === 'solana' && item.category === 'Solana') {
            return true;
        } else if (filter === 'memecoins' && item.category === 'Memecoin') {
            return true;
        } else if (filter === 'trending' && item.category === 'Trending') {
            return true;
        }
        return false;
    });
}

/**
 * Get icon URL for news source
 * @param {string} source - The news source name
 * @returns {string} - URL to the source icon
 */
function getSourceIcon(source) {
    const icons = {
        'CryptoNewsAPI': 'https://cryptonews.com/favicon-32x32.png',
        'CryptoCompare': 'https://www.cryptocompare.com/favicon.ico',
        'CoinDesk': 'https://www.coindesk.com/favicon-16x16.png',
        'Cointelegraph': 'https://cointelegraph.com/assets/img/favicon/favicon-32x32.png',
        'Neuroscience News': 'https://neurosciencenews.com/wp-content/uploads/2019/03/neurosciencenews-favicon.png',
        'Google News': 'https://www.google.com/favicon.ico',
        'YouTube': 'https://www.youtube.com/s/desktop/a159938b/img/favicon_32x32.png'
    };
    
    return icons[source] || 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png';
}

/**
 * Simulated fetch from Google News API for Solana and memecoin news
 * @param {string} filter - The news filter to apply
 * @returns {Promise<Array>} - A promise that resolves with news data
 */
function fetchFromGoogleNews(filter) {
    return new Promise(resolve => {
        setTimeout(() => {
            // Simulated Google News API response
            const news = [
                {
                    title: "Why Solana's TVL Has Grown 6x This Year While ETH's Has Stagnated",
                    excerpt: "Solana's total value locked (TVL) has increased more than 500% in 2023, while Ethereum's has remained relatively flat.",
                    date: new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/9fe20de8-7f4e-409e-3318-9fe2c7cfad23/public",
                    source: "Google News",
                    url: "https://www.google.com/news",
                    category: "Solana",
                    type: "article"
                },
                {
                    title: "BONK and Other Solana Memecoins Surge as Market Recovers",
                    excerpt: "Solana-based memecoins like BONK, POPCAT, and SILLY are experiencing significant gains following the market-wide recovery.",
                    date: new Date(new Date().getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/dffb8ad9-20a3-413e-8d40-31c270c86400/public",
                    source: "Google News",
                    url: "https://www.google.com/news",
                    category: "Memecoin",
                    type: "article"
                },
                {
                    title: "New Solana Wallet Vulnerability Discovered: What You Need to Know",
                    excerpt: "Security researchers have identified a potential vulnerability in certain Solana wallet implementations.",
                    date: new Date(new Date().getTime() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
                    image: "https://imagedelivery.net/2PEfJ8m9GxCvZZwxJLOnJw/cc63dbfb-c410-43c0-fba7-80af1b96f500/public",
                    source: "Google News",
                    url: "https://www.google.com/news",
                    category: "Solana",
                    type: "article"
                },
                {
                    title: "Why Belly Fat Expands With Age, and How to Target It",
                    excerpt: "Researchers have identified specific biological mechanisms that contribute to increased belly fat accumulation as people age.",
                    date: new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                    image: "https://neurosciencenews.com/files/2023/06/belly-fat-neuroscience-public.jpg",
                    source: "Neuroscience News",
                    url: "https://neurosciencenews.com/aging-belly-fat-23368/",
                    category: "Trending",
                    type: "article"
                }
            ];
            
            // Filter news based on the selected filter
            const filteredNews = filterNews(news, filter);
            resolve(filteredNews);
        }, 350);
    });
}

/**
 * Simulated fetch from YouTube
 * @param {string} filter - The news filter to apply
 * @returns {Promise<Array>} - A promise that resolves with video data
 */
function fetchFromYouTube(filter) {
    return new Promise(resolve => {
        setTimeout(() => {
            // Simulated YouTube API response
            const videos = [
                {
                    title: "Solana Ecosystem Overview 2023: Projects, Ecosystem, and Future Growth",
                    excerpt: "A comprehensive walkthrough of the Solana ecosystem in 2023, covering major projects, infrastructure, and growth potential.",
                    date: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    thumbnail: "https://i.ytimg.com/vi/qNIAHj3is7Y/hqdefault.jpg",
                    source: "YouTube",
                    url: "https://www.youtube.com/watch?v=qNIAHj3is7Y",
                    category: "Solana",
                    type: "video",
                    duration: "12:34"
                },
                {
                    title: "5 Best Solana Memecoins with 10x Potential for 2023",
                    excerpt: "Analyzing the top Solana-based memecoins that have significant growth potential in the current market cycle.",
                    date: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    thumbnail: "https://i.ytimg.com/vi/dJQEx5O95Rk/hqdefault.jpg",
                    source: "YouTube",
                    url: "https://www.youtube.com/watch?v=dJQEx5O95Rk",
                    category: "Memecoin",
                    type: "video",
                    duration: "8:47"
                },
                {
                    title: "How to Use Solana Sniper Bot: Complete Tutorial for Beginners",
                    excerpt: "A step-by-step guide on setting up and using a Solana sniper bot to catch new token launches and potential gems.",
                    date: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
                    thumbnail: "https://i.ytimg.com/vi/L7R9uxQSCXQ/hqdefault.jpg",
                    source: "YouTube",
                    url: "https://www.youtube.com/watch?v=L7R9uxQSCXQ",
                    category: "Solana",
                    type: "video",
                    duration: "15:22"
                },
                {
                    title: "Solana DeFi Explained: Top Protocols and How They Work",
                    excerpt: "An in-depth explanation of the Solana DeFi ecosystem, covering major protocols, yield farming opportunities, and unique features.",
                    date: new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
                    thumbnail: "https://i.ytimg.com/vi/9nvRU35QPZ0/hqdefault.jpg",
                    source: "YouTube",
                    url: "https://www.youtube.com/watch?v=9nvRU35QPZ0",
                    category: "Solana",
                    type: "video",
                    duration: "18:05"
                }
            ];
            
            // Filter videos based on the selected filter
            const filteredVideos = filterVideos(videos, filter);
            resolve(filteredVideos);
        }, 400);
    });
}

/**
 * Filter videos based on the selected filter
 * @param {Array} videos - Array of video items
 * @param {string} filter - The filter to apply
 * @returns {Array} - Filtered videos array
 */
function filterVideos(videos, filter) {
    if (filter === 'all') {
        return videos;
    }
    
    return videos.filter(item => {
        if (filter === 'solana' && item.category === 'Solana') {
            return true;
        } else if (filter === 'memecoins' && item.category === 'Memecoin') {
            return true;
        } else if (filter === 'trending' && item.category === 'Trending') {
            return true;
        }
        return false;
    });
} 