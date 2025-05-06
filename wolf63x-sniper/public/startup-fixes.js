/**
 * Master Initialization Script for Wolf63x Sniper Bot
 * Ensures all fixes are applied in the correct order
 */
document.addEventListener('DOMContentLoaded', function() {
    // Define execution order
    const fixSteps = [
        // Step 1: Basic DOM structure fixes
        function fixStructure() {
            console.log('Applying structure fixes...');
            
            // Make sure the page structure is clean
            const body = document.body;
            body.style.margin = '0';
            body.style.padding = '0';
            body.style.overflow = 'auto';
            
            // Fix app container
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.style.paddingTop = '0';
                appContainer.style.marginTop = '0';
            }
        },
        
        // Step 2: Clean up nested stats elements
        function fixNestedStats() {
            console.log('Fixing nested stats elements...');
            
            // Find duplicated stats containers in wrong places
            const statValues = document.querySelectorAll('.stat-value');
            statValues.forEach(value => {
                const nestedStats = value.querySelector('#context-stats');
                if (nestedStats) {
                    nestedStats.remove();
                    
                    // Restore proper values
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
            
            // Remove any SOL price displays
            const solPrice = document.getElementById('sol-price');
            if (solPrice && solPrice.parentElement && solPrice.parentElement.classList.contains('stat-display')) {
                solPrice.parentElement.remove();
            }
            
            // Remove any standalone Solana price displays
            const solanaPriceElements = document.querySelectorAll('.solana-price');
            solanaPriceElements.forEach(element => {
                element.remove();
            });
        },
        
        // Step 3: Fix Solana logo in stats displays
        function fixSolanaLogo() {
            console.log('Fixing Solana logo in stats...');
            
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
            
            // Replace all Solana logo references in image sources
            const allImages = document.querySelectorAll('img');
            allImages.forEach(function(img) {
                const src = img.getAttribute('src');
                if (src && (src.includes('cryptologos.cc') || src.includes('solana') || src.includes('sol-logo'))) {
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-coins';
                    icon.style.color = '#14F195';
                    icon.style.fontSize = '16px';
                    icon.style.verticalAlign = 'middle';
                    icon.style.marginRight = '5px';
                    
                    if (img.parentNode) {
                        img.parentNode.replaceChild(icon, img);
                    }
                }
            });
            
            // Remove Solana price elements - we don't want to show them
            const solPriceElements = document.querySelectorAll('.solana-price');
            solPriceElements.forEach(element => {
                element.remove();
            });
        },
        
        // Step 4: Make sure stats display correctly
        function fixStatsDisplay() {
            console.log('Fixing stats display...');
            
            const statsContainer = document.getElementById('context-stats');
            if (statsContainer) {
                // Make sure the stats container is visible and properly styled
                statsContainer.style.display = 'flex';
                statsContainer.style.flexWrap = 'wrap';
                statsContainer.style.gap = '1rem';
                statsContainer.style.width = '100%';
                statsContainer.style.padding = '0.5rem 1rem';
                statsContainer.style.position = 'relative';
                statsContainer.style.zIndex = '1';
                
                // Fix background and border for better visibility
                statsContainer.style.backgroundColor = 'rgba(30, 30, 35, 0.5)';
                statsContainer.style.borderRadius = '8px';
                statsContainer.style.margin = '0.5rem 0';
                
                // Style the stat elements
                const statElements = statsContainer.querySelectorAll('.stat-display');
                statElements.forEach(stat => {
                    stat.style.display = 'inline-flex';
                    stat.style.alignItems = 'center';
                    stat.style.whiteSpace = 'nowrap';
                    stat.style.margin = '0 0.5rem 0 0';
                });
                
                // Style title
                const statsTitle = document.getElementById('stats-title');
                if (statsTitle) {
                    statsTitle.style.color = '#57ca84';
                    statsTitle.style.fontWeight = 'bold';
                    statsTitle.style.marginRight = '1rem';
                }
                
                // Final check - remove any SOL price displays that might have been added
                const solPrice = document.getElementById('sol-price');
                if (solPrice && solPrice.parentElement && solPrice.parentElement.classList.contains('stat-display')) {
                    solPrice.parentElement.remove();
                }
            }
        }
    ];
    
    // Execute each fix step in sequence
    for (let i = 0; i < fixSteps.length; i++) {
        try {
            fixSteps[i]();
        } catch (error) {
            console.error(`Error in fix step ${i+1}:`, error);
        }
    }
    
    // Re-run fixes after a delay to ensure everything is loaded
    setTimeout(function() {
        console.log('Running final fix checks...');
        for (let i = 0; i < fixSteps.length; i++) {
            try {
                fixSteps[i]();
            } catch (error) {
                console.error(`Error in delayed fix step ${i+1}:`, error);
            }
        }
        console.log('All fixes completed');
    }, 1000);
}); 