/*jshint esversion: 11 */
/*global Chart, SniperApp, getComputedStyle */

// Wolf63x Solana Sniper Bot - Modern Charts Implementation

class ModernCharts {
    constructor() {
        this.chartInstances = {};
        this.defaultColors = {
            green: '#34D399',
            red: '#ff3b5c',
            blue: '#3B82F6',
            purple: '#8B5CF6',
            gray: '#6B7280',
            background: '#121212',
            grid: 'rgba(75, 85, 99, 0.1)',
            text: '#E5E7EB',
            tooltipBackground: 'rgba(17, 24, 39, 0.9)'
        };
        
        // Load zoom plugin if not already loaded
        this.loadZoomPlugin();
    }

    // Load chartjs-plugin-zoom if it doesn't exist
    async loadZoomPlugin() {
        // Check if zoom plugin is loaded
        if (typeof Chart.Zoom === 'undefined') {
            console.log('Loading zoom plugin dynamically');
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom';
                script.onload = () => {
                    console.log('Zoom plugin loaded successfully');
                    resolve();
                };
                script.onerror = (err) => {
                    console.error('Failed to load zoom plugin:', err);
                    reject(err);
                };
                document.head.appendChild(script);
            });
        }
        console.log('Zoom plugin already loaded');
        return Promise.resolve();
    }

    async initChart(timeRange = '1d', chartType = 'line') {
        try {
            await this.loadZoomPlugin();
            
            const canvas = document.getElementById('main-dashboard-chart');
            if (!canvas) {
                console.log('Dashboard has been cleared - chart canvas not found');
                return; // Gracefully exit if canvas doesn't exist
            }
            
            console.log(`Initializing ${chartType} chart with timeRange ${timeRange}`);

            // Set default active elements in UI
            this.setActiveControls(timeRange, chartType);
            
            // Generate appropriate data based on chart type
            const chartData = this.generateChartData(timeRange, chartType);
            
            // Create chart with zoom functionality
            this.createChart('main', canvas, chartType, chartData, timeRange);
            
            // Set up zoom buttons functionality
            this.setupZoomButtons();
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }
    
    setupZoomButtons() {
        const chartInstance = this.chartInstances.main;
        if (!chartInstance) return;
        
        // Zoom In button
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
            console.log('Zoom in clicked');
            if (chartInstance.options.plugins.zoom) {
                chartInstance.zoom(1.1);
            }
        });
        
        // Zoom Out button
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
            console.log('Zoom out clicked');
            if (chartInstance.options.plugins.zoom) {
                chartInstance.zoom(0.9);
            }
        });
        
        // Reset Zoom button
        document.getElementById('reset-zoom-btn')?.addEventListener('click', () => {
            console.log('Reset zoom clicked');
            if (chartInstance.options.plugins.zoom) {
                chartInstance.resetZoom();
            }
        });
    }
    
    async updateChart(timeRange, chartType) {
        try {
            console.log(`Updating chart to ${chartType} with timeRange ${timeRange}`);
            
            // Check if canvas exists after dashboard has been cleared
            const canvas = document.getElementById('main-dashboard-chart');
            if (!canvas) {
                console.log('Dashboard has been cleared - chart canvas not found');
                return; // Gracefully exit if canvas doesn't exist
            }
            
            // Update active elements in UI
            this.setActiveControls(timeRange, chartType);
            
            // Get the chart instance
            const chartInstance = this.chartInstances.main;
            if (!chartInstance) {
                console.log('No chart instance found, initializing new chart');
                return this.initChart(timeRange, chartType);
            }
            
            // Generate new data
            const chartData = this.generateChartData(timeRange, chartType);
            
            // Check if chart type has changed - if so, recreate chart
            if (chartInstance.config.type !== chartType && 
                !(chartType === 'candlestick' && chartInstance.config.type === 'bar')) {
                console.log('Chart type changed, recreating chart');
                chartInstance.destroy();
                this.createChart('main', canvas, chartType, chartData, timeRange);
                return;
            }
            
            // Just update the data if chart type hasn't changed
            console.log('Updating chart data');
            if (chartType === 'line') {
                chartInstance.data.labels = chartData.labels;
                chartInstance.data.datasets[0].data = chartData.values;
            } else { // candlestick
                chartInstance.data.datasets[0].data = chartData.values;
            }
            
            // Update axes and scales based on new time range
            this.updateTimeUnit(chartInstance, timeRange);
            
            // Update chart
            chartInstance.update();
            console.log('Chart updated successfully');
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
    
    createChart(id, canvas, chartType, data, timeRange) {
        try {
            const ctx = canvas.getContext('2d');
            let config;
            
            if (chartType === 'line') {
                config = this.getLineChartConfig(data, ctx);
            } else { // candlestick
                config = this.getCandlestickChartConfig(data, ctx);
            }
            
            // Add zoom and pan features
            config.options.plugins.zoom = {
                limits: {
                    x: {min: 'original', max: 'original', minRange: 60000},
                    y: {min: 'original', max: 'original'}
                },
                pan: {
                    enabled: true,
                    mode: 'x',
                    threshold: 10,
                    onPanComplete: () => console.log('Pan completed')
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x',
                    onZoomComplete: () => console.log('Zoom completed')
                }
            };
            
            // Set appropriate time unit
            this.updateTimeUnit(config, timeRange);
            
            // Create and store chart instance
            console.log('Creating new chart instance');
            this.chartInstances[id] = new Chart(ctx, config);
            return this.chartInstances[id];
        } catch (error) {
            console.error('Error creating chart:', error);
        }
    }
    
    updateTimeUnit(chartOrConfig, timeRange) {
        let config = chartOrConfig;
        if (chartOrConfig instanceof Chart) {
            config = chartOrConfig.config;
        }
        
        // Only apply to charts with time scales
        if (!config.options.scales.x || config.options.scales.x.type !== 'time') {
            console.log('Not a time-based chart, skipping time unit update');
            return;
        }
        
        let timeUnit = 'minute';
        if (['1s', '3s', '5s', '10s', '15s', '1m', '3m'].includes(timeRange)) {
            timeUnit = 'second';
        } else if (['5m', '15m', '30m', '45m', '1h', '2h'].includes(timeRange)) {
            timeUnit = 'minute';
        } else if (['4h', '1d'].includes(timeRange)) {
            timeUnit = 'hour';
        } else if (['1w', '1m'].includes(timeRange)) {
            timeUnit = 'day';
        }
        
        // Update time unit
        config.options.scales.x.time.unit = timeUnit;
        
        // Update display formats
        const formats = {
            second: 'HH:mm:ss',
            minute: 'HH:mm',
            hour: 'MMM d, HH:mm',
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy'
        };
        
        config.options.scales.x.time.displayFormats = {
            [timeUnit]: formats[timeUnit]
        };
        
        console.log(`Updated time unit to ${timeUnit}`);
    }
    
    setActiveControls(timeRange, chartType) {
        // Set active time range button
        document.querySelectorAll('.time-range-btn').forEach(btn => {
            if (btn.getAttribute('data-range') === timeRange) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // For dropdown
        const selectedTimeRange = document.getElementById('selected-time-range');
        if (selectedTimeRange) {
            selectedTimeRange.textContent = timeRange;
        }
        
        // Update active state in dropdown
        const timeRangeOptions = document.getElementById('time-range-options');
        if (timeRangeOptions) {
            timeRangeOptions.querySelectorAll('.dropdown-item').forEach(item => {
                if (item.getAttribute('data-range') === timeRange) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
        
        // Set active chart type button
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            if (btn.getAttribute('data-chart-type') === chartType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    getLineChartConfig(chartData, ctx) {
        const colors = this.defaultColors;
        
        // Create gradient for area fill - using red instead of green
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.offsetHeight * 1.5);
        gradient.addColorStop(0, 'rgba(255, 59, 92, 0.2)'); // Red with opacity
        gradient.addColorStop(0.5, 'rgba(255, 59, 92, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 59, 92, 0)');
        
        return {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: chartData.values,
                    borderColor: colors.red, // Use red instead of green
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: colors.red, // Red hover point
                    pointHoverBorderColor: '#FFFFFF',
                    pointHoverBorderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    borderJoinStyle: 'round'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: colors.tooltipBackground,
                        titleColor: colors.text,
                        bodyColor: colors.text,
                        borderColor: 'rgba(75, 85, 99, 0.3)',
                        borderWidth: 1,
                        padding: { top: 10, bottom: 10, left: 12, right: 12 },
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                if (tooltipItems[0].label) {
                                    return tooltipItems[0].label;
                                }
                                const date = new Date(tooltipItems[0].parsed.x);
                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' +
                                    date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                            },
                            label: function(context) {
                                let label = '';
                                if (context.parsed.y !== null) {
                                    const sign = context.parsed.y >= 0 ? '+' : '';
                                    label += sign + context.parsed.y.toFixed(2) + ' SOL';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            tooltipFormat: 'MMMM d, yyyy HH:mm:ss',
                            displayFormats: {
                                millisecond: 'HH:mm:ss.SSS',
                                second: 'HH:mm:ss',
                                minute: 'HH:mm',
                                hour: 'HH:mm',
                                day: 'MMM d',
                                week: 'MMM d',
                                month: 'MMM yyyy',
                                quarter: 'MMM yyyy',
                                year: 'yyyy'
                            }
                        },
                        grid: {
                            color: colors.grid,
                            borderColor: 'transparent',
                            tickLength: 0,
                        },
                        ticks: {
                            color: colors.text,
                            font: { size: 11 },
                            maxRotation: 0,
                            autoSkipPadding: 20
                        }
                    },
                    y: {
                        grid: {
                            color: colors.grid,
                            borderColor: 'transparent',
                            drawTicks: false,
                        },
                        ticks: {
                            color: colors.text,
                            font: { size: 11 },
                            padding: 15,
                            callback: function(value) {
                                return value.toFixed(2) + ' SOL';
                            },
                        },
                        beginAtZero: false
                    }
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear'
                    }
                }
            }
        };
    }
    
    getCandlestickChartConfig(chartData, ctx) {
        const colors = this.defaultColors;
        
        return {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'Price (SOL)',
                    data: chartData.values,
                    color: {
                        up: colors.green,
                        down: colors.red,
                        unchanged: colors.gray
                    },
                    borderColor: {
                        up: colors.green,
                        down: colors.red,
                        unchanged: colors.gray
                    },
                    borderWidth: 2,
                    wickColor: {
                        up: colors.green,
                        down: colors.red,
                        unchanged: colors.gray
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: colors.tooltipBackground,
                        titleColor: colors.text,
                        bodyColor: colors.text,
                        borderColor: 'rgba(75, 85, 99, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                if (!tooltipItems || !tooltipItems[0] || !tooltipItems[0].parsed) {
                                    return '';
                                }
                                const date = new Date(tooltipItems[0].parsed.x);
                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' +
                                    date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                            },
                            label: function(context) {
                                const candle = context.raw;
                                if (!candle) return [];
                                
                                const o = candle.o.toFixed(5);
                                const h = candle.h.toFixed(5);
                                const l = candle.l.toFixed(5);
                                const c = candle.c.toFixed(5);
                                const color = candle.c >= candle.o ? '🟢' : '🔴';
                                
                                return [
                                    `${color} O: ${o}  H: ${h}`,
                                    `     L: ${l}  C: ${c}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            tooltipFormat: 'MMMM d, yyyy HH:mm:ss',
                            displayFormats: {
                                millisecond: 'HH:mm:ss.SSS',
                                second: 'HH:mm:ss',
                                minute: 'HH:mm',
                                hour: 'HH:mm',
                                day: 'MMM d',
                                week: 'MMM d',
                                month: 'MMM yyyy',
                                quarter: 'MMM yyyy',
                                year: 'yyyy'
                            }
                        },
                        grid: {
                            color: colors.grid,
                            borderColor: 'transparent',
                            tickLength: 0,
                        },
                        ticks: {
                            color: colors.text,
                            font: { size: 11 },
                            maxRotation: 0,
                            autoSkipPadding: 20,
                            source: 'auto'
                        }
                    },
                    y: {
                        grid: {
                            color: colors.grid,
                            borderColor: 'transparent',
                            drawTicks: false,
                        },
                        ticks: {
                            color: colors.text,
                            font: { size: 11 },
                            padding: 15,
                            callback: function(value) {
                                return value.toFixed(5) + ' SOL';
                            },
                        },
                        beginAtZero: false
                    }
                }
            }
        };
    }

    updateThemeColors() {
        // Use red theme instead of green
        this.defaultColors.green = '#34D399'; // Keep original green
        this.defaultColors.red = '#ff3b5c'; // Updated red
        
        // Update all chart instances
        Object.values(this.chartInstances).forEach(chart => {
            if (chart.config.type === 'line') {
                chart.data.datasets[0].borderColor = this.defaultColors.red;
                
                // Update gradient
                const ctx = chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.offsetHeight * 1.5);
                gradient.addColorStop(0, 'rgba(255, 59, 92, 0.2)');
                gradient.addColorStop(0.5, 'rgba(255, 59, 92, 0.05)');
                gradient.addColorStop(1, 'rgba(255, 59, 92, 0)');
                chart.data.datasets[0].backgroundColor = gradient;
                chart.data.datasets[0].pointHoverBackgroundColor = this.defaultColors.red;
            } else if (chart.config.type === 'candlestick' || chart.config.type === 'bar') {
                const upColor = this.defaultColors.green;
                chart.data.datasets[0].color.up = upColor;
                chart.data.datasets[0].borderColor.up = upColor;
                chart.data.datasets[0].wickColor.up = upColor;
            }
            
            chart.update();
        });
    }
    
    generateChartData(timeRange, chartType) {
        if (chartType === 'line') {
            return this.generatePnlData(timeRange);
        } else {
            return this.generateCandlestickData(timeRange);
        }
    }
    
    generatePnlData(range) {
        // Use the days of the week as shown in the screenshot
        const daysOfWeek = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
        
        const now = new Date();
        const labels = [];
        const values = [];
        
        // Number of data points - match the image (showing 7 days for 1d view)
        const dataPoints = daysOfWeek.length;
        
        // Create a curve pattern that matches the image
        // Start higher, dip down, go up high, then down, then slightly up
        // Create specific curve pattern similar to the image
        const curvePattern = [
            15, // Wed - start high
            8,  // Thu - dip
            4,  // Fri - lowest
            18, // Sat - rise fast
            30, // Sun - peak
            15, // Mon - drop
            10, // Tue - slight dip
        ];
        
        // Generate labeled data points
        for (let i = 0; i < dataPoints; i++) {
            // Create date for label
            const date = new Date(now);
            date.setDate(date.getDate() - (dataPoints - i - 1));
            labels.push(daysOfWeek[i]); // Use day name directly
            
            // Use the specific curve pattern
            values.push(curvePattern[i]);
        }
        
        return { labels, values };
    }
    
    generateCandlestickData(range) {
        const { dataPoints, intervalMs } = this.calculateDataParams(range);
        
        const labels = [];
        const values = [];
        let currentPrice = Math.random() * 0.01 + 0.005; // Start with small price for token
        const now = Date.now();
        
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = now - (dataPoints - 1 - i) * intervalMs;
            labels.push(new Date(timestamp));
            
            // Generate realistic OHLC data
            const open = currentPrice;
            const change = currentPrice * (Math.random() * 0.1 - 0.045);
            const close = Math.max(0.00001, open + change);
            const high = Math.max(open, close) * (1 + Math.random() * 0.03);
            const low = Math.min(open, close) * (1 - Math.random() * 0.03);
            
            values.push({
                x: timestamp,
                o: open,
                h: high,
                l: Math.max(0.00001, low),
                c: close
            });
            
            currentPrice = close;
        }
        
        return { labels, values };
    }
    
    calculateDataParams(range) {
        let dataPoints = 96; // Default
        let totalDurationMs = 90 * 24 * 60 * 60 * 1000; // Default 'all' = 90 days
        
        switch(range) {
            case '1s':
                dataPoints = 30; // 30 points for 1 second intervals
                totalDurationMs = 30 * 1000;
                break;
            case '3s':
                dataPoints = 30; // 30 points for 3 second intervals
                totalDurationMs = 30 * 3 * 1000;
                break;
            case '5s':
                dataPoints = 30; // 30 points for 5 second intervals
                totalDurationMs = 30 * 5 * 1000;
                break;
            case '10s':
                dataPoints = 30; // 30 points for 10 second intervals
                totalDurationMs = 30 * 10 * 1000;
                break;
            case '15s':
                dataPoints = 30; // 30 points for 15 second intervals
                totalDurationMs = 30 * 15 * 1000;
                break;
            case '1m':
                dataPoints = 60; // 60 points for 1 second intervals
                totalDurationMs = 60 * 1000;
                break;
            case '3m':
                dataPoints = 60; // 60 points for 3 second intervals
                totalDurationMs = 3 * 60 * 1000;
                break;
            case '5m':
                dataPoints = 60; // 60 points for 5 second intervals
                totalDurationMs = 5 * 60 * 1000;
                break;
            case '15m':
                dataPoints = 60; // 60 points, 15 second intervals
                totalDurationMs = 15 * 60 * 1000;
                break;
            case '30m':
                dataPoints = 60; // 60 points, 30 second intervals
                totalDurationMs = 30 * 60 * 1000;
                break;
            case '45m':
                dataPoints = 45; // 45 points, 1 minute intervals
                totalDurationMs = 45 * 60 * 1000;
                break;
            case '1h':
                dataPoints = 60; // 60 points, 1 minute intervals
                totalDurationMs = 1 * 60 * 60 * 1000;
                break;
            case '2h':
                dataPoints = 60; // 60 points, 2 minute intervals
                totalDurationMs = 2 * 60 * 60 * 1000;
                break;
            case '4h':
                dataPoints = 4 * 12; // 5-minute intervals
                totalDurationMs = 4 * 60 * 60 * 1000;
                break;
            case '1d':
                dataPoints = 24 * 4; // 15-minute intervals
                totalDurationMs = 1 * 24 * 60 * 60 * 1000;
                break;
            case '1w':
                dataPoints = 7 * 6; // 4-hour intervals
                totalDurationMs = 7 * 24 * 60 * 60 * 1000;
                break;
        }
        
        const intervalMs = totalDurationMs / dataPoints;
        return { dataPoints, intervalMs };
    }
} 