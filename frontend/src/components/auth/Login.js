// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [userType, setUserType] = useState('petitioner');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        govtId: '',
        govtIdType: 'Aadhar',
        verificationId: '',
        adminCode: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Default admin credentials
    const DEFAULT_ADMIN = {
        email: 'admin@gmail.com',
        password: 'Admin@123',
        adminCode: 'Admin25'
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
        // Reset form when changing user type
        setFormData({
            email: '',
            password: '',
            govtId: '',
            govtIdType: 'Aadhar',
            verificationId: '',
            adminCode: ''
        });
        setErrors({});
        setAlert({ show: false, message: '', type: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        // Verification ID validation for petitioner
        if (userType === 'petitioner' && !formData.verificationId) {
            newErrors.verificationId = 'Verification ID is required';
        }

        // Government ID validation for official
        if (userType === 'official') {
            if (!formData.govtIdType) {
                newErrors.govtIdType = 'Select ID type';
            }
            if (!formData.govtId) {
                newErrors.govtId = 'Government ID is required';
            }
        }

        if (userType === 'admin' && !formData.adminCode) {
            newErrors.adminCode = 'Admin code is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);

            try {
                let response;

                if (userType === 'petitioner') {
                    // User login API
                    const userPayload = {
                        email: formData.email,
                        password: formData.password,
                        verificationId: formData.verificationId
                    };

                    response = await axios.post('http://localhost:3000/api/user/login', userPayload);

                    if (response.data.status === 200) {
                        // Store token and user data
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('userData', JSON.stringify(response.data.user));

                        // Show success message
                        setAlert({
                            show: true,
                            message: 'Login successful! Redirecting...',
                            type: 'success'
                        });

                        // Redirect to dashboard
                        setTimeout(() => {
                            navigate('/petitioner-dashboard');
                        }, 1500);
                    }
                } else if (userType === 'official') {
                    // Official login API
                    const officialPayload = {
                        email: formData.email,
                        password: formData.password,
                        idProof: formData.govtIdType,
                        idProofNo: formData.govtId
                    };

                    response = await axios.post('http://localhost:3000/api/user/official-login', officialPayload);

                    if (response.data.status === 200) {
                        // Store token and official data
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('officialData', JSON.stringify(response.data.official));

                        // Show success message
                        setAlert({
                            show: true,
                            message: 'Login successful! Redirecting...',
                            type: 'success'
                        });

                        // Redirect to dashboard
                        setTimeout(() => {
                            navigate('/official-dashboard');
                        }, 1500);
                    }
                } else if (userType === 'admin') {
                    // Admin authentication logic
                    if (
                        formData.email === DEFAULT_ADMIN.email &&
                        formData.password === DEFAULT_ADMIN.password &&
                        formData.adminCode === DEFAULT_ADMIN.adminCode
                    ) {
                        // Store admin data in localStorage
                        localStorage.setItem('token', 'admin-token');
                        localStorage.setItem('adminData', JSON.stringify({
                            email: formData.email,
                            role: 'admin'
                        }));

                        // Show success message
                        setAlert({
                            show: true,
                            message: 'Admin login successful! Redirecting...',
                            type: 'success'
                        });

                        // Redirect to admin dashboard
                        setTimeout(() => {
                            navigate('/admin-dashboard');
                        }, 1500);
                    } else {
                        // Show toast for failed admin authentication
                        setAlert({
                            show: true,
                            message: 'Invalid admin credentials. Please try again.',
                            type: 'error'
                        });
                    }
                }
            } catch (error) {
                console.error('Login error:', error);

                // Show error message
                setAlert({
                    show: true,
                    message: error.response?.data?.message || 'Login failed. Please check your credentials.',
                    type: 'error'
                });
            } finally {
                setIsLoading(false);

                // Auto-hide alert after 5 seconds
                setTimeout(() => {
                    setAlert({ show: false, message: '', type: '' });
                }, 5000);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <h1>PetiGuard</h1>
                <p>Petition Analysis and Tracking System</p>
            </div>

            {alert.show && (
                <div className={`alert alert-${alert.type}`}>
                    {alert.message}
                    <button className="close-alert" onClick={() => setAlert({ show: false, message: '', type: '' })}>×</button>
                </div>
            )}

            <div className="user-type-selector">
                <button
                    className={userType === 'petitioner' ? 'active' : ''}
                    onClick={() => handleUserTypeChange('petitioner')}
                >
                    Petitioner
                </button>
                <button
                    className={userType === 'official' ? 'active' : ''}
                    onClick={() => handleUserTypeChange('official')}
                >
                    Official
                </button>
                <button
                    className={userType === 'admin' ? 'active' : ''}
                    onClick={() => handleUserTypeChange('admin')}
                >
                    Admin
                </button>
            </div>

            <div className="login-form-container">
                <form onSubmit={handleSubmit} className="login-form">
                    {userType === 'petitioner' && (
                        <>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    className={errors.email ? 'error' : ''}
                                    required
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'error' : ''}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>
                            <div className="form-group">
                                <label>Verification ID (Aadhar/PAN)</label>
                                <input
                                    type="text"
                                    name="verificationId"
                                    value={formData.verificationId}
                                    onChange={handleChange}
                                    className={errors.verificationId ? 'error' : ''}
                                    required
                                />
                                {errors.verificationId && <div className="error-message">{errors.verificationId}</div>}
                            </div>
                        </>
                    )}

                    {userType === 'official' && (
                        <>
                            <div className="form-group">
                                <label>Official Email ID</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    required
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'error' : ''}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>
                            <div className="form-group">
                                <label>Government ID Type</label>
                                <select
                                    name="govtIdType"
                                    value={formData.govtIdType}
                                    onChange={handleChange}
                                    className={errors.govtIdType ? 'error' : ''}
                                    required
                                >
                                    <option value="Aadhar">Aadhar Card</option>
                                    <option value="voter">Voter ID</option>
                                    <option value="license">Driving License</option>
                                    <option value="pan">PAN Card</option>
                                </select>
                                {errors.govtIdType && <div className="error-message">{errors.govtIdType}</div>}
                            </div>
                            <div className="form-group">
                                <label>ID Number</label>
                                <input
                                    type="text"
                                    name="govtId"
                                    value={formData.govtId}
                                    onChange={handleChange}
                                    className={errors.govtId ? 'error' : ''}
                                    required
                                />
                                {errors.govtId && <div className="error-message">{errors.govtId}</div>}
                            </div>
                        </>
                    )}
                    {userType === 'admin' && (
                        <>
                            <div className="form-group">
                                <label>Admin Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    required
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'error' : ''}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>
                            <div className="form-group">
                                <label>Admin Authorization Code</label>
                                <input
                                    type="password"
                                    name="adminCode"
                                    value={formData.adminCode}
                                    onChange={handleChange}
                                    className={errors.adminCode ? 'error' : ''}
                                    required
                                />
                                {errors.adminCode && <div className="error-message">{errors.adminCode}</div>}
                            </div>
                        </>
                    )}

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
            <div className="register-link">
                {userType != 'admin' &&
                    <div>
                        Don't have an account? <a href="/register">Register here</a>
                    </div>
                }
            </div>
        </div>
    );
};

export default Login;