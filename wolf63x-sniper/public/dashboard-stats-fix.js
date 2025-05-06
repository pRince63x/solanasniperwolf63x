/**
 * Dashboard Stats Fix for Wolf63x Sniper Bot
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fix Solana logo in stats with FontAwesome icon
    const replaceLogoWithIcon = () => {
        // Find all SOL logos/icons in stats
        const statLogos = document.querySelectorAll('.stat-display .sol-icon, .stat-display .sol-logo');
        
        statLogos.forEach(function(logo) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-coins';
            icon.style.color = '#14F195';
            icon.style.fontSize = '16px';
            icon.style.verticalAlign = 'middle';
            icon.style.marginRight = '5px';
            
            // Replace the img with the icon
            if (logo.parentNode) {
                logo.parentNode.replaceChild(icon, logo);
            }
        });
    };
    
    // Ensure the stats container is properly visible
    const fixStatsContainer = () => {
        const statsContainer = document.getElementById('context-stats');
        
        if (statsContainer) {
            // Make sure the stats container is visible
            statsContainer.style.display = 'flex';
            statsContainer.style.flexWrap = 'wrap';
            statsContainer.style.gap = '1rem';
            statsContainer.style.width = '100%';
            statsContainer.style.padding = '0.5rem 0';
            statsContainer.style.zIndex = '1';
            
            // Add some padding if not already present
            if (!statsContainer.style.padding) {
                statsContainer.style.padding = '0.5rem 1rem';
            }
            
            // Ensure the stats are aligned properly
            const statElements = statsContainer.querySelectorAll('.stat-display');
            statElements.forEach(stat => {
                stat.style.display = 'inline-flex';
                stat.style.alignItems = 'center';
                stat.style.whiteSpace = 'nowrap';
                stat.style.margin = '0 0.5rem 0 0';
            });
            
            // Make sure stat labels have correct styling
            const statLabels = statsContainer.querySelectorAll('.stat-label');
            statLabels.forEach(label => {
                label.style.marginRight = '0.3rem';
                label.style.color = 'rgba(255, 255, 255, 0.7)';
                label.style.fontSize = '0.9rem';
            });
            
            // Make sure stat values have correct styling
            const statValues = statsContainer.querySelectorAll('.stat-value');
            statValues.forEach(value => {
                value.style.fontWeight = '600';
                value.style.fontSize = '0.9rem';
            });
            
            // Properly style the positive and negative values
            const positiveValues = statsContainer.querySelectorAll('.stat-value.positive');
            positiveValues.forEach(value => {
                value.style.color = '#57ca84';
            });
            
            const negativeValues = statsContainer.querySelectorAll('.stat-value.negative');
            negativeValues.forEach(value => {
                value.style.color = '#ff3b5c';
            });
        }
    };
    
    // Fix for stat values that contain nested divs
    const fixStatValues = () => {
        // Fix Total PNL stat value
        const totalPnl = document.getElementById('total-pnl');
        if (totalPnl) {
            const nestedStats = totalPnl.querySelector('#context-stats');
            if (nestedStats) {
                // Remove nested stats
                nestedStats.remove();
                // Set default value if empty
                if (totalPnl.textContent.trim() === '') {
                    totalPnl.textContent = '0.00';
                }
            }
        }

        // Fix Daily Volume stat value
        const dailyVolume = document.getElementById('daily-volume');
        if (dailyVolume) {
            const nestedStats = dailyVolume.querySelector('#context-stats');
            if (nestedStats) {
                // Remove nested stats
                nestedStats.remove();
                // Set default value if empty
                if (dailyVolume.textContent.trim() === '') {
                    dailyVolume.textContent = '0.00';
                }
            }
        }
        
        // Remove any SOL price displays if found
        const solPrice = document.getElementById('sol-price');
        if (solPrice && solPrice.parentElement && solPrice.parentElement.classList.contains('stat-display')) {
            solPrice.parentElement.remove();
        }
        
        // Remove any standalone Solana price displays
        const solanaPriceElements = document.querySelectorAll('.solana-price');
        solanaPriceElements.forEach(element => {
            element.remove();
        });
    };
    
    // Apply fixes
    const applyFixes = () => {
        replaceLogoWithIcon();
        fixStatsContainer();
        fixStatValues();
        
        // Make sure dashboard stats title is visible and properly styled
        const statsTitle = document.getElementById('stats-title');
        if (statsTitle) {
            statsTitle.style.color = '#57ca84';
            statsTitle.style.fontWeight = 'bold';
            statsTitle.style.marginRight = '1rem';
        }
    };
    
    // Initial fixes
    applyFixes();
    
    // Observe for changes in the context-stats element
    // This is needed because navigation.js updates this content
    const observer = new MutationObserver(function(mutations) {
        // When context-stats changes, reapply our fixes
        applyFixes();
    });
    
    const contextStats = document.getElementById('context-stats');
    if (contextStats) {
        observer.observe(contextStats, { childList: true, subtree: true });
    }
    
    // When navigation occurs, make sure stats are updated
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Allow time for navigation-behavior.js to update stats
            setTimeout(applyFixes, 100);
        });
    });
    
    console.log('Dashboard stats fix applied');
}); 