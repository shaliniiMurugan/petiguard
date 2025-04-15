// src/components/petitioner/PetitionerDashboard.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import PetitionForm from './PetitionForm';
import MyPetitions from './MyPetitions';
import PetitionStatus from './PetitionStatus';
import HelpSupport from './HelpSupport';
import './PetitionerDashboard.css';

const PetitionerDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [petitionStats, setPetitionStats] = useState({
        total: 0,
        pending: 0,
        in_progress: 0,
        underReview: 0,
        resolved: 0,
        closed: 0,
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [showChart, setShowChart] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoadingRecentActivity, setIsLoadingRecentActivity] = useState(false);
    const [errorRecentActivity, setErrorRecentActivity] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setAuthToken(storedToken);
            fetchPetitionStats(storedToken);
            fetchRecentActivityData(storedToken);
        } else {
            console.warn('Authentication token not found in local storage.');
            setErrorStats('Authentication token is required. Please log in.');
            setIsLoadingStats(false);
            setErrorRecentActivity('Authentication token is required. Please log in.');
            setIsLoadingRecentActivity(false);
            navigate('/login'); // Redirect to login if no token
        }
    }, [navigate]); // Added navigate to dependency array

    const fetchPetitionStats = async (token) => {
        setIsLoadingStats(true);
        setErrorStats('');
        try {
            const response = await fetch('http://localhost:3000/api/user/status', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch petition status counts: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.statusWithTotal && data.statusWithTotal.status) {
                const stats = {
                    total: data.statusWithTotal.total,
                    pending: data.statusWithTotal.status.find(s => s.status === 'pending')?.count || 0,
                    in_progress: data.statusWithTotal.status.find(s => s.status === 'in_progress')?.count || 0,
                    underReview: data.statusWithTotal.status.find(s => s.status === 'under review')?.count || 0,
                    resolved: data.statusWithTotal.status.find(s => s.status === 'resolved')?.count || 0,
                    closed: data.statusWithTotal.status.find(s => s.status === 'closed')?.count || 0,
                };
                setPetitionStats(stats);
            } else {
                setErrorStats('Failed to load petition status counts.');
            }
        } catch (error) {
            console.error('Error fetching petition status counts:', error);
            setErrorStats(error.message);
        } finally {
            setIsLoadingStats(false);
        }
    };

    const fetchRecentActivityData = async (token) => {
        setIsLoadingRecentActivity(true);
        setErrorRecentActivity('');
        try {
            const response = await fetch('http://localhost:3000/api/user/recent-activity', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch recent activity: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.petitions) {
                setRecentActivity(data.petitions);
            } else {
                setErrorRecentActivity('Failed to load recent activity.');
            }
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            setErrorRecentActivity(error.message);
        } finally {
            setIsLoadingRecentActivity(false);
        }
    };

    const getPercentage = (value) => {
        return (petitionStats.total > 0 ? ((value / petitionStats.total) * 100).toFixed(1) : '0.0');
    };

    const isPathActive = (path) => {
        return location.pathname === '/petitioner-dashboard' + path;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getStatColor = (type) => {
        switch (type) {
            case 'pending':
                return '#F5A623'; // Orange
            case 'in_progress':
                return '#3498db'; // Blue
            case 'underReview':
                return '#9B59B6'; // Purple
            case 'resolved':
                return '#2ecc71'; // Green
            case 'closed':
                return '#34495e'; // Dark slate
            default:
                return '#3498db';
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="logo">
                    <h1>PetiGuard</h1>
                </div>
                <div className="user-info">
                    <span>Welcome, Petitioner</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-container">
                <aside className="sidebar">
                    <nav>
                        <ul>
                            <li className={isPathActive('') || isPathActive('/') ? 'active' : ''}>
                                <Link to="/petitioner-dashboard">
                                    Dashboard
                                </Link>
                            </li>
                            <li className={isPathActive('/submit') ? 'active' : ''}>
                                <Link to="/petitioner-dashboard/submit">
                                    Submit Petition
                                </Link>
                            </li>
                            <li className={isPathActive('/my-petitions') ? 'active' : ''}>
                                <Link to="/petitioner-dashboard/my-petitions">
                                    My Petitions
                                </Link>
                            </li>
                            <li className={isPathActive('/status') ? 'active' : ''}>
                                <Link to="/petitioner-dashboard/status">
                                    Track Status
                                </Link>
                            </li>
                            <li className={isPathActive('/help-support') ? 'active' : ''}>
                                <Link to="/petitioner-dashboard/help-support">
                                    Help & Support
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={
                            <div className="dashboard-overview">
                                <h2>Dashboard Overview</h2>

                                {isLoadingStats && <p>Loading petition statistics...</p>}
                                {errorStats && <p className="error-message">{errorStats}</p>}

                                {!isLoadingStats && !errorStats && (
                                    <>
                                        {/* Stats Cards */}
                                        <div className="stats-container">
                                            <div className="stat-box" style={{ borderTop: `4px solid ${getStatColor('total')}` }}>
                                                <h3>{petitionStats.total}</h3>
                                                <p>TOTAL PETITIONS</p>
                                            </div>
                                            <div className="stat-box" style={{ borderTop: `4px solid ${getStatColor('pending')}` }}>
                                                <h3>{petitionStats.pending}</h3>
                                                <p>PENDING</p>
                                            </div>
                                            <div className="stat-box" style={{ borderTop: `4px solid ${getStatColor('in_progress')}` }}>
                                                <h3>{petitionStats.in_progress}</h3>
                                                <p>IN PROGRESS</p>
                                            </div>
                                            <div className="stat-box" style={{ borderTop: `4px solid ${getStatColor('resolved')}` }}>
                                                <h3>{petitionStats.resolved}</h3>
                                                <p>RESOLVED</p>
                                            </div>
                                        </div>

                                        {/* Donut Chart */}
                                        {showChart && (
                                            <div className="chart-container">
                                                <div className="chart-header">
                                                    <h3>Petitions by Status</h3>
                                                    <button className="hide-btn" onClick={() => setShowChart(false)}>
                                                        Hide
                                                    </button>
                                                </div>
                                                <div className="donut-chart-container">
                                                    <div className="donut-chart">
                                                        <div className="donut-hole">
                                                            <div className="donut-total">{petitionStats.total}</div>
                                                            <div className="donut-label">Total</div>
                                                        </div>
                                                    </div>
                                                    <div className="status-legend">
                                                        <div className="legend-item">
                                                            <div className="legend-color" style={{ backgroundColor: getStatColor('pending') }}></div>
                                                            <div className="legend-label">Pending</div>
                                                            <div className="legend-value">{petitionStats.pending} ({getPercentage(petitionStats.pending)}%)</div>
                                                        </div>
                                                        <div className="legend-item">
                                                            <div className="legend-color" style={{ backgroundColor: getStatColor('in_progress') }}></div>
                                                            <div className="legend-label">In Progress</div>
                                                            <div className="legend-value">{petitionStats.in_progress} ({getPercentage(petitionStats.in_progress)}%)</div>
                                                        </div>
                                                        <div className="legend-item">
                                                            <div className="legend-color" style={{ backgroundColor: getStatColor('underReview') }}></div>
                                                            <div className="legend-label">Under Review</div>
                                                            <div className="legend-value">{petitionStats.underReview} ({getPercentage(petitionStats.underReview)}%)</div>
                                                        </div>
                                                        <div className="legend-item">
                                                            <div className="legend-color" style={{ backgroundColor: getStatColor('resolved') }}></div>
                                                            <div className="legend-label">Resolved</div>
                                                            <div className="legend-value">{petitionStats.resolved} ({getPercentage(petitionStats.resolved)}%)</div>
                                                        </div>
                                                        <div className="legend-item">
                                                            <div className="legend-color" style={{ backgroundColor: getStatColor('closed') }}></div>
                                                            <div className="legend-label">Closed</div>
                                                            <div className="legend-value">{petitionStats.closed} ({getPercentage(petitionStats.closed)}%)</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Recent Activity */}
                                        <div className="recent-activity">
                                            <h3>Recent Activity</h3>
                                            {isLoadingRecentActivity && <p>Loading recent activity...</p>}
                                            {errorRecentActivity && <p className="error-message">{errorRecentActivity}</p>}
                                            {!isLoadingRecentActivity && !errorRecentActivity && recentActivity.length > 0 ? (
                                                <div className="activity-list">
                                                    {recentActivity.map(activity => (
                                                        <div className="activity-item" key={activity.petitionId}>
                                                            <div className="activity-icon" style={{ backgroundColor: getStatColor(activity.status) }}></div>
                                                            <div className="activity-content">
                                                                <div className="activity-time">{new Date(activity.updatedAt).toLocaleDateString()}</div>
                                                                <div className="activity-description">
                                                                    Petition #{activity.petitionId} ({activity.petitionType}) - Status: {activity.status} - {activity.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (!isLoadingRecentActivity && !errorRecentActivity && (
                                                <p>No recent activity found.</p>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        } />
                        <Route path="/submit" element={<PetitionForm />} />
                        <Route path="/my-petitions" element={<MyPetitions />} />
                        <Route path="/status" element={<PetitionStatus />} />
                        <Route path="/help-support" element={<HelpSupport />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default PetitionerDashboard;