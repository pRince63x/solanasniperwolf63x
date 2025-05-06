# Error Log

This document tracks known issues, error messages, and debugging tips for the Wolf63x Solana Sniper Bot.

## Known Issues

### Dashboard

- **Chart Initialization**: If Chart.js fails to load automatically, the dashboard will attempt to load it dynamically. Check console for "Chart.js library not loaded" message.
- **Canvas Element Not Found**: If you see "Could not find canvas element with id main-dashboard-chart" in the console, verify that the canvas element exists in the HTML with the correct ID.
- **Empty Trade Container**: If the active trades container remains empty despite having trades, check for JavaScript errors in the console or verify that the SniperApp.activeTrades array is properly populated.

### Wallet Connection

- **Connection Failures**: If wallet connection fails, check browser console for specific errors. Common issues include:
  - Browser blocking pop-ups
  - Wallet extension not installed
  - Network connection issues

### Trade Execution

- **Failed Transactions**: Check transaction status on Solana Explorer if a transaction appears to be stuck. Common causes:
  - Insufficient SOL for gas
  - Network congestion
  - RPC node issues

### Performance Issues

- **Slow Chart Rendering**: For users experiencing slow performance with charts, try:
  - Reducing the time range (use 24H instead of 30D)
  - Disabling animations in settings
  - Using a different browser

## Error Messages Reference

### Critical Errors

- `"Could not find canvas element with id main-dashboard-chart"`: The chart canvas element is missing or misnamed in the HTML
- `"Chart.js library not loaded"`: Chart.js failed to load, check network connectivity or try reloading
- `"Error updating dashboard:"`: General dashboard update error, check console for stack trace
- `"Failed to connect wallet:"`: Wallet connection failed, check if wallet extension is installed

### Warning Messages

- `"No profitable trades to take profit from"`: Attempted to take profit when no profitable trades exist
- `"Taking profit from [n] trades"`: Informational message when taking profit on multiple trades
- `"Price update failed, using cached data"`: Price API may be down, bot is using last known prices

## Debugging Tips

1. **Enable Debug Mode**:
   - Open browser console (F12)
   - Type `localStorage.setItem('debug', 'true')` and refresh the page
   - Additional debug information will be logged to the console

2. **Check Network Activity**:
   - Use browser Network tab to monitor API calls
   - Look for failed requests (red) that might indicate connectivity issues

3. **Test RPC Connection**:
   - Go to Settings and test the RPC connection
   - Try switching to a different RPC provider if experiencing issues

4. **Clear Cache and Local Storage**:
   - If experiencing persistent issues, try:
     - `localStorage.clear()`
     - Clear browser cache
     - Reload the application

5. **Check Console for Warnings**:
   - Yellow warnings may indicate potential issues that aren't critical but could affect functionality

## Reporting Issues

When reporting issues, please include:

1. Error message exactly as it appears
2. Steps to reproduce the issue
3. Browser and OS information
4. Any console errors (screenshots help)
5. Network activity tab screenshot if relevant

Submit issues through the GitHub repository issue tracker with the "[BUG]" prefix in the title.

## Recent Fixes

- Fixed chart initialization issues when Chart.js was not immediately available
- Resolved trade filtering issues in the dashboard
- Improved fade-out animation for closed trades
- Fixed notification display and positioning
- Resolved responsive layout issues on smaller screens 