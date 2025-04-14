// src/components/official/OfficialDashboard.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './OfficialDashboard.css';
import PendingPetitions from './PendingPetitions';
import ProcessPetition from './ProcessPetition';
import Statistics from './Statistics';
import axios from 'axios';

const OfficialDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        stats: {
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            urgent: 0
        },
        petitions: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get authentication token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token'); // Adjust this to match how you store your token
    };

    // Fetch dashboard data from API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = getAuthToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                const response = await axios.get('http://localhost:3000/api/user/assigned', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const { statusWithTotal } = response.data;
                
                // Process the API response to format data for the dashboard
                const stats = {
                    total: statusWithTotal.total || 0,
                    pending: 0,
                    inProgress: 0,
                    resolved: 0,
                    urgent: 0
                };

                // Map status counts from the API response
                statusWithTotal.status.forEach(item => {
                    if (item.status === 'pending') stats.pending = item.count;
                    if (item.status === 'in_progress') stats.inProgress = item.count;
                    if (item.status === 'resolved') stats.resolved = item.count;
                    if (item.status === 'urgent') stats.urgent = item.count;
                });

                // Format the petitions data
                const petitions = statusWithTotal.forms.map(form => ({
                    id: form.petitionId,
                    subject: form.petitionType,
                    location: `${form.area}, ${form.district}`,
                    submittedDate: new Date(form.created_at).toISOString().split('T')[0],
                    status: form.status,
                    priority: form.priority
                }));

                setDashboardData({
                    stats,
                    petitions
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Function to determine if a path is active
    const isPathActive = (path) => {
        return location.pathname === '/official-dashboard' + path;
    };

    const handleLogout = () => {
        // Clear auth token from storage
        localStorage.removeItem('authToken'); // Adjust this to match how you store your token
        navigate('/login');
    };

    const getPriorityClass = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'priority-high';
            case 'medium':
                return 'priority-medium';
            case 'low':
                return 'priority-low';
            default:
                return '';
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'in_progress':
                return 'status-in-progress';
            case 'resolved':
                return 'status-resolved';
            case 'urgent':
                return 'status-urgent';
            default:
                return '';
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="logo">
                    <h1>PetiGuard</h1>
                </div>
                <div className="user-info">
                    <span>Welcome, Official</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-container">
                <aside className="sidebar">
                    <nav>
                        <ul>
                            <li className={isPathActive('') || isPathActive('/') ? 'active' : ''}>
                                <Link to="/official-dashboard">
                                    Dashboard
                                </Link>
                            </li>
                            <li className={isPathActive('/pending') ? 'active' : ''}>
                                <Link to="/official-dashboard/pending">
                                    Pending Petitions
                                </Link>
                            </li>
                            <li className={isPathActive('/process') ? 'active' : ''}>
                                <Link to="/official-dashboard/process">
                                    Process Petition
                                </Link>
                            </li>
                            <li className={isPathActive('/statistics') ? 'active' : ''}>
                                <Link to="/official-dashboard/statistics">
                                    Statistics
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={
                            <div className="dashboard-overview">
                                <h2>Official Dashboard</h2>

                                {loading ? (
                                    <div className="loading-indicator">Loading dashboard data...</div>
                                ) : error ? (
                                    <div className="error-message">{error}</div>
                                ) : (
                                    <>
                                        {/* Stat cards */}
                                        <div className="overview-cards">
                                            <div className="stat-card">
                                                <div className="stat-icon total-icon">
                                                    📊
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{dashboardData.stats.total}</h3>
                                                    <p>Total Petitions</p>
                                                </div>
                                            </div>

                                            <div className="stat-card">
                                                <div className="stat-icon pending-icon">
                                                    ⏳
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{dashboardData.stats.pending}</h3>
                                                    <p>Pending</p>
                                                </div>
                                            </div>

                                            <div className="stat-card">
                                                <div className="stat-icon in-progress-icon">
                                                    🔄
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{dashboardData.stats.inProgress}</h3>
                                                    <p>In Progress</p>
                                                </div>
                                            </div>

                                            <div className="stat-card">
                                                <div className="stat-icon resolved-icon">
                                                    ✅
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{dashboardData.stats.resolved}</h3>
                                                    <p>Resolved</p>
                                                </div>
                                            </div>

                                            <div className="stat-card">
                                                <div className="stat-icon urgent-icon">
                                                    ⚠️
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{dashboardData.stats.urgent}</h3>
                                                    <p>Urgent Cases</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent petitions */}
                                        <div className="recent-petitions">
                                            <h3>Recent Petitions</h3>
                                            {dashboardData.petitions.length === 0 ? (
                                                <p>No petitions found.</p>
                                            ) : (
                                                <div className="table-container">
                                                    <table className="petitions-table">
                                                        <thead>
                                                            <tr>
                                                                <th>ID</th>
                                                                <th>Subject</th>
                                                                <th>Location</th>
                                                                <th>Submitted</th>
                                                                <th>Status</th>
                                                                <th>Priority</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dashboardData.petitions.map(petition => (
                                                                <tr key={petition.id}>
                                                                    <td>{petition.id}</td>
                                                                    <td>{petition.subject}</td>
                                                                    <td>{petition.location}</td>
                                                                    <td>{petition.submittedDate}</td>
                                                                    <td>
                                                                        <span className={`status-badge ${getStatusClass(petition.status)}`}>
                                                                            {petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`priority-badge ${getPriorityClass(petition.priority)}`}>
                                                                            {petition.priority.charAt(0).toUpperCase() + petition.priority.slice(1)}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        } />
                        <Route path="/pending" element={<PendingPetitions />} />
                        <Route path="/process" element={<ProcessPetition />} />
                        <Route path="/statistics" element={<Statistics />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default OfficialDashboard;