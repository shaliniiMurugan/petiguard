// src/components/admin/AdminAnalytics.js
import React, { useState } from 'react';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
    const [timeRange, setTimeRange] = useState('month');

    // Sample analytics data
    const analyticsData = {
        totalPetitions: 847,
        resolvedPetitions: 632,
        pendingPetitions: 215,
        avgResolutionTime: '7.3 days',
        satisfactionRate: '87%',

        departmentPerformance: [
            { name: 'Transport Department', petitions: 245, resolved: 192, avgTime: '6.8 days' },
            { name: 'Municipality Department', petitions: 312, resolved: 256, avgTime: '8.2 days' },
            { name: 'Public Works Department', petitions: 178, resolved: 121, avgTime: '7.5 days' },
            { name: 'Water Department', petitions: 112, resolved: 63, avgTime: '5.9 days' }
        ],

        monthlyTrends: [
            { month: 'Jan', petitions: 92, resolved: 71 },
            { month: 'Feb', petitions: 108, resolved: 89 },
            { month: 'Mar', petitions: 121, resolved: 95 },
            { month: 'Apr', petitions: 98, resolved: 82 },
            { month: 'May', petitions: 135, resolved: 110 },
            { month: 'Jun', petitions: 127, resolved: 97 },
            { month: 'Jul', petitions: 166, resolved: 88 }
        ],

        priorityDistribution: [
            { priority: 'Critical', count: 73, percentage: 8.6, color: '#e74c3c' },
            { priority: 'High', count: 215, percentage: 25.4, color: '#f39c12' },
            { priority: 'Medium', count: 348, percentage: 41.1, color: '#3498db' },
            { priority: 'Low', count: 211, percentage: 24.9, color: '#2ecc71' }
        ]
    };

    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
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

    // Generate bar chart for monthly data
    const getBarChart = () => {
        const maxValue = Math.max(...analyticsData.monthlyTrends.map(item =>
            Math.max(item.petitions, item.resolved)
        ));

        return (
            <div className="bar-chart">
                {analyticsData.monthlyTrends.map((month, index) => (
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

    // Generate SVG pie chart segments
    const createPieSegments = () => {
        const segments = [];
        let startAngle = 0;
        
        analyticsData.priorityDistribution.forEach((item, index) => {
            // Convert percentage to angle (360 degrees total)
            const angle = (item.percentage / 100) * 360;
            const endAngle = startAngle + angle;
            
            // Calculate path for arc
            const x1 = 90 + 80 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 90 + 80 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 90 + 80 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 90 + 80 * Math.sin((endAngle * Math.PI) / 180);
            
            // Determine which arc to use (large or small)
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            // Create path data
            const path = [
                `M 90 90`, // Move to center
                `L ${x1} ${y1}`, // Line to start of arc
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc to end
                'Z' // Close path
            ].join(' ');
            
            segments.push(
                <path 
                    key={index} 
                    d={path} 
                    fill={item.color} 
                    stroke="#fff" 
                    strokeWidth="1"
                />
            );
            
            startAngle = endAngle;
        });
        
        return segments;
    };

    return (
        <div className="admin-analytics-container">
            <div className="page-header">
                <h2>System Analytics</h2>
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

            <div className="analytics-overview">
                <div className="stat-card">
                    <div className="stat-value">{analyticsData.totalPetitions}</div>
                    <div className="stat-label">Total Petitions</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{analyticsData.resolvedPetitions}</div>
                    <div className="stat-label">Resolved Petitions</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{analyticsData.pendingPetitions}</div>
                    <div className="stat-label">Pending Petitions</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{analyticsData.avgResolutionTime}</div>
                    <div className="stat-label">Avg. Resolution Time</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{analyticsData.satisfactionRate}</div>
                    <div className="stat-label">Satisfaction Rate</div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="analytics-panel trends-panel">
                    <h3>Monthly Petition Trends</h3>
                    <div className="chart-container">
                        {getBarChart()}
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-color petitions-color"></div>
                                <span>Petitions Received</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color resolved-color"></div>
                                <span>Petitions Resolved</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="analytics-panel performance-panel">
                    <h3>Department Performance</h3>
                    <div className="performance-table-container">
                        <table className="performance-table">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Petitions</th>
                                    <th>Resolved</th>
                                    <th>Resolution Rate</th>
                                    <th>Avg. Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.departmentPerformance.map((dept, index) => (
                                    <tr key={index}>
                                        <td>{dept.name}</td>
                                        <td>{dept.petitions}</td>
                                        <td>{dept.resolved}</td>
                                        <td>{Math.round((dept.resolved / dept.petitions) * 100)}%</td>
                                        <td>{dept.avgTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="analytics-panel priority-panel">
                    <h3>Priority Distribution</h3>
                    <div className="priority-chart">
                        <div className="pie-chart-container">
                            <svg width="180" height="180" viewBox="0 0 180 180">
                                {createPieSegments()}
                            </svg>
                        </div>

                        <div className="pie-legend">
                            {analyticsData.priorityDistribution.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <div 
                                        className="legend-color" 
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span>
                                        {item.priority}: {item.count} ({item.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="analytics-footer">
                <p>Data shown is for {getTimeRangeText().toLowerCase()}. Last updated: Today at 9:00 AM</p>
            </div>
        </div>
    );
};

export default AdminAnalytics;