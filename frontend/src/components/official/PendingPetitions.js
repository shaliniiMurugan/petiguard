
import React, { useState, useEffect } from 'react';
import './PendingPetitions.css';

const PendingPetitions = () => {
    const [petitions, setPetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [filter, setFilter] = useState({
        priority: 'all',
        searchTerm: '',
    });

    const [modalData, setModalData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAttachment, setShowAttachment] = useState(false);

    // Fetch petitions data from API
    useEffect(() => {
        const fetchPetitions = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/api/user/assigned', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch petitions');
                }

                const data = await response.json();

                // Transform API data
                const transformedData = data.statusWithTotal.forms.map(petition => ({
                    id: petition.petitionId,
                    subject: petition.petitionType,
                    description: petition.description,
                    location: `${petition.area}, ${petition.district}`,
                    submittedDate: new Date(petition.created_at).toLocaleDateString(),
                    priority: petition.priority || 'Medium',
                    petitioner: petition.name,
                    contact: petition.mobileNumber || petition.email,
                    status: petition.status,
                    attachment: petition.attachmentPath ? `http://localhost:3000${petition.attachmentPath}` : '/api/placeholder/600/400',
                    selected: false,
                    expanded: false,
                    raw: petition
                }));

                setPetitions(transformedData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching petitions:', err);
                setError('Failed to load petitions. Please try again.');
                setLoading(false);
            }
        };

        fetchPetitions();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    const handleCheckboxChange = (id) => {
        setPetitions(prevPetitions =>
            prevPetitions.map(petition =>
                petition.id === id ? { ...petition, selected: !petition.selected } : petition
            )
        );
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setPetitions(prevPetitions =>
            prevPetitions.map(petition => (
                petition.status === activeTab ? { ...petition, selected: isChecked } : petition
            ))
        );
    };

    const toggleAccordion = (id) => {
        setPetitions(prevPetitions =>
            prevPetitions.map(petition =>
                petition.id === id ? { ...petition, expanded: !petition.expanded } : petition
            )
        );
    };

    const handleViewDetails = (petition) => {
        setModalData(petition);
        setShowModal(true);
        setShowAttachment(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowAttachment(false);
    };

    const toggleAttachment = () => {
        setShowAttachment(!showAttachment);
    };

    // Update petition status via API
    const updatePetitionStatus = async (petitionIds, newStatus) => {
        try {
            const token = localStorage.getItem('token');

            const updateRequests = petitionIds.map(id => ({
                petitionId: id,
                status: newStatus
            }));

            const response = await fetch('http://localhost:3000/api/user/update-status', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateRequests)
            });

            if (!response.ok) {
                throw new Error('Failed to update petition status');
            }

            const result = await response.json();

            // Update local state
            setPetitions(prevPetitions =>
                prevPetitions.map(petition =>
                    petitionIds.includes(petition.id)
                        ? { ...petition, status: newStatus, selected: false }
                        : petition
                )
            );

            return result;
        } catch (err) {
            console.error('Error updating petition status:', err);
            setError('Failed to update status. Please try again.');
            throw err;
        }
    };

    const handleBulkAction = async (action) => {
        const selectedIds = petitions
            .filter(petition => petition.selected)
            .map(petition => petition.id);

        if (selectedIds.length === 0) return;

        let newStatus;
        switch (action) {
            case 'Resolved':
                newStatus = 'resolved';
                break;
            case 'Reject':
                newStatus = 'rejected';
                break;
            case 'In Progress':
                newStatus = 'in_progress';
                break;
            default:
                newStatus = 'pending';
        }

        try {
            await updatePetitionStatus(selectedIds, newStatus);
            alert(`Successfully updated ${selectedIds.length} petitions to ${newStatus}`);
        } catch (err) {
            alert(`Failed to update petitions: ${err.message}`);
        }
    };

    const handleSingleActionFromModal = async (action) => {
        if (!modalData) return;

        let newStatus;
        switch (action) {
            case 'Resolved':
                newStatus = 'resolved';
                break;
            case 'Reject':
                newStatus = 'rejected';
                break;
            case 'In Progress':
                newStatus = 'in_progress';
                break;
            default:
                newStatus = 'pending';
        }

        try {
            await updatePetitionStatus([modalData.id], newStatus);
            setModalData({ ...modalData, status: newStatus });
            alert(`Successfully updated petition ${modalData.id} to ${newStatus}`);
        } catch (err) {
            alert(`Failed to update petition: ${err.message}`);
        }
    };

    // Filter petitions based on active tab and filters
    const getFilteredPetitions = () => {
        return petitions.filter(petition => {
            // Filter by status based on activeTab
            if (petition.status !== activeTab) return false;

            // Apply additional filters
            return (
                (filter.priority === 'all' || petition.priority.toLowerCase() === filter.priority.toLowerCase()) &&
                (filter.searchTerm === '' ||
                    petition.subject.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
                    petition.id.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
                    petition.location.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
                    petition.petitioner.toLowerCase().includes(filter.searchTerm.toLowerCase()))
            );
        });
    };

    const filteredPetitions = getFilteredPetitions();
    const pendingCount = petitions.filter(p => p.status === 'pending').length;
    const inProgressCount = petitions.filter(p => p.status === 'in_progress').length;
    const approvedCount = petitions.filter(p => p.status === 'resolved').length;
    const rejectedCount = petitions.filter(p => p.status === 'rejected').length;

    const getPriorityClass = (priority) => {
        switch (priority.toLowerCase()) {
            case 'critical':
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
            case 'urgent':
                return 'status-urgent';
            case 'resolved':
                return 'status-resolved';
            case 'rejected':
                return 'status-rejected';
            case 'in_progress':
                return 'status-inprogress';
            case 'pending':
            default:
                return 'status-pending';
        }
    };

    // Get unique priorities from data
    const priorities = [...new Set(petitions.map(petition => petition.priority))];
    const hasSelectedPetitions = filteredPetitions.some(petition => petition.selected);

    if (loading) {
        return <div className="loading">Loading petitions...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const renderPendingInProgressUI = () => {
        return (
            <>
                <div className="filters-section">
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>Priority:</label>
                            <select
                                name="priority"
                                value={filter.priority}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Priorities</option>
                                {priorities.map((priority, index) => (
                                    <option key={index} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group search-group">
                            <label>Search:</label>
                            <input
                                type="text"
                                name="searchTerm"
                                value={filter.searchTerm}
                                onChange={handleFilterChange}
                                placeholder="Search by ID, subject, or location"
                            />
                        </div>
                    </div>

                    <div className="filter-summary">
                        <div>
                            <label className="select-all-label">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={filteredPetitions.length > 0 && filteredPetitions.every(p => p.selected)}
                                />
                                Select All
                            </label>
                        </div>
                    </div>
                </div>

                {filteredPetitions.length === 0 ? (
                    <div className="no-petitions">
                        <p>No {activeTab === 'pending' ? 'pending' : 'in-progress'} petitions found.</p>
                    </div>
                ) : (
                    <>
                        <div className="accordion-list">
                            {filteredPetitions.map(petition => (
                                <div key={petition.id} className="accordion-item">
                                    <div
                                        className={`accordion-header ${petition.expanded ? 'expanded' : ''}`}
                                        onClick={() => toggleAccordion(petition.id)}
                                    >
                                        <div className="accordion-checkbox" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={petition.selected}
                                                onChange={() => handleCheckboxChange(petition.id)}
                                            />
                                        </div>
                                        <div className="accordion-title">
                                            <span className="petition-id">{petition.id}</span>
                                            <h4 style={{ marginTop: "0px" }}>PetitionType : {petition.subject}</h4>
                                        </div>
                                        <div className="accordion-indicators">
                                            <span className={`status-badge ${getStatusClass(petition.status)}`}>
                                                {petition.status === 'in_progress' ? 'In Progress' :
                                                    petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
                                            </span>
                                            <span className={`priority-badge ${getPriorityClass(petition.priority)}`}>
                                                {petition.priority}
                                            </span>
                                            <span className="accordion-icon">
                                                {petition.expanded ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </div>

                                    {petition.expanded && (
                                        <div className="accordion-content">
                                            <div className="petition-details">
                                                <div className="details-row-layout">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Description:</span>
                                                        <span className="detail-value">{petition.description}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Location:</span>
                                                        <span className="detail-value">{petition.location}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Submitted:</span>
                                                        <span className="detail-value">{petition.submittedDate}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Petitioner:</span>
                                                        <span className="detail-value">{petition.petitioner}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="petition-actions">
                                                <button
                                                    className="view-details-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(petition);
                                                    }}
                                                >
                                                    View Full Details
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bulk-action-controls">
                            {activeTab === 'pending' && (
                                <button
                                    className="bulk-inprogress-btn"
                                    disabled={!hasSelectedPetitions}
                                    onClick={() => handleBulkAction('In Progress')}
                                >
                                    Mark In Progress
                                </button>
                            )}
                            <button
                                className="bulk-accept-btn"
                                disabled={!hasSelectedPetitions}
                                onClick={() => handleBulkAction('Resolved')}
                            >
                                Resolved
                            </button>
                            <button
                                className="bulk-reject-btn"
                                disabled={!hasSelectedPetitions}
                                onClick={() => handleBulkAction('Reject')}
                            >
                                Reject
                            </button>
                        </div>
                    </>
                )}
            </>
        );
    };

    const renderApprovedRejectedUI = () => {
        return (
            <>
                <div className="filters-section">
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>Priority:</label>
                            <select
                                name="priority"
                                value={filter.priority}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Priorities</option>
                                {priorities.map((priority, index) => (
                                    <option key={index} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group search-group">
                            <label>Search:</label>
                            <input
                                type="text"
                                name="searchTerm"
                                value={filter.searchTerm}
                                onChange={handleFilterChange}
                                placeholder="Search by ID, subject, or location"
                            />
                        </div>
                    </div>
                </div>

                {filteredPetitions.length === 0 ? (
                    <div className="no-petitions">
                        <p>No {activeTab === 'resolved' ? 'resolved' : 'rejected'} petitions found.</p>
                    </div>
                ) : (
                    <>
                        <div className="accordion-list">
                            {filteredPetitions.map(petition => (
                                <div key={petition.id} className="accordion-item">
                                    <div
                                        className={`accordion-header ${petition.expanded ? 'expanded' : ''}`}
                                        onClick={() => toggleAccordion(petition.id)}
                                    >
                                        <div className="accordion-title">
                                            <span className="petition-id">{petition.id}</span>
                                            <h4 style={{ marginTop: "0px" }}>PetitionType : {petition.subject}</h4>
                                        </div>
                                        <div className="accordion-indicators">
                                            <span className={`status-badge ${getStatusClass(petition.status)}`}>
                                                {petition.status === 'resolved' ? 'Resolved' : 'Rejected'}
                                            </span>
                                            <span className={`priority-badge ${getPriorityClass(petition.priority)}`}>
                                                {petition.priority}
                                            </span>
                                            <span className="accordion-icon">
                                                {petition.expanded ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </div>

                                    {petition.expanded && (
                                        <div className="accordion-content">
                                            <div className="petition-details">
                                               <div className="details-row-layout">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Description:</span>
                                                        <span className="detail-value">{petition.description}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Location:</span>
                                                        <span className="detail-value">{petition.location}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Submitted:</span>
                                                        <span className="detail-value">{petition.submittedDate}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Petitioner:</span>
                                                        <span className="detail-value">{petition.petitioner}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="petition-actions">
                                                <button
                                                    className="view-details-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(petition);
                                                    }}
                                                >
                                                    View Full Details
                                                </button>

                                                {/* Show Approve button only for rejected petitions */}
                                                {activeTab === 'rejected' && (
                                                    <button
                                                        className="approve-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSingleActionFromModal('Resolved');
                                                        }}
                                                    >
                                                        Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Bulk action only for rejected tab */}
                        {activeTab === 'rejected' && (
                            <div className="bulk-action-controls">
                                <div className="bulk-action-message">
                                    <p>You can approve rejected petitions individually by opening them.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </>
        );
    };

    return (
        <div className="pending-petitions-container">
            <h2>Petitions Management</h2>

            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab tab-pending ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending <span className="tab-count">{pendingCount}</span>
                    </button>
                    <button
                        className={`tab tab-inprogress ${activeTab === 'in_progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('in_progress')}
                    >
                        In Progress <span className="tab-count">{inProgressCount}</span>
                    </button>
                    <button
                        className={`tab tab-resolved ${activeTab === 'resolved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resolved')}
                    >
                        Resolved <span className="tab-count">{approvedCount}</span>
                    </button>
                    <button
                        className={`tab tab-rejected ${activeTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Rejected <span className="tab-count">{rejectedCount}</span>
                    </button>
                </div>
            </div>

            {/* Render different UIs based on active tab */}
            {(activeTab === 'pending' || activeTab === 'in_progress') ?
                renderPendingInProgressUI() :
                renderApprovedRejectedUI()
            }

            {/* Modal for viewing and updating petitions */}
            {showModal && modalData && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>PetitionType :{modalData.subject}</h2>
                            <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-section">
                                <div className="modal-id-priority">
                                    <span className="modal-id">{modalData.id}</span>
                                    <span className={`status-badge ${getStatusClass(modalData.status)}`}>
                                        {modalData.status === 'in_progress' ? 'In Progress' :
                                            modalData.status === 'resolved' ? 'Resolved' :
                                                modalData.status.charAt(0).toUpperCase() + modalData.status.slice(1)}
                                    </span>
                                    <span className={`priority-badge ${getPriorityClass(modalData.priority)}`}>
                                        {modalData.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3>Description</h3>
                                <p>{modalData.description}</p>
                            </div>

                            {modalData.attachment && (
                                <div className="modal-section">
                                    <h3>Attachment</h3>
                                    {showAttachment ? (
                                        <div className="attachment-viewer">
                                            <img src={modalData.attachment} alt="Petition attachment" />
                                            <button className="attachment-close-btn" onClick={toggleAttachment}>
                                                Close Image
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="view-attachment-btn" onClick={toggleAttachment}>
                                            View Attachment
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="modal-section">
                                <h3>Details</h3>
                                <div className="modal-details-row-layout">
                                    <div className="modal-detail-item">
                                        <span className="modal-detail-label">Location:</span>
                                        <span className="modal-detail-value">{modalData.location}</span>
                                    </div>
                                    <div className="modal-detail-item">
                                        <span className="modal-detail-label">Submitted Date:</span>
                                        <span className="modal-detail-value">{modalData.submittedDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3>Contact Information</h3>
                                <div className="modal-details-row-layout">
                                    <div className="modal-detail-item">
                                        <span className="modal-detail-label">Petitioner:</span>
                                        <span className="modal-detail-value">{modalData.petitioner}</span>
                                    </div>
                                    <div className="modal-detail-item">
                                        <span className="modal-detail-label">Contact:</span>
                                        <span className="modal-detail-value">{modalData.contact}</span>
                                    </div>
                                </div>
                            </div>

                            {modalData.raw && (
                                <div className="modal-section">
                                    <h3>Additional Information</h3>
                                    <div className="modal-details-row-layout">
                                        <div className="modal-detail-item">
                                            <span className="modal-detail-label">Department:</span>
                                            <span className="modal-detail-value">{modalData.raw.department}</span>
                                        </div>
                                        <div className="modal-detail-item">
                                            <span className="modal-detail-label">Community:</span>
                                            <span className="modal-detail-value">{modalData.raw.community}</span>
                                        </div>
                                    </div>
                                    <div className="modal-details-row-layout">
                                        <div className="modal-detail-item">
                                            <span className="modal-detail-label">Address:</span>
                                            <span className="modal-detail-value">
                                                {`${modalData.raw.doorNumber}, ${modalData.raw.street}, ${modalData.raw.area}, ${modalData.raw.district}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <div className="modal-actions">
                                {/* Show different action buttons based on status */}
                                {modalData.status === 'pending' && (
                                    <>
                                        <button
                                            className="bulk-inprogress-btn"
                                            onClick={() => handleSingleActionFromModal('In Progress')}
                                        >
                                            Mark In Progress
                                        </button>
                                        <button
                                            className="bulk-accept-btn"
                                            onClick={() => handleSingleActionFromModal('Resolved')}
                                        >
                                            Resolved
                                        </button>
                                        <button
                                            className="bulk-reject-btn"
                                            onClick={() => handleSingleActionFromModal('Reject')}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {modalData.status === 'in_progress' && (
                                    <>
                                        <button
                                            className="bulk-accept-btn"
                                            onClick={() => handleSingleActionFromModal('Resolved')}
                                        >
                                            Resolved
                                        </button>
                                        <button
                                            className="bulk-reject-btn"
                                            onClick={() => handleSingleActionFromModal('Reject')}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {modalData.status === 'rejected' && (
                                    <button
                                        className="bulk-accept-btn"
                                        onClick={() => handleSingleActionFromModal('Resolved')}
                                    >
                                        Resolved
                                    </button>
                                )}

                                {/* No action buttons for resolved/approved status */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingPetitions;