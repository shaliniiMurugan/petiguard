import React, { useState, useEffect } from 'react';
import './Statistics.css';

const Statistics = () => {
    const [timeRange, setTimeRange] = useState('month');
    const [showDepartmentStats, setShowDepartmentStats] = useState(true);
    const [showPriorityStats, setShowPriorityStats] = useState(true);
    const [showStatusStats, setShowStatusStats] = useState(true);
    const [showResolutionTimeStats, setShowResolutionTimeStats] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statsData, setStatsData] = useState({
        totalPetitions: 0,
        resolvedPetitions: 0,
        averageResolutionTime: '0 days',
        pendingPetitions: 0,
        urgentPetitions: 0,
        departmentStats: [],
        priorityStats: [],
        statusStats: [],
        monthlyStats: []
    });

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                const response = await fetch('http://localhost:3000/api/user/assigned', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                processApiData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]); // Re-fetch when time range changes

    // Process API data
    const processApiData = (data) => {
        if (!data || !data.statusWithTotal) return;

        const { statusWithTotal } = data;
        const { total, forms } = statusWithTotal;

        // Calculate basic stats
        const resolvedCount = forms.filter(form => form.status === 'resolved').length;
        const urgentCount = forms.filter(form => form.priority === 'high' || form.priority === 'critical').length;
        const pendingCount = forms.filter(form => form.status !== 'resolved' && form.status !== 'closed').length;

        // Calculate average resolution time
        let totalResolutionDays = 0;
        let resolvedForms = 0;
        
        forms.forEach(form => {
            if (form.status === 'resolved') {
                const createdDate = new Date(form.created_at);
                const resolvedDate = new Date(form.updatedAt);
                const diffTime = Math.abs(resolvedDate - createdDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalResolutionDays += diffDays;
                resolvedForms++;
            }
        });

        const avgResolutionTime = resolvedForms > 0 ? 
            `${(totalResolutionDays / resolvedForms).toFixed(1)} days` : 
            'N/A';

        // Group by department
        const departments = {};
        forms.forEach(form => {
            departments[form.department] = (departments[form.department] || 0) + 1;
        });

        const departmentStats = Object.keys(departments).map(name => {
            const count = departments[name];
            const percentage = (count / total * 100).toFixed(1);
            return { name, count, percentage: parseFloat(percentage) };
        });

        // Group by priority - Always include all priorities even if count is 0
        const priorities = {
            'critical': { count: 0, color: '#e74c3c' },
            'high': { count: 0, color: '#f39c12' },
            'medium': { count: 0, color: '#3498db' },
            'low': { count: 0, color: '#2ecc71' }
        };

        forms.forEach(form => {
            const priority = form.priority || 'medium';
            if (priorities[priority]) {
                priorities[priority].count++;
            }
        });

        const priorityStats = Object.keys(priorities).map(name => {
            const count = priorities[name].count;
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0.0';
            return { 
                name: name.charAt(0).toUpperCase() + name.slice(1), 
                count, 
                percentage: parseFloat(percentage), 
                color: priorities[name].color 
            };
        });

        // Group by status - Always include all statuses even if count is 0
        const statuses = {
            'pending': { count: 0, color: '#f39c12' },
            'in progress': { count: 0, color: '#3498db' },
            'under review': { count: 0, color: '#9b59b6' },
            'resolved': { count: 0, color: '#2ecc71' },
            'closed': { count: 0, color: '#34495e' },
            'urgent': { count: 0, color: '#e74c3c' }
        };

        forms.forEach(form => {
            const status = form.status.toLowerCase();
            if (statuses[status]) {
                statuses[status].count++;
            }
        });

        // Include all statuses, including those with zero count
        const statusStats = Object.keys(statuses).map(name => {
            const count = statuses[name].count;
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0.0';
            return { 
                name: name.charAt(0).toUpperCase() + name.slice(1), 
                count, 
                percentage: parseFloat(percentage), 
                color: statuses[name].color 
            };
        });

        // Generate monthly stats (simulated based on creation dates)
        const monthlyData = {};
        const currentDate = new Date();
        const monthsToShow = 7;
        
        // Initialize month names
        for (let i = monthsToShow - 1; i >= 0; i--) {
            const month = new Date(currentDate);
            month.setMonth(currentDate.getMonth() - i);
            const monthName = month.toLocaleString('default', { month: 'short' });
            monthlyData[monthName] = { petitions: 0, resolved: 0 };
        }

        // Fill in data
        forms.forEach(form => {
            const createdDate = new Date(form.created_at);
            const month = createdDate.toLocaleString('default', { month: 'short' });
            
            if (monthlyData[month]) {
                monthlyData[month].petitions++;
                
                if (form.status === 'resolved') {
                    monthlyData[month].resolved++;
                }
            }
        });

        const monthlyStats = Object.keys(monthlyData).map(month => ({
            month,
            petitions: monthlyData[month].petitions,
            resolved: monthlyData[month].resolved
        }));

        // Update state with processed data
        setStatsData({
            totalPetitions: total,
            resolvedPetitions: resolvedCount,
            averageResolutionTime: avgResolutionTime,
            pendingPetitions: pendingCount,
            urgentPetitions: urgentCount,
            departmentStats,
            priorityStats,
            statusStats,
            monthlyStats
        });
    };

    const getTimeRangeText = () => {
        switch (timeRange) {
            case 'week':
                return 'Past Week';
            case 'month':
                return 'Past Month';
            case 'quarter':
                return 'Past Quarter';
            case 'year':
                return 'Past Year';
            default:
                return 'Past Month';
        }
    };

    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
    };

    // Create SVG pie chart with improved rendering for zero values
    const PieChart = ({ data, isDonut = false }) => {
        if (!data || data.length === 0) {
            return <div className="no-data">No data available</div>;
        }

        // Filter out items with zero percentage for pie chart display
        const validData = data.filter(item => item.percentage > 0);
        
        if (validData.length === 0) {
            // If no valid data (all zeros), show empty chart with message
            return (
                <div className="empty-chart">
                    <svg width="150" height="150" viewBox="0 0 150 150">
                        <circle cx="75" cy="75" r="75" fill="#f5f5f5" />
                        <text x="75" y="75" textAnchor="middle" fill="#7f8c8d" fontSize="14px">No data</text>
                    </svg>
                </div>
            );
        }
        
        const radius = 75;
        const center = radius;
        let startAngle = 0;
        const svgPaths = [];

        // Function to convert from degrees to radians
        const toRadians = (angle) => angle * (Math.PI / 180);

        // Function to calculate SVG arc path
        const calculateArc = (startAngle, endAngle) => {
            const startRad = toRadians(startAngle - 90); // -90 to start from top
            const endRad = toRadians(endAngle - 90);

            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            // Determine if it's a large arc (> 180 degrees)
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

            return {
                x1, y1, x2, y2, largeArcFlag
            };
        };

        // Calculate paths for each segment
        for (const item of validData) {
            const endAngle = startAngle + (item.percentage / 100) * 360;
            const { x1, y1, x2, y2, largeArcFlag } = calculateArc(startAngle, endAngle);

            const pathData = [
                `M ${center} ${center}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
            ].join(' ');

            svgPaths.push({
                path: pathData,
                color: item.color
            });

            startAngle = endAngle;
        }

        // Add hover effects and transitions with CSS classes
        return (
            <svg width="150" height="150" viewBox="0 0 150 150" className="pie-chart-svg">
                {svgPaths.map((segment, index) => (
                    <path
                        key={index}
                        d={segment.path}
                        fill={segment.color}
                        className="pie-segment"
                        stroke="#fff"
                        strokeWidth="1"
                    />
                ))}
                {isDonut && (
                    <circle cx={center} cy={center} r={radius / 2} fill="white" className="donut-hole" />
                )}
                {isDonut && (
                    <text x={center} y={center - 5} textAnchor="middle" dominantBaseline="middle"
                        fill="#2c3e50" fontWeight="bold" fontSize="20px">
                        {statsData.totalPetitions}
                    </text>
                )}
                {isDonut && (
                    <text x={center} y={center + 15} textAnchor="middle" dominantBaseline="middle"
                        fill="#7f8c8d" fontSize="12px">
                        Total
                    </text>
                )}
            </svg>
        );
    };

    // Generate bar chart for monthly data
    const getBarChart = () => {
        if (!statsData.monthlyStats || statsData.monthlyStats.length === 0) {
            return <div className="no-data">No data available</div>;
        }
        
        const maxValue = Math.max(...statsData.monthlyStats.map(item => Math.max(item.petitions, item.resolved)), 1);

        return (
            <div className="bar-chart">
                {statsData.monthlyStats.map((month, index) => (
                    <div key={index} className="bar-group">
                        <div className="bars">
                            <div className="bar-container">
                                <div
                                    className="bar petitions-bar"
                                    style={{ height: `${(month.petitions / maxValue) * 100}%` }}
                                >
                                    <span className="bar-value">{month.petitions}</span>
                                </div>
                                <div
                                    className="bar resolved-bar"
                                    style={{ height: `${(month.resolved / maxValue) * 100}%` }}
                                >
                                    <span className="bar-value">{month.resolved}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bar-labels">
                            <span>{month.month}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="loading-container">Loading statistics data...</div>;
    }

    if (error) {
        return <div className="error-container">Error loading data: {error}</div>;
    }

    return (
        <div className="statistics-container">
            <div className="statistics-header">
                <h2>Petition Statistics</h2>
                <div className="time-range-selector">
                    <label>Time Range:</label>
                    <select value={timeRange} onChange={handleTimeRangeChange}>
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="quarter">Past Quarter</option>
                        <option value="year">Past Year</option>
                    </select>
                </div>
            </div>

            <div className="overview-cards">
                <div className="stat-card">
                    <div className="stat-icon total-icon">
                        📊
                    </div>
                    <div className="stat-info">
                        <h3>{statsData.totalPetitions}</h3>
                        <p>Total Petitions</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon resolved-icon">
                        ✅
                    </div>
                    <div className="stat-info">
                        <h3>{statsData.resolvedPetitions}</h3>
                        <p>Resolved Petitions</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon time-icon">
                        ⏱️
                    </div>
                    <div className="stat-info">
                        <h3>{statsData.averageResolutionTime}</h3>
                        <p>Avg. Resolution Time</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending-icon">
                        ⏳
                    </div>
                    <div className="stat-info">
                        <h3>{statsData.pendingPetitions}</h3>
                        <p>Pending Petitions</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon urgent-icon">
                        ⚠️
                    </div>
                    <div className="stat-info">
                        <h3>{statsData.urgentPetitions}</h3>
                        <p>Urgent Petitions</p>
                    </div>
                </div>
            </div>

            <div className="statistics-grid">
                {/* Priority Statistics */}
                <div className="stat-panel">
                    <div className="panel-header">
                        <h3>Petitions by Priority</h3>
                        <button
                            className="toggle-btn"
                            onClick={() => setShowPriorityStats(!showPriorityStats)}
                        >
                            {showPriorityStats ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {showPriorityStats && (
                        <div className="panel-body">
                            <div className="chart-container">
                                <div className="chart-visual">
                                    <PieChart data={statsData.priorityStats} />
                                </div>
                                <div className="chart-legend-container">
                                    {statsData.priorityStats.map((priority, index) => (
                                        <div key={index} className="legend-row">
                                            <div className="legend-color-box" style={{ backgroundColor: priority.color }}></div>
                                            <div className="legend-label">{priority.name}</div>
                                            <div className="legend-value">{priority.count} ({priority.percentage}%)</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Statistics */}
                <div className="stat-panel">
                    <div className="panel-header">
                        <h3>Petitions by Status</h3>
                        <button
                            className="toggle-btn"
                            onClick={() => setShowStatusStats(!showStatusStats)}
                        >
                            {showStatusStats ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {showStatusStats && (
                        <div className="panel-body">
                            <div className="chart-container">
                                <div className="chart-visual">
                                    <PieChart data={statsData.statusStats} isDonut={true} />
                                </div>
                                <div className="chart-legend-container">
                                    {statsData.statusStats.map((status, index) => (
                                        <div key={index} className="legend-row">
                                            <div className="legend-color-box" style={{ backgroundColor: status.color }}></div>
                                            <div className="legend-label">{status.name}</div>
                                            <div className="legend-value">{status.count} ({status.percentage}%)</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resolution Time Statistics */}
                <div className="stat-panel full-width">
                    <div className="panel-header">
                        <h3>Petition Volume and Resolution ({getTimeRangeText()})</h3>
                        <button
                            className="toggle-btn"
                            onClick={() => setShowResolutionTimeStats(!showResolutionTimeStats)}
                        >
                            {showResolutionTimeStats ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {showResolutionTimeStats && (
                        <div className="panel-body">
                            <div className="volume-chart-container">
                                {getBarChart()}

                                <div className="volume-chart-legend">
                                    <div className="legend-row">
                                        <div className="legend-color-box petitions-bar-bg"></div>
                                        <div className="legend-label">Petitions Received</div>
                                    </div>
                                    <div className="legend-row">
                                        <div className="legend-color-box resolved-bar-bg"></div>
                                        <div className="legend-label">Petitions Resolved</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="statistics-footer">
                <p>Note: Data shown is for {getTimeRangeText().toLowerCase()} as of {new Date().toLocaleDateString()}.</p>
            </div>
        </div>
    );
};

export default Statistics;