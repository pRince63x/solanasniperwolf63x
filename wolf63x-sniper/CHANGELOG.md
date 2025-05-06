# Wolf63x Solana Sniper Bot - Changelog

## [Version 0.2.3] - 2025-04-22

### Backend Improvements

- Replaced deprecated `requests` crate with `reqwest` (v0.11) to resolve yanked dependencies.
- Implemented HTTP fallback fetch from Pump.fun API using `reqwest` ensuring the pairs menu is never empty.
- Refactored websocket listener to use the minimal `NewTokenEvent` struct and convert to `TokenOpportunity` for frontend display.

### Frontend/UI Enhancements

- Pairs menu now updates in real time via Pump.fun WebSocket and HTTP fallback.
- UI preview auto-refreshes with the latest token pairs, resolving previous empty menu issues.


---

## [Version 0.2.2] - 2025-04-21

### Features & UI Changes

- **Sidebar-Style Button Active State:**
  - All buttons and clickables now use the sidebar's active (on click/selected) style: black background, glassy border, and shadow.
  - No movement/translation on click for a minimal, modern feel.
  - Ensures a perfectly unified design language across navigation and all interactive elements.
- **Real-Time Pairs Menu:**
  - The "Pairs" menu now fetches and displays newly listed memecoins from pump.fun every 0.3 seconds for near-instant updates.


---

## [Version 0.2.1] - 2025-04-21

### UI/UX Changes

- **Unified Button & Clickable Design:**
  - All buttons and clickable elements now use a pure black, glassy, rounded background with theme-colored (green/violet) text.
  - Removed all colored and dynamic island backgrounds from sidebar and navigation.
  - Sidebar hover effect (light glassy background, slight right shift) is now applied to all buttons and clickables for a cohesive, modern look.
  - Removed excessive hover effects: no brightness, shine, or strong shadow; hover is now subtle and consistent.
- **Consistent Interaction Feedback:**
  - Buttons and clickables now match sidebar navigation in hover behavior for a unified user experience.
  - Active/selected states remain visually distinct for navigation and action clarity.
- **General Cleanup:**
  - Deprecated dynamic island utility class from main UI.
  - Cleaned up button CSS for clarity and maintainability.


### Other Recent Features (since 0.2.0)

- Dashboard, sniper, and modal windows retain all previous functionality and theme switching.
- Responsive design and color-coded profit/loss indicators remain as before.


---

## [Version 0.2.0] - 2025-04-21

### UI Improvements

- **Dashboard Enhancements**:
  - Added candlestick charts for portfolio performance tracking
  - Implemented time range selectors (24H, 7D, 30D, ALL) for performance charts
  - Added profit distribution doughnut chart
  - Added trade success rate bar chart
  - Added token performance horizontal bar chart

- **Navigation and Layout**:
  - Moved scanner from the sniper menu to the left sidebar
  - Created a dedicated "Pairs" page with green leaves emoji (🍃) for newly made pairs from pump.fun
  - Improved overall layout and spacing for better usability

- **Modal Windows**:
  - Added popup windows for sniper settings and filters
  - Implemented proper event listeners for modal interactions
  - Ensured modals open and close correctly when triggered

- **Theme Management**:
  - Enhanced theme color application for consistency across the entire application
  - Added theme switching functionality between green and violet themes
  - Implemented theme-aware charts that update colors when theme changes


### Technical Improvements

- **Chart System**:
  - Implemented modern Chart.js based visualization system
  - Created custom candlestick chart implementation for portfolio tracking
  - Added dynamic data generation for realistic chart previews
  - Implemented chart color updates based on theme changes

- **JavaScript Architecture**:
  - Created modular JS files for better code organization
  - Implemented event delegation for improved performance
  - Added responsive design adjustments for mobile compatibility

- **CSS Improvements**:
  - Created dedicated CSS files for UI components and dashboard
  - Implemented CSS variables for theming
  - Added responsive design rules for various screen sizes


## [Version 0.1.0] - 2025-04-15

### Initial Features

- **Core Functionality**:
  - Basic Solana wallet integration
  - Token sniper functionality
  - Simple trading interface
  - Basic chart display
  - Ability to switch between line chart and candlestick chart

- **UI Components**:
  - Simple dashboard with stats
  - Basic sniper settings
  - Token list display
  - Simple filter options


### Technical Foundation

- **Backend**:
  - Rust-based core functionality
  - WASM bindings for JavaScript interaction
  - Basic API integrations

- **Frontend**:
  - HTML/CSS/JS interface
  - Simple theme implementation
  - Basic responsive design

## [1.0.0] - 2023-06-14

### Added
- Modern dashboard layout with side-by-side chart and active trades display
- Line chart for portfolio performance visualization
- Active trades section with dynamic trade cards
- Dashboard statistics (wallet balance, open trades, total P&L, daily volume)
- Time range selector for chart visualization (24H, 7D, 30D, 3M, 1Y)
- "Take All Profits" functionality for profitable trades
- Individual trade actions (Details, Take Profit, Sell)
- Responsive design for various screen sizes
- Notification system for trade actions and app events
- Glass transparency effect for sidebar when expanded
- Fade-out animation for trades when closed

### Changed
- Removed candlestick chart option in favor of simplified line chart
- Updated chart rendering to use Chart.js with gradient fill
- Changed dashboard layout to use CSS Grid for better responsiveness
- Improved sidebar with collapsible functionality
- Enhanced trade cards with better visualization of profits/losses

### Fixed
- Fixed chart initialization issues when Chart.js was not immediately available
- Resolved trade filtering issues in the dashboard
- Improved fade-out animation for closed trades
- Fixed notification display and positioning
- Resolved responsive layout issues on smaller screens
