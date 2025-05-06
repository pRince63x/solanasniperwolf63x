/*jshint esversion: 11 */

// This file combines all the JavaScript files for the Wolf63x Solana Sniper Bot
document.addEventListener('DOMContentLoaded', async () => {
    // Load all script files
    await loadScript('app.js');
    await loadScript('app-trading.js');
    await loadScript('app-dashboard.js');
    
    // Initialize global app instance
    window.app = new SniperApp();
    await window.app.initialize();
    
    console.log('Wolf63x Solana Sniper Bot fully loaded');
});

// Helper function to load scripts
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}
