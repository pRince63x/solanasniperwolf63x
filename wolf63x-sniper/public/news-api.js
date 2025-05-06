/* jshint esversion: 8 */

/* jshint esversion: 8 */

// CryptoCompare News API Integration
const NEWS_API_URL = 'https://min-api.cryptocompare.com/data/v2/news/?categories=Meme&sortOrder=latest&lang=EN';

async function fetchLatestNews() {
    try {
        const response = await fetch(NEWS_API_URL);
        const data = await response.json();
        
        if (data.Data) {
            updateNewsGrid(data.Data);
        } else {
            console.error('No news data found');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        showNewsError();
    }
}

function updateNewsGrid(newsItems) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    newsGrid.innerHTML = newsItems.slice(0, 10).map(item => `
        <div class="news-item">
            <div class="news-content">
                <div class="news-header">
                    <img src="${item.imageurl || 'images/default-news.png'}" alt="News Image" class="news-image">
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <span class="news-time">${formatNewsTime(item.published_on)}</span>
                    </div>
                </div>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-body">${truncateText(item.body, 100)}</p>
                <a href="${item.url}" target="_blank" class="news-read-more">
                    Read More <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `).join('');
}

function formatNewsTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showNewsError() {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    newsGrid.innerHTML = `
        <div class="news-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Unable to load news. Please try again later.</p>
        </div>
    `;
}

// Update news every 5 minutes
setInterval(fetchLatestNews, 5 * 60 * 1000);

// Initial news fetch
document.addEventListener('DOMContentLoaded', fetchLatestNews);
