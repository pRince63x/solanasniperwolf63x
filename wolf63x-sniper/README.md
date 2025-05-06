# Wolf63x Solana Sniper Bot

A modern dashboard and trading interface for the Solana blockchain, featuring real-time chart visualization, active trades management, and token sniping capabilities.

![Dashboard Screenshot](images/dashboard-screenshot.png)

## Features

### Dashboard
- **Portfolio Performance Chart**: Interactive line chart with multiple time ranges (24H, 7D, 30D, 3M, 1Y)
- **Active Trades Display**: Real-time monitoring of all open positions
- **Trade Management**: Take profit, sell, or view details for individual trades
- **Dashboard Statistics**: Overview of wallet balance, open trades, total P&L, and daily volume
- **Responsive Design**: Optimized for all screen sizes

### Trading Features
- **Sniper Functionality**: Quickly purchase new tokens as they appear
- **Scanner**: Monitor market for new opportunities
- **Pairs View**: Browse and filter new tokens from sources like Pump.fun
- **Portfolio Management**: Track your assets and performance
- **Trade History**: View past trades and performance

### User Experience
- **Modern UI**: Clean, intuitive interface with glass morphism effects
- **Collapsible Sidebar**: Space-efficient navigation
- **Theme Options**: Choose between green and violet themes
- **Notifications**: Real-time alerts for trade actions and system events
- **Wallet Integration**: Connect with popular Solana wallets

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/wolf63x-sniper.git
cd wolf63x-sniper
```

2. Install dependencies (if using npm):
```
npm install
```

3. Start the development server:
```
npm run dev
```

## Usage

### Dashboard
The dashboard provides an overview of your trading activity with a performance chart and active trades. You can:
- Change the time range of the chart using the dropdown
- View all active trades in the right panel
- Take profit on any profitable trade
- Sell any position quickly
- View detailed information about any trade

### Sniper
The sniper section allows you to:
- Set up automatic token purchases based on filters
- Configure buy amount, slippage, take profit, and stop loss
- Quickly snipe individual tokens by address

### Scanner
The scanner helps you discover new tokens by:
- Filtering by various metrics (volume, liquidity, holders)
- Sorting by different criteria
- Setting minimum thresholds for token quality

### Pairs
The pairs section lets you:
- Browse new tokens from sources like Pump.fun
- Filter by various criteria
- View detailed token information
- Quickly snipe interesting tokens

## Configuration

You can configure the bot by adjusting the settings in the Settings page:
- Wallet settings (RPC URL, auto-connect)
- Trading settings (default slippage, amounts, gas priority)
- Notification preferences
- Theme selection

## Development

### Project Structure
- `/public`: Static assets and client-side JavaScript
- `/src`: Server-side code (if applicable)
- `/images`: Screenshots and images

### Key Files
- `public/app.js`: Core application logic
- `public/app-dashboard.js`: Dashboard functionality
- `public/app-trading.js`: Trading functionality
- `public/app-ui.js`: UI interaction logic
- `public/modern-dashboard.css`: Dashboard styling

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer
This software is for educational purposes only. Use at your own risk. The developers are not responsible for any financial losses incurred through the use of this software. Always research tokens thoroughly before trading.

## Contact
For support or inquiries, please open an issue in the GitHub repository.

---

Built with ❤️ for the Solana community 