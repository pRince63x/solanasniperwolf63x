/*jshint esversion: 11 */
/* Dashboard chart implementation matching the design */

// Chart data for different time periods
const chartData = {
    '1d': [2000, 1800, 3000, 2700, 2900, 2500, 2800],
    '1w': [2800, 2200, 3500, 8000, 5000, 1800, 4200],
    '1m': [3000, 4500, 3800, 5200, 6000, 4200, 5500],
    '3m': [2500, 4000, 5500, 3800, 6800, 5200, 4800],
    '1y': [1500, 3000, 4500, 6000, 4800, 5200, 7000]
};

// Initialize the dashboard chart with the red line display
function initDashboardChart() {
    // Get the chart canvas and context
    const canvas = document.getElementById('dashboard-chart');
    if (!canvas) return;
    
    // Chart configuration based on design showing a red line
    const ctx = canvas.getContext('2d');
    
    // Default to weekly data
    const period = '1w';
    
    // Sample data for the wave pattern shown in the image
    const data = {
        labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'],
        datasets: [{
            label: 'PnL',
            data: chartData[period],
            borderColor: '#ff3e3e',  // Red color similar to the image
            borderWidth: 3,
            backgroundColor: 'rgba(255, 62, 62, 0.05)',
            fill: true,
            tension: 0.4, // Smooth curve
            pointRadius: 0, // Hide points
        }]
    };
    
    // Destroy existing chart if it exists
    if (window.dashboardChart) {
        window.dashboardChart.destroy();
    }
    
    // Create the chart
    window.dashboardChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide legend
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '$' + context.parsed.y.toLocaleString();
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        display: false, // Hide X-axis ticks (days are shown outside the chart)
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                y: {
                    grid: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        display: false, // Hide Y-axis ticks
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    tension: 0.4 // Smooth curve
                }
            }
        }
    });
    
    // Set up period tab event listeners
    setupPeriodTabs();
}

// Handle period tab clicks
function setupPeriodTabs() {
    const tabs = document.querySelectorAll('.period-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get the period from the data attribute
            const period = tab.getAttribute('data-period');
            
            // Update chart with new data
            updateChartData(period);
        });
    });
}

// Update chart data based on selected period
function updateChartData(period) {
    if (!window.dashboardChart) return;
    
    // Update the chart data
    window.dashboardChart.data.datasets[0].data = chartData[period];
    
    // Update the chart
    window.dashboardChart.update();
}

// Initialize trades in the dashboard
function initDashboardTrades() {
    // Set the initial trade count and PNL values
    document.querySelector('.open-trades-count').textContent = '(4)';
    document.querySelector('.open-trades-profit').textContent = 'pnl +$400';
    document.querySelector('#dashboard-take-profits').textContent = 'Take Profit +$400';
    
    // Add event listener to the Take Profit button
    document.querySelector('#dashboard-take-profits').addEventListener('click', function() {
        alert('Taking profits from all profitable trades');
        // Actual implementation would be connected to the trading system
    });
    
    // Add event listener to the filter dropdown
    document.querySelector('#dashboard-trades-filter').addEventListener('change', function() {
        const filterValue = this.value;
        console.log('Filtering trades by:', filterValue);
        // Implementation would filter the trades list
    });
}

// Main initialization function to be called on page load
function initDashboard() {
    initDashboardChart();
    initDashboardTrades();
}

// Add event listener for page load
document.addEventListener('DOMContentLoaded', initDashboard);
