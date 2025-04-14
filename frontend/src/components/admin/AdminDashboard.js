// src/components/admin/AdminDashboard.js
import React from 'react';
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

    // Function to determine if a path is active
    const isPathActive = (path) => {
        return location.pathname === '/admin-dashboard' + path;
    };

    // Sample data
    const stats = {
        totalPetitions: 156,
        resolvedPetitions: 87,
        averageResolutionTime: '8.5 days',
        pendingPetitions: 55,
        urgentPetitions: 15
    };

    const departmentStats = [
        { name: 'Transport Department', count: 45, percentage: 31.7 },
        { name: 'Municipality Department', count: 62, percentage: 43.7 },
        { name: 'Water Department', count: 18, percentage: 12.7 },
        { name: 'Public Works Department', count: 17, percentage: 12.0 }
    ];

    const handleLogout = () => {
        navigate('/login');
    };

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
                            {/* <li className={isPathActive('/departments') ? 'active' : ''}>
                                <Link to="/admin-dashboard/departments">
                                    Departments
                                </Link>
                            </li> */}
                            <li className={isPathActive('/analytics') ? 'active' : ''}>
                                <Link to="/admin-dashboard/analytics">
                                    Analytics
                                </Link>
                            </li>
                            {/* <li className={isPathActive('/settings') ? 'active' : ''}>
                                <Link to="/admin-dashboard/settings">
                                    System Settings
                                </Link>
                            </li> */}
                        </ul>
                    </nav>
                </aside>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={
                            <div className="dashboard-overview">
                                <h2>Admin Dashboard</h2>

                                <div className="stats-container">
                                    <div className="stat-box">
                                        <h3>{stats.totalPetitions}</h3>
                                        <p>Total Petitions</p>
                                    </div>
                                    <div className="stat-box">
                                        <h3>{stats.resolvedPetitions}</h3>
                                        <p>Resolved Petitions</p>
                                    </div>
                                    <div className="stat-box">
                                        <h3>{stats.averageResolutionTime}</h3>
                                        <p>Avg. Resolution Time</p>
                                    </div>
                                    <div className="stat-box">
                                        <h3>{stats.pendingPetitions}</h3>
                                        <p>Pending Petitions</p>
                                    </div>
                                    <div className="stat-box alert">
                                        <h3>{stats.urgentPetitions}</h3>
                                        <p>Urgent Petitions</p>
                                    </div>
                                </div>

                                <div className="admin-sections">
                                    <div className="section">
                                        <h3>Department Statistics</h3>
                                        <div className="department-stats">
                                            {departmentStats.map((dept, index) => (
                                                <div key={index} className="department-stat-item">
                                                    <div className="department-name">{dept.name}</div>
                                                    <div className="department-count">{dept.count}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* <div className="section">
                                        <h3>Quick Actions</h3>
                                        <div className="quick-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => navigate('/admin-dashboard/officials')}
                                            >
                                                Add New Official
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={() => navigate('/admin-dashboard/analytics')}
                                            >
                                                System Reports
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={() => navigate('/admin-dashboard/departments')}
                                            >
                                                Manage Departments
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={() => navigate('/admin-dashboard/settings')}
                                            >
                                                AI Settings
                                            </button>
                                        </div>
                                    </div> */}
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