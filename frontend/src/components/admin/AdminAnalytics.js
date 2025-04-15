// src/components/admin/AdminAnalytics.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAnalytics.css';

// Create a base API URL constant for easier environment switching
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const AdminAnalytics = () => {
    const [timeRange, setTimeRange] = useState('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        totalPetitions: 0,
        resolvedPetitions: 0,
        pendingPetitions: 0,
        avgResolutionTime: '0 days',
        satisfactionRate: '0%',
        departmentPerformance: [],
        monthlyTrends: [], // Keep this placeholder for display handling
        priorityDistribution: []
    });

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch all the required data in parallel - without trends
            const [overviewResponse, departmentsResponse, prioritiesResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/user/overview?timeRange=${timeRange}`),
                axios.get(`${API_BASE_URL}/user/departments?timeRange=${timeRange}`),
                axios.get(`${API_BASE_URL}/user/priorities?timeRange=${timeRange}`)
            ]);

            setAnalyticsData({
                ...overviewResponse.data,
                departmentPerformance: departmentsResponse.data,
                monthlyTrends: [], // Set empty array since we're not fetching trends
                priorityDistribution: prioritiesResponse.data
            });
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            setError('Failed to load analytics data. Please try again later.');
            
            // Keep previous data if available
            setAnalyticsData(prevData => ({
                ...prevData,
                departmentPerformance: prevData.departmentPerformance || [],
                monthlyTrends: prevData.monthlyTrends || [],
                priorityDistribution: prevData.priorityDistribution || []
            }));
        } finally {
            setLoading(false);
        }
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
        if (!analyticsData.monthlyTrends || analyticsData.monthlyTrends.length === 0) {
            return <div className="no-data">No trend data available</div>;
        }

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
                                    style={{ height: `${maxValue ? (month.petitions / maxValue) * 100 : 0}%` }}
                                >
                                    <span className="bar-value">{month.petitions}</span>
                                </div>
                                <div
                                    className="bar resolved-bar"
                                    style={{ height: `${maxValue ? (month.resolved / maxValue) * 100 : 0}%` }}
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
        if (!analyticsData.priorityDistribution || analyticsData.priorityDistribution.length === 0) {
            return null;
        }

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

    // Calculate resolution rate with proper error handling
    const calculateResolutionRate = (resolved, total) => {
        if (!total) return 0;
        return Math.round((resolved / total) * 100);
    };

    // Show error state if API requests failed
    if (error) {
        return (
            <div className="admin-analytics-container">
                <div className="error-message">
                    <h3>Error Loading Data</h3>
                    <p>{error}</p>
                    <button onClick={fetchAnalyticsData} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Show loading state
    if (loading) {
        return <div className="loading-spinner">Loading analytics data...</div>;
    }

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

                {/* <div className="stat-card">
                    <div className="stat-value">{analyticsData.satisfactionRate}</div>
                    <div className="stat-label">Satisfaction Rate</div>
                </div> */}
            </div>

            <div className="analytics-grid">
                {/* <div className="analytics-panel trends-panel">
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
                </div> */}

                <div className="analytics-panel performance-panel">
                    <h3>Department Performance</h3>
                    <div className="performance-table-container">
                        {analyticsData.departmentPerformance && analyticsData.departmentPerformance.length > 0 ? (
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
                                            <td>{calculateResolutionRate(dept.resolved, dept.petitions)}%</td>
                                            <td>{dept.avgTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-data">No department data available</div>
                        )}
                    </div>
                </div>

                <div className="analytics-panel priority-panel">
                    <h3>Priority Distribution</h3>
                    <div className="priority-chart">
                        {analyticsData.priorityDistribution && analyticsData.priorityDistribution.length > 0 ? (
                            <>
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
                            </>
                        ) : (
                            <div className="no-data">No priority data available</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="analytics-footer">
                <p>Data shown is for {getTimeRangeText().toLowerCase()}. Last updated: {new Date().toLocaleString()}</p>
                <button onClick={fetchAnalyticsData} className="refresh-button">
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default AdminAnalytics;