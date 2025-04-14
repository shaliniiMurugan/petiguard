import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';
import { districtData } from '../petitioner/districtData'; // Import your district data

const Registration = () => {
    const [userType, setUserType] = useState('petitioner');
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Common fields
        name: '',
        email: '',
        phone: '',
        dob: '',
        verificationId: '', // Aadhar/PAN (only for petitioner)

        // Address fields
        address: '',
        district: '',
        taluk: '', // Changed from city to taluk for consistency

        // Official specific fields
        department: '',
        governmentId: '',
        governmentIdType: 'aadhar',

        // Password fields
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableTaluks, setAvailableTaluks] = useState([]); // State to track available taluks

    const navigate = useNavigate();

    // Auto-hide toast after 5 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ ...toast, show: false });
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message, type) => {
        setToast({
            show: true,
            message,
            type
        });
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setStep(1);
        // Reset form when changing user type
        setFormData({
            ...formData,
            name: '',
            email: '',
            phone: '',
            dob: '',
            verificationId: '',
            address: '',
            district: '',
            taluk: '',
            department: '',
            governmentId: '',
            governmentIdType: 'aadhar',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
        setAvailableTaluks([]); // Reset available taluks
        setToast({ show: false, message: '', type: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear the error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // Handle district change and update available taluks
    const handleDistrictChange = (e) => {
        const { name, value } = e.target;
        
        // Update form data with new district
        setFormData({
            ...formData,
            [name]: value,
            taluk: '' // Reset taluk when district changes
        });

        // Clear any district error
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }

        // Update available taluks based on selected district
        if (value) {
            const taluks = districtData.taluksByDistrict[value] || [];
            setAvailableTaluks(taluks);
        } else {
            setAvailableTaluks([]);
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.dob) newErrors.dob = 'Date of Birth is required';

        // Only validate verification ID for petitioner
        if (userType === 'petitioner' && !formData.verificationId.trim()) {
            newErrors.verificationId = 'Verification ID (Aadhar/PAN) is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.district) newErrors.district = 'District is required';
        if (!formData.taluk) newErrors.taluk = 'Taluk is required';

        if (userType === 'official') {
            if (!formData.department.trim()) {
                newErrors.department = 'Department is required';
            }
            if (!formData.governmentIdType) {
                newErrors.governmentIdType = 'Government ID Type is required';
            }
            if (!formData.governmentId.trim()) {
                newErrors.governmentId = 'Government ID is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateStep3()) {
            setIsSubmitting(true);

            try {
                let apiUrl;
                let requestData;

                if (userType === 'petitioner') {
                    apiUrl = 'http://localhost:3000/api/user/register';
                    requestData = {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        dob: formData.dob,
                        verificationId: formData.verificationId,
                        address: formData.address,
                        district: formData.district,
                        taluk: formData.taluk, // Changed from city
                        role: ['user'],
                        password: formData.password,
                        confirmPassword: formData.confirmPassword
                    };
                } else {
                    apiUrl = 'http://localhost:3000/api/user/official-register';
                    requestData = {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        dob: formData.dob,
                        idProof: formData.governmentIdType,
                        idProofNo: formData.governmentId,
                        address: formData.address,
                        district: formData.district,
                        taluk: formData.taluk, // Changed from city
                        department: formData.department,
                        role: ['official'],
                        password: formData.password,
                        confirmPassword: formData.confirmPassword
                    };
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();

                if (!response.ok) {
                    // Handle API error responses
                    throw new Error(data.message || 'Registration failed');
                }

                // Show success message
                showToast('Registration successful! Redirecting to login...', 'success');

                // Redirect to login after a delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } catch (error) {
                showToast(error.message || 'Registration failed. Please try again.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderStep1 = () => (
        <div className="form-step">
            <h3>Basic Information</h3>

            <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Enter your full name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
                <label>Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email address"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Enter your 10-digit phone number"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
                <label>Date of Birth</label>
                <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={errors.dob ? 'error' : ''}
                />
                {errors.dob && <span className="error-message">{errors.dob}</span>}
            </div>

            {userType === 'petitioner' && (
                <div className="form-group">
                    <label>Verification ID (Aadhar/PAN)</label>
                    <input
                        type="text"
                        name="verificationId"
                        value={formData.verificationId}
                        onChange={handleChange}
                        className={errors.verificationId ? 'error' : ''}
                        placeholder="Enter your Aadhar or PAN number"
                    />
                    {errors.verificationId && <span className="error-message">{errors.verificationId}</span>}
                    <p className="id-hint">This is used for temporary verification purposes only</p>
                </div>
            )}

            <div className="form-action">
                <button type="button" className="next-btn" onClick={handleNext}>Next</button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="form-step">
            <h3>Address Information</h3>

            <div className="form-group">
                <label>Address</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="Enter your street address"
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
                <label className="required">District</label>
                <select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    className={errors.district ? 'error' : ''}
                >
                    <option value="">--Select--</option>
                    {districtData.districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>
                {errors.district && <span className="error-message">{errors.district}</span>}
            </div>

            <div className="form-group">
                <label className="required">Taluk</label>
                <select
                    name="taluk"
                    value={formData.taluk}
                    onChange={handleChange}
                    className={errors.taluk ? 'error' : ''}
                    disabled={!formData.district}
                >
                    <option value="">--Select--</option>
                    {availableTaluks.map(taluk => (
                        <option key={taluk} value={taluk}>{taluk}</option>
                    ))}
                </select>
                {errors.taluk && <span className="error-message">{errors.taluk}</span>}
                {!formData.district &&
                    <p className="hint-text">Please select a district first</p>
                }
            </div>

            {userType === 'official' && (
                <>
                    <div className="form-group">
                        <label>Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={errors.department ? 'error' : ''}
                        >
                            <option value="">Select Department</option>
                            <option value="Municipality / Corporation Department">Municipality / Corporation Department</option>
                            <option value="Transport Department">Transport Department</option>
                            <option value="Revenue Department">Revenue Department</option>
                            <option value="Police Department">Police Department</option>
                            <option value="Judiciary / Legal Affairs">Judiciary / Legal Affairs</option>
                            <option value="Health Department">Health Department</option>
                            <option value="Electricity Board">Electricity Board</option>
                            <option value="Water Resources Department">Water Resources Department</option>
                            <option value="Education Department">Education Department</option>
                            <option value="Social Welfare Department">Social Welfare Department</option>
                        </select>
                        {errors.department && <span className="error-message">{errors.department}</span>}
                    </div>

                    <div className="form-group">
                        <label>Government ID Type</label>
                        <select
                            name="governmentIdType"
                            value={formData.governmentIdType}
                            onChange={handleChange}
                            className={errors.governmentIdType ? 'error' : ''}
                        >
                            <option value="aadhar">Aadhar Card</option>
                            <option value="voter">Voter ID</option>
                            <option value="license">Driving License</option>
                            <option value="pan">PAN Card</option>
                        </select>
                        {errors.governmentIdType && <span className="error-message">{errors.governmentIdType}</span>}
                    </div>

                    <div className="form-group">
                        <label>Government ID</label>
                        <input
                            type="text"
                            name="governmentId"
                            value={formData.governmentId}
                            onChange={handleChange}
                            className={errors.governmentId ? 'error' : ''}
                            placeholder="Enter your government issued ID number"
                        />
                        {errors.governmentId && <span className="error-message">{errors.governmentId}</span>}
                    </div>
                </>
            )}

            <div className="form-action">
                <button type="button" className="back-btn" onClick={handleBack}>Back</button>
                <button type="button" className="next-btn" onClick={handleNext}>Next</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="form-step">
            <h3>Security Information</h3>

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create a password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
                <p className="password-hint">Password must be at least 8 characters and include uppercase, lowercase, and numbers</p>
            </div>

            <div className="form-group">
                <label>Confirm Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-action">
                <button type="button" className="back-btn" onClick={handleBack}>Back</button>
                <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="registration-container">
            <div className="registration-header">
                <h1>PetiGuard</h1>
                <p>Petition Analysis and Tracking System</p>
            </div>

            {/* Toast Notification Component */}
            {toast.show && (
                <div className={`toast toast-${toast.type}`}>
                    <div className="toast-content">
                        <span className="toast-message">{toast.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => setToast({ ...toast, show: false })}
                        >
                            ×
                        </button>
                    </div>
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
            </div>

            <div className="progress-indicator">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                <div className="step-line"></div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                <div className="step-line"></div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>

            <div className="registration-form-container">
                <form className="registration-form">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </form>

                <div className="login-link">
                    Already have an account? <a href="/login">Login here</a>
                </div>
            </div>
        </div>
    );
};

export default Registration;