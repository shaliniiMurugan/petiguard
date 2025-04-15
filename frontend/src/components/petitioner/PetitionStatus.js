// src/components/petitioner/PetitionStatus.js
import React, { useState, useEffect } from 'react';
import './PetitionStatus.css';

const PetitionStatus = () => {
    const [petitionId, setPetitionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [petitionData, setPetitionData] = useState(null);
    const [error, setError] = useState('');
    const [authToken, setAuthToken] = useState(''); // State to hold the auth token

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
                // Updated to match the new response structure
                setPetitionData(data.petition);
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

    const getStatusIcon = (status) => {
        // Convert status like "in_progress" to "in progress" for display
        const formattedStatus = status ? status.replace(/_/g, ' ') : '';
        
        switch (formattedStatus.toLowerCase()) {
            case 'submitted':
                return '📝';
            case 'under review':
                return '🔍';
            case 'in progress':
                return '🔧';
            case 'resolved':
                return '✅';
            case 'pending':
                return '⏳';
            default:
                return '📋';
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

    return (
        <div className="petition-status-container">
            <h2>Track Petition Status</h2>

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
                            {isLoading ? 'Searching...' : 'Track'}
                        </button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {!authToken && !error && <p className="warning-message">Please ensure you are logged in to track your petition.</p>}
                </form>
            </div>

            {petitionData && (
                <div className="status-result">
                    <div className="petition-overview">
                        <h3>Petition Overview</h3>
                        <div className="overview-details">
                            <div className="detail-group">
                                <label>Petition ID:</label>
                                <p>{petitionData.petitionId}</p>
                            </div>
                            <div className="detail-group">
                                <label>Petition Type:</label>
                                <p>{petitionData.petitionType}</p>
                            </div>
                            <div className="detail-group">
                                <label>Department:</label>
                                <p>{petitionData.department}</p>
                            </div>
                            <div className="detail-group">
                                <label>Name:</label>
                                <p>{petitionData.name}</p>
                            </div>
                            <div className="detail-group">
                                <label>Father/Husband Name:</label>
                                <p>{petitionData.fatherHusbandName}</p>
                            </div>
                            <div className="detail-group">
                                <label>Mobile Number:</label>
                                <p>{petitionData.mobileNumber}</p>
                            </div>
                            <div className="detail-group">
                                <label>Current Status:</label>
                                <p className="status">
                                    {getStatusIcon(petitionData.status)} {formatStatus(petitionData.status)}
                                </p>
                            </div>
                            <div className="detail-group">
                                <label>Submitted:</label>
                                <p>{new Date(petitionData.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="detail-group">
                                <label>Last Updated:</label>
                                <p>{new Date(petitionData.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="petition-details">
                        <h3>Petition Details</h3>
                        <div className="detail-group">
                            <label>Description:</label>
                            <p>{petitionData.description}</p>
                        </div>
                        <div className="detail-group">
                            <label>Gender:</label>
                            <p>{petitionData.gender}</p>
                        </div>
                        <div className="detail-group">
                            <label>Community:</label>
                            <p>{petitionData.community}</p>
                        </div>
                        <div className="detail-group">
                            <label>Special Category:</label>
                            <p>{petitionData.specialCategory}</p>
                        </div>
                        <div className="detail-group">
                            <label>Email:</label>
                            <p>{petitionData.email}</p>
                        </div>
                        <div className="detail-group">
                            <label>Address:</label>
                            <p>{`${petitionData.doorNumber}, ${petitionData.street}, ${petitionData.area}, ${petitionData.district}, ${petitionData.revenueVillage}`}</p>
                        </div>
                        {petitionData.assigned_official_id && (
                            <div className="detail-group">
                                <label>Assigned Official:</label>
                                <p>{petitionData.assigned_official_id}</p>
                            </div>
                        )}
                        {petitionData.attachmentPath && (
                            <div className="detail-group">
                                <label>Attachment:</label>
                                <a href={`http://localhost:3000${petitionData.attachmentPath}`} target="_blank" rel="noopener noreferrer">View Attachment</a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="help-section">
                <h4>Need Help?</h4>
                <p>If you've forgotten your petition ID or have any other questions, please contact our support team at <a href="mailto:support@petiguard.gov">support@petiguard.gov</a> or call us at 1-800-PETITION.</p>
            </div>
        </div>
    );
};

export default PetitionStatus;