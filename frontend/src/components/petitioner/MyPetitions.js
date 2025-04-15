// src/components/petitioner/MyPetitions.js
import React, { useState, useEffect } from 'react';
import './MyPetitions.css';
import axios from 'axios';

const MyPetitions = () => {
    const [petitions, setPetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedPetition, setSelectedPetition] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPetitions = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:3000/api/user/petition', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPetitions(response.data.petitions);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Could not fetch petitions.');
            } finally {
                setLoading(false);
            }
        };

        fetchPetitions();
    }, []);

    const filteredPetitions = filter === 'all'
        ? petitions
        : petitions.filter(petition => petition.status.toLowerCase() === filter.toLowerCase());

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'in progress':
                return 'status-progress';
            case 'resolved':
            case 'completed':
                return 'status-resolved';
            case 'rejected':
            case 'cancelled':
                return 'status-rejected';
            default:
                return '';
        }
    };

    const handleViewDetails = (petition) => {
        setSelectedPetition(petition);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPetition(null);
    };

    if (loading) {
        return <div>Loading petitions...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="my-petitions-container">
            <div className="petition-header">
                <h2>My Petitions</h2>
                <div className="filter-options">
                    <span>Filter by Status: </span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {filteredPetitions.length === 0 ? (
                <div className="no-petitions">
                    <p>No petitions found.</p>
                </div>
            ) : (
                <div className="petitions-list">
                    {filteredPetitions.map(petition => (
                        <div key={petition.id} className="petition-card">
                            <div className="petition-header">
                                <h3>{petition.petitionType}</h3>
                                <span className={`status-badge ${getStatusClass(petition.status)}`}>
                                    {petition.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="petition-details">
                                <div className="detail-row">
                                    <span className="detail-label">Petition ID:</span>
                                    <span className="detail-value">{petition.petitionId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Department:</span>
                                    <span className="detail-value">{petition.department}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Submitted:</span>
                                    <span className="detail-value">{new Date(petition.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Last Updated:</span>
                                    <span className="detail-value">{new Date(petition.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="petition-actions">
                                <button className="view-details-btn" onClick={() => handleViewDetails(petition)}>View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for displaying full petition details */}
            {isModalOpen && selectedPetition && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleCloseModal}>&times;</span>
                        <h2>Petition Details</h2>
                        <div className="detail-row">
                            <span className="detail-label">Petition ID:</span>
                            <span className="detail-value">{selectedPetition.petitionId}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Petition Type:</span>
                            <span className="detail-value">{selectedPetition.petitionType}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Department:</span>
                            <span className="detail-value">{selectedPetition.department}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Description:</span>
                            <span className="detail-value">{selectedPetition.description}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{selectedPetition.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Father/Husband Name:</span>
                            <span className="detail-value">{selectedPetition.fatherHusbandName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Mobile Number:</span>
                            <span className="detail-value">{selectedPetition.mobileNumber}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Gender:</span>
                            <span className="detail-value">{selectedPetition.gender}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Community:</span>
                            <span className="detail-value">{selectedPetition.community}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Special Category:</span>
                            <span className="detail-value">{selectedPetition.specialCategory}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Door Number:</span>
                            <span className="detail-value">{selectedPetition.doorNumber}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Street:</span>
                            <span className="detail-value">{selectedPetition.street}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Area:</span>
                            <span className="detail-value">{selectedPetition.area}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">District:</span>
                            <span className="detail-value">{selectedPetition.district}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Revenue Village:</span>
                            <span className="detail-value">{selectedPetition.revenueVillage}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{selectedPetition.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className={`detail-value ${getStatusClass(selectedPetition.status)}`}>{selectedPetition.status.toUpperCase()}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Assigned Official ID:</span>
                            <span className="detail-value">{selectedPetition.assigned_official_id}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Attachment Path:</span>
                            <span className="detail-value">{selectedPetition.attachmentPath || 'No Attachment'}</span>
                            {selectedPetition.attachmentPath && (
                                <a href={`http://localhost:3000${selectedPetition.attachmentPath}`} target="_blank" rel="noopener noreferrer">View Attachment</a>
                            )}
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Created At:</span>
                            <span className="detail-value">{new Date(selectedPetition.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Updated At:</span>
                            <span className="detail-value">{new Date(selectedPetition.updatedAt).toLocaleString()}</span>
                        </div>
                        <button onClick={handleCloseModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPetitions;