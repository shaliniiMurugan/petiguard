import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.css';
import ManageUsers from './ManageUsers';
import ManageOfficials from './ManageOfficials';
import Departments from './Departments';
import AdminAnalytics from './AdminAnalytics';
import SystemSettings from './SystemSettings';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPetitions: 0,
        resolvedPetitions: 0,
        pendingPetitions: 0,
        inProgressPetitions: 0,
        rejectedPetitions: 0,
        urgentPetitions: 0
    });
    const [departmentStats, setDepartmentStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/user/total');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                
                // Update stats with API data
                setStats({
                    totalPetitions: data.overall.total || 0,
                    resolvedPetitions: data.overall.resolved || 0,
                    pendingPetitions: data.overall.pending || 0,
                    inProgressPetitions: data.overall.in_progress || 0,
                    rejectedPetitions: data.overall.rejected || 0,
                    urgentPetitions: data.overall.urgent || 0
                });

                // Update department stats
                setDepartmentStats(data.departmentStatusCounts || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to determine if a path is active
    const isPathActive = (path) => {
        return location.pathname === '/admin-dashboard' + path;
    };

    const handleLogout = () => {
        navigate('/login');
    };

    if (loading) {
        return <div className="loading">Loading dashboard data...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="logo">
                    <h1>PetiGuard</h1>
                </div>
                <div className="user-info">
                    <span>Welcome, Admin</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-container">
                <aside className="sidebar">
                    <nav>
                        <ul>
                            <li className={isPathActive('') || isPathActive('/') ? 'active' : ''}>
                                <Link to="/admin-dashboard">
                                    Dashboard
                                </Link>
                            </li>
                            <li className={isPathActive('/users') ? 'active' : ''}>
                                <Link to="/admin-dashboard/users">
                                    Manage Users
                                </Link>
                            </li>
                            <li className={isPathActive('/officials') ? 'active' : ''}>
                                <Link to="/admin-dashboard/officials">
                                    Manage Officials
                                </Link>
                            </li>
                            <li className={isPathActive('/analytics') ? 'active' : ''}>
                                <Link to="/admin-dashboard/analytics">
                                    Analytics
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={
                            <div className="dashboard-overview">
                                <h2>Admin Dashboard</h2>

                                <div className="stats-grid">
                                    <div className="stats-row">
                                        <div className="stat-box">
                                            <h3>{stats.totalPetitions}</h3>
                                            <p>Total Petitions</p>
                                        </div>
                                        <div className="stat-box">
                                            <h3>{stats.resolvedPetitions}</h3>
                                            <p>Resolved Petitions</p>
                                        </div>
                                        <div className="stat-box">
                                            <h3>{stats.pendingPetitions}</h3>
                                            <p>Pending Petitions</p>
                                        </div>
                                        <div className="stat-box">
                                            <h3>{stats.inProgressPetitions}</h3>
                                            <p>In Progress</p>
                                        </div>
                                        <div className="stat-box">
                                            <h3>{stats.rejectedPetitions}</h3>
                                            <p>Rejected</p>
                                        </div>
                                    </div>
                                    <div className="stats-row urgent-row">
                                        <div className="stat-box alert">
                                            <h3>{stats.urgentPetitions}</h3>
                                            <p>Urgent Petitions</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="section-container">
                                    <div className="section">
                                        <h3>Department Statistics</h3>
                                        <div className="department-table-container">
                                            <table className="department-table">
                                                <thead>
                                                    <tr>
                                                        <th>Department</th>
                                                        <th>Total</th>
                                                        <th className="status-pending">Pending</th>
                                                        <th className="status-progress">In Progress</th>
                                                        <th className="status-resolved">Resolved</th>
                                                        <th className="status-rejected">Rejected</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {departmentStats.length > 0 ? (
                                                        departmentStats.map((dept, index) => (
                                                            <tr key={index}>
                                                                <td>{dept.department}</td>
                                                                <td>{dept.total}</td>
                                                                <td>{dept.pending}</td>
                                                                <td>{dept.in_progress}</td>
                                                                <td>{dept.resolved}</td>
                                                                <td>{dept.rejected}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="no-data">No department data available</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="/users" element={<ManageUsers />} />
                        <Route path="/officials" element={<ManageOfficials />} />
                        <Route path="/departments" element={<Departments />} />
                        <Route path="/analytics" element={<AdminAnalytics />} />
                        <Route path="/settings" element={<SystemSettings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;