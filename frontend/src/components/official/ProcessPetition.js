// src/components/official/ProcessPetition.js
import React, { useState, useEffect } from 'react';
import './ProcessPetition.css';

const ProcessPetition = () => {
    const [petitionId, setPetitionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [petitionData, setPetitionData] = useState(null);
    const [error, setError] = useState('');
    const [statusUpdate, setStatusUpdate] = useState({
        newStatus: '',
        comment: ''
    });
    const [authToken, setAuthToken] = useState('');
    
    // Available status options that match the database constraints
    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'rejected', label: 'Rejected' }
    ];

    // Get the auth token from local storage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setAuthToken(storedToken);
        } else {
            console.warn('Authentication token not found in local storage.');
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!petitionId.trim()) {
            setError('Please enter a petition ID');
            return;
        }

        if (!authToken) {
            setError('Authentication token is missing. Please log in.');
            return;
        }

        setIsLoading(true);
        setError('');
        setPetitionData(null);

        try {
            const response = await fetch('http://localhost:3000/api/user/petition-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ petitionId }),
            });

            if (!response.ok) {
                let errorMessage = `Failed to fetch petition status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (jsonError) {
                    console.error('Error parsing error JSON:', jsonError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (data && data.petition) {
                setPetitionData(data.petition);
                // Set the current status in the form
                setStatusUpdate({
                    ...statusUpdate,
                    newStatus: data.petition.status
                });
            } else {
                setError('No petition found with that ID.');
            }
        } catch (error) {
            console.error('Error fetching petition status:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStatusUpdate({
            ...statusUpdate,
            [name]: value
        });
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();

        if (!statusUpdate.newStatus) {
            setError('Please select a new status');
            return;
        }

        if (!authToken) {
            setError('Authentication token is missing. Please log in.');
            return;
        }

        setIsUpdating(true);
        setError('');

        try {
            // Make sure we're using the exact status value that matches the database constraints
            const statusValue = statusOptions.find(option => option.value === statusUpdate.newStatus)?.value || statusUpdate.newStatus;
            
            const response = await fetch('http://localhost:3000/api/user/update-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ 
                    petitionId: petitionData.petitionId,
                    status: statusValue,
                    comment: statusUpdate.comment || ''
                }),
            });

            if (!response.ok) {
                let errorMessage = `Failed to update petition status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (jsonError) {
                    console.error('Error parsing error JSON:', jsonError);
                }
                throw new Error(errorMessage);
            }

            // Refresh petition data after update
            const updatedPetition = { ...petitionData, status: statusValue };
            setPetitionData(updatedPetition);
            
            // Clear the comment field but keep the status
            setStatusUpdate({
                ...statusUpdate,
                comment: ''
            });
            
            // Show success message
            alert('Petition status updated successfully!');
            
        } catch (error) {
            console.error('Error updating petition status:', error);
            setError(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Format status for display (convert in_progress to In Progress)
    const formatStatus = (status) => {
        if (!status) return '';
        return status
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Get status class for badges
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-pending';
            case 'in_progress':
                return 'status-in-progress';
            case 'resolved':
                return 'status-resolved';
            case 'rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    return (
        <div className="process-petition-container">
            <h2>Process Petition</h2>

            <div className="search-section">
                <form onSubmit={handleSearch}>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Enter Petition ID (e.g., PET202500006)"
                            value={petitionId}
                            onChange={(e) => setPetitionId(e.target.value)}
                        />
                        <button type="submit" disabled={isLoading || !authToken}>
                            {isLoading ? 'Searching...' : 'Find Petition'}
                        </button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {!authToken && !error && <p className="warning-message">Please ensure you are logged in to process petitions.</p>}
                </form>
            </div>

            {petitionData && (
                <div className="petition-details-section">
                    <div className="petition-header">
                        <div>
                            <h3>
                                {petitionData.petitionType} Petition
                                <span className="petition-id">#{petitionData.petitionId}</span>
                            </h3>
                            <div className="petition-meta">
                                <span className={`status-badge ${getStatusClass(petitionData.status)}`}>
                                    {formatStatus(petitionData.status)}
                                </span>
                                <span className="department-badge">
                                    {petitionData.department}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="petition-content">
                        <div className="details-section">
                            <h4>Petition Details</h4>
                            <div className="detail-row">
                                <div className="detail-item">
                                    <span className="detail-label">Submitted by:</span>
                                    <span className="detail-value">{petitionData.name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Father/Husband Name:</span>
                                    <span className="detail-value">{petitionData.fatherHusbandName}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Contact:</span>
                                    <span className="detail-value">{petitionData.mobileNumber}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{petitionData.email}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Gender:</span>
                                    <span className="detail-value">{petitionData.gender}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Community:</span>
                                    <span className="detail-value">{petitionData.community}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Special Category:</span>
                                    <span className="detail-value">{petitionData.specialCategory}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Submitted on:</span>
                                    <span className="detail-value">{new Date(petitionData.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Last Updated:</span>
                                    <span className="detail-value">{new Date(petitionData.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Location:</span>
                                    <span className="detail-value">
                                        {`${petitionData.doorNumber}, ${petitionData.street}, ${petitionData.area}, ${petitionData.district}, ${petitionData.revenueVillage}`}
                                    </span>
                                </div>
                                {petitionData.assigned_official_id && (
                                    <div className="detail-item">
                                        <span className="detail-label">Assigned Official:</span>
                                        <span className="detail-value">{petitionData.assigned_official_id}</span>
                                    </div>
                                )}
                            </div>

                            <div className="description-box">
                                <h5>Description</h5>
                                <p>{petitionData.description}</p>
                            </div>
                            
                            {petitionData.attachmentPath && (
                                <div className="attachment-box">
                                    <h5>Attachment</h5>
                                    <a href={`http://localhost:3000${petitionData.attachmentPath}`} target="_blank" rel="noopener noreferrer">
                                        View Attachment
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="update-section">
                            <h4>Update Status</h4>
                            <form onSubmit={handleStatusUpdate}>
                                <div className="form-group">
                                    <label>Current Status: {formatStatus(petitionData.status)}</label>
                                    <select
                                        name="newStatus"
                                        value={statusUpdate.newStatus}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select status</option>
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Comment:</label>
                                    <textarea
                                        name="comment"
                                        value={statusUpdate.comment}
                                        onChange={handleInputChange}
                                        placeholder="Add a comment or update about this petition"
                                        rows="4"
                                    ></textarea>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="update-btn" disabled={isUpdating || !authToken}>
                                        {isUpdating ? 'Updating...' : 'Update Petition Status'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {!petitionData && !isLoading && (
                <div className="instructions">
                    <p>Enter a petition ID to find and process a petition. You can update the petition status and add comments.</p>
                    <p className="tip">Tip: Try using "PET202500006" as a sample petition ID.</p>
                </div>
            )}
        </div>
    );
};

export default ProcessPetition;