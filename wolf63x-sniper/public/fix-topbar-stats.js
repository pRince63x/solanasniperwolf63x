// Script to fix the top-bar and stats-info-inline elements

document.addEventListener('DOMContentLoaded', () => {
    // Fix Total PNL stat value
    const totalPnlElement = document.getElementById('total-pnl');
    if (totalPnlElement) {
        // Clear any nested content and set a clean value
        totalPnlElement.innerHTML = '0.00';
    }

    // Fix Daily Volume stat value
    const dailyVolumeElement = document.getElementById('daily-volume');
    if (dailyVolumeElement) {
        // Clear any nested content and set a clean value
        dailyVolumeElement.innerHTML = '0.00';
    }

    // Make sure the top-bar stays at the top
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        // Force the top bar to the top of the page
        topBar.style.position = 'fixed';
        topBar.style.top = '0';
        topBar.style.left = '0';
        topBar.style.width = '100%';
        topBar.style.zIndex = '1000';
        
        // Get computed height of top bar to set proper spacing
        const topBarHeight = topBar.offsetHeight;
        
        // Fix main content spacing
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.paddingTop = `${topBarHeight + 10}px`;
        }
        
        // Adjust sidebar position
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.top = `${topBarHeight}px`;
            sidebar.style.height = `calc(100vh - ${topBarHeight}px)`;
        }
    }
    
    // Fix the stats-info-inline container
    const statsInfoInline = document.getElementById('context-stats');
    if (statsInfoInline) {
        // Ensure proper layout with flexbox
        statsInfoInline.style.display = 'flex';
        statsInfoInline.style.flexWrap = 'wrap';
        statsInfoInline.style.gap = '1rem';
        statsInfoInline.style.width = '100%';
        statsInfoInline.style.position = 'relative';
        statsInfoInline.style.zIndex = '1';
        
        // Remove any nested duplicate stats-info-inline elements
        const nestedStatsInfos = statsInfoInline.querySelectorAll('.stats-info-inline');
        nestedStatsInfos.forEach(nested => {
            nested.parentNode.removeChild(nested);
        });
    }
}); 