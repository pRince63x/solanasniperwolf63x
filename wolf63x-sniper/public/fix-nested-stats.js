/**
 * Fix for nested duplicate stats elements in index.html
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fix 1: Remove nested duplicate stats-info-inline elements
    function cleanupNestedStats() {
        // Find all stats-info-inline elements with id="context-stats"
        const primaryStatsContainer = document.getElementById('context-stats');
        
        // If found, clean up nested duplicates
        if (primaryStatsContainer) {
            // Check if this element is nested within other elements where it shouldn't be
            const statValues = document.querySelectorAll('.stat-value');
            statValues.forEach(value => {
                // Look for nested context-stats elements inside stat-value elements
                const nestedStats = value.querySelector('#context-stats');
                if (nestedStats) {
                    // Remove the nested duplicate
                    nestedStats.remove();
                    
                    // If the value is now empty, set a default value
                    if (value.textContent.trim() === '') {
                        if (value.id === 'total-pnl') {
                            value.textContent = '0.00';
                        } else if (value.id === 'daily-volume') {
                            value.textContent = '0.00';
                        } else {
                            value.textContent = '0';
                        }
                    }
                }
            });
            
            // Clean up any additional nested stats-info-inline elements
            const nestedStatsInfos = primaryStatsContainer.querySelectorAll('.stats-info-inline');
            nestedStatsInfos.forEach(nested => {
                if (nested !== primaryStatsContainer) {
                    // Transfer any content to the parent
                    while (nested.firstChild) {
                        primaryStatsContainer.appendChild(nested.firstChild);
                    }
                    // Remove the empty nested element
                    nested.remove();
                }
            });
        }
    }
    
    // Fix 2: Ensure stats elements don't have unwanted styles
    function cleanupStatsStyles() {
        const contextStats = document.getElementById('context-stats');
        if (contextStats) {
            // Remove any unwanted margin/padding that might be causing layout issues
            contextStats.style.paddingTop = '0.5rem';
            contextStats.style.paddingBottom = '0.5rem';
            contextStats.style.marginTop = '0.5rem';
            contextStats.style.marginBottom = '0.5rem';
            
            // Make sure it's properly positioned
            contextStats.style.position = 'relative';
            contextStats.style.width = '100%';
            
            // Make sure it's visible
            contextStats.style.display = 'flex';
            contextStats.style.visibility = 'visible';
            contextStats.style.opacity = '1';
        }
        
        // Fix specific stats elements if they have weird styling
        const totalPnl = document.getElementById('total-pnl');
        if (totalPnl) {
            totalPnl.style.position = 'static';
            totalPnl.style.display = 'inline-block';
        }
        
        const dailyVolume = document.getElementById('daily-volume');
        if (dailyVolume) {
            dailyVolume.style.position = 'static';
            dailyVolume.style.display = 'inline-block';
        }
    }
    
    // Apply the fixes
    cleanupNestedStats();
    cleanupStatsStyles();
    
    // Reapply after a short delay to ensure all DOM manipulations are complete
    setTimeout(function() {
        cleanupNestedStats();
        cleanupStatsStyles();
    }, 500);
    
    console.log('Fixed nested stats elements');
}); 