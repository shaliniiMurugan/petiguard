import React, { useState, useEffect } from 'react';
import './ManageUsers.css'; // Reusing the same CSS
import { districtData } from '../petitioner/districtData'; // Import district data

const ManageOfficials = () => {
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editing, setEditing] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        city: '',
        idProofNo: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [availableTaluks, setAvailableTaluks] = useState([]);

    const [newOfficialData, setNewOfficialData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        idProof: '',
        idProofNo: '',
        address: '',
        district: '',
        city: '',
        department: '',
        password: '',
        confirmPassword: ''
    });

    // Fetch officials data from the API
    useEffect(() => {
        fetchOfficials();
    }, []);

    const fetchOfficials = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/user/getAllOfficial');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Transform the API data to match our component's expected format
            const transformedOfficials = data.officials.map(official => ({
                id: official.id,
                name: official.name,
                email: official.email,
                phone: official.phone,
                location: official.address,
                district: official.district,
                taluk: official.city, // API uses 'city' instead of 'taluk'
                registrationDate: new Date(official.createdAt).toISOString().split('T')[0],
                idProofNo: official.idProofNo
            }));

            setOfficials(transformedOfficials);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch officials:", err);
            setError("Failed to load officials. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Filter officials based on search term
    const filteredOfficials = officials.filter(official => {
        return official.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            official.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            official.location.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Handle district change and update available taluks
    const handleDistrictChange = (e) => {
        const { name, value } = e.target;

        // Update form data with new district
        setNewOfficialData({
            ...newOfficialData,
            [name]: value,
            city: '' // Reset taluk/city when district changes
        });

        // Update available taluks based on selected district
        if (value) {
            const taluks = districtData?.taluksByDistrict[value] || [];
            setAvailableTaluks(taluks);
        } else {
            setAvailableTaluks([]);
        }
    };

    // Handle editing an official
    const handleEditClick = (official) => {
        setEditing(official.id);
        setEditFormData({
            name: official.name,
            email: official.email,
            phone: official.phone,
            address: official.location,
            district: official.district,
            city: official.taluk,
            idProofNo: official.idProofNo
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/user/editOfficial', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editing,
                    name: editFormData.name,
                    email: editFormData.email,
                    phone: editFormData.phone,
                    address: editFormData.address,
                    district: editFormData.district,
                    city: editFormData.city,
                    idProofNo: editFormData.idProofNo
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update official');
            }

            const data = await response.json();

            // Log the response to see its structure
            console.log("API Response:", data);

            // Update local state with the updated official data
            // Check if the response has 'official' or 'user' property
            const updatedData = data.official || data.user || data;

            const updatedOfficials = officials.map(official => {
                if (official.id === editing) {
                    return {
                        ...official,
                        name: updatedData.name || editFormData.name,
                        email: updatedData.email || editFormData.email,
                        phone: updatedData.phone || editFormData.phone,
                        location: updatedData.address || editFormData.address,
                        district: updatedData.district || editFormData.district,
                        taluk: updatedData.city || editFormData.city,
                        idProofNo: updatedData.idProofNo || editFormData.idProofNo
                    };
                }
                return official;
            });

            setOfficials(updatedOfficials);
            setEditing(null);
            alert("Official updated successfully!");
        } catch (err) {
            console.error("Failed to update official:", err);
            alert("Failed to update official: " + err.message);
        }
    };

    // Handle adding a new official
    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setNewOfficialData({
            ...newOfficialData,
            [name]: value
        });
    };

    const handleAddFormSubmit = async (e) => {
        e.preventDefault();

        // Validate password matching
        if (newOfficialData.password !== newOfficialData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/user/official-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newOfficialData.name,
                    email: newOfficialData.email,
                    phone: newOfficialData.phone,
                    address: newOfficialData.address,
                    district: newOfficialData.district,
                    city: newOfficialData.city,
                    dob: newOfficialData.dob,
                    idProof: newOfficialData.idProof,
                    idProofNo: newOfficialData.idProofNo,
                    department: newOfficialData.department,
                    role: ["official"],
                    password: newOfficialData.password,
                    confirmPassword: newOfficialData.confirmPassword
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add official');
            }

            // Refresh the officials list after adding a new official
            await fetchOfficials();

            setShowAddForm(false);
            resetNewOfficialForm();
            alert("New official added successfully!");
        } catch (err) {
            console.error("Failed to add official:", err);
            alert("Failed to add official: " + err.message);
        }
    };

    const resetNewOfficialForm = () => {
        setNewOfficialData({
            name: '',
            email: '',
            phone: '',
            dob: '',
            idProof: '',
            idProofNo: '',
            address: '',
            district: '',
            city: '',
            department: '',
            password: '',
            confirmPassword: ''
        });
        setAvailableTaluks([]);
    };

    // Handle deleting an official
    const handleDeleteOfficial = async (id) => {
        if (window.confirm('Are you sure you want to delete this official?')) {
            try {
                const response = await fetch('http://localhost:3000/api/user/deleteOfficial', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: id
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete official');
                }

                // Update local state
                setOfficials(officials.filter(official => official.id !== id));
                alert("Official deleted successfully!");
            } catch (err) {
                console.error("Failed to delete official:", err);
                alert("Failed to delete official: " + err.message);
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading officials data...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="manage-officials-container">
            <div className="page-header">
                <h2>Manage Officials</h2>
                <button className="add-user-btn" onClick={() => setShowAddForm(true)}>
                    Add New Official
                </button>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, email, or location"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {showAddForm && (
                <div className="add-user-form-container">
                    <div className="form-header">
                        <h3>Add New Official</h3>
                        <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
                    </div>

                    <form onSubmit={handleAddFormSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    maxLength="36"
                                    value={newOfficialData.name}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    value={newOfficialData.email}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone:</label>
                                <input
                                    type="text"
                                    name="phone"
                                    pattern="\d{10}"
                                    maxLength="10"
                                    value={newOfficialData.phone}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Date of Birth:</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={newOfficialData.dob}
                                    max={new Date().toISOString().split('T')[0]} // Only allows today or earlier
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Address:</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={newOfficialData.address}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>District:</label>
                                <select
                                    name="district"
                                    value={newOfficialData.district}
                                    onChange={handleDistrictChange}
                                    required
                                >
                                    <option value="">--Select--</option>
                                    {districtData?.districts?.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    )) || []}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Taluk:</label>
                                <select
                                    name="city"
                                    value={newOfficialData.city}
                                    onChange={handleAddFormChange}
                                    required
                                    disabled={!newOfficialData.district}
                                >
                                    <option value="">--Select--</option>
                                    {availableTaluks.map(taluk => (
                                        <option key={taluk} value={taluk}>{taluk}</option>
                                    ))}
                                </select>
                                {!newOfficialData.district &&
                                    <p className="hint-text">Please select a district first</p>
                                }
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>ID Proof Type:</label>
                                <select
                                    name="idProof"
                                    value={newOfficialData.idProof}
                                    onChange={handleAddFormChange}
                                    required
                                >
                                    <option value="">--Select--</option>
                                    <option value="Aadhar">Aadhar</option>
                                    <option value="PAN">PAN</option>
                                    <option value="Voter ID">Voter ID</option>
                                    <option value="Passport">Passport</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>ID Proof Number:</label>
                                <input
                                    type="text"
                                    name="idProofNo"
                                    value={newOfficialData.idProofNo}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Department:</label>
                                <select
                                    name="department"
                                    value={newOfficialData.department}
                                    onChange={handleAddFormChange}
                                    required
                                >
                                    <option value="">--Select--</option>
                                    <option value="Transport Department">Transport Department</option>
                                    <option value="Healthcare Department">Healthcare Department</option>
                                    <option value="Education Department">Education Department</option>
                                    <option value="Municipality">Municipality</option>
                                    <option value="Water Department">Water Department</option>
                                    <option value="Electricity Department">Electricity Department</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newOfficialData.password}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={newOfficialData.confirmPassword}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="save-btn">
                                Add Official
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>District</th>
                            <th>Taluk</th>
                            <th>Registration Date</th>
                            <th>ID Proof No</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOfficials.map(official => (
                            <tr key={official.id}>
                                <td>
                                    {editing === official.id ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        official.name
                                    )}
                                </td>
                                <td>
                                    {editing === official.id ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={editFormData.email}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        official.email
                                    )}
                                </td>
                                <td>
                                    {editing === official.id ? (
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editFormData.phone}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        official.phone
                                    )}
                                </td>
                                <td>
                                    {editing === official.id ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={editFormData.address}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        official.location
                                    )}
                                </td>
                                <td>
                                    {editing === official.id ? (
                                        <input
                                            type="text"
                                            name="district"
                                            value={editFormData.district}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        official.district || '-'
                                    )}
                                </td>
                                <td>
                                    {editing === official.id ? (
                                        <input
                                            type="text"
                                            name="city"
                                            value={editFormData.city}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        official.taluk || '-'
                                    )}
                                </td>
                                <td>{official.registrationDate}</td>
                                <td>
                                    {editing === official.id ? (
                                        <input
                                            type="text"
                                            name="idProofNo"
                                            value={editFormData.idProofNo}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        official.idProofNo
                                    )}
                                </td>
                                <td className="actions-cell">
                                    {editing === official.id ? (
                                        <>
                                            <button className="save-btn" onClick={handleEditFormSubmit}>Save</button>
                                            <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="edit-btn" onClick={() => handleEditClick(official)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteOfficial(official.id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOfficials.length === 0 && (
                    <div className="no-results">
                        <p>No officials found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOfficials;