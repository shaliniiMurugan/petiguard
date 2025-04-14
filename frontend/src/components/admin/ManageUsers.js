import React, { useState, useEffect } from 'react';
import './ManageUsers.css';
import { districtData } from '../petitioner/districtData'; // Import district data

const ManageUsers = () => {
    // Sample user data - filtered to only include petitioners
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '555-123-4567',
            location: 'New York',
            district: 'Manhattan',
            taluk: 'Downtown',
            registrationDate: '2023-01-15',
            verificationId: 'ABCDE1234F'
        },
        {
            id: 3,
            name: 'Michael Brown',
            email: 'michael.b@example.com',
            phone: '555-456-7890',
            location: 'Los Angeles',
            district: 'LA County',
            taluk: 'Downtown',
            registrationDate: '2023-01-22',
            verificationId: 'XYZER4321G'
        },
        {
            id: 4,
            name: 'Emily Wilson',
            email: 'emily.w@example.com',
            phone: '555-789-0123',
            location: 'Houston',
            district: 'Harris County',
            taluk: 'Downtown',
            registrationDate: '2023-01-25',
            verificationId: 'LMNOP5678H'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [editing, setEditing] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [availableTaluks, setAvailableTaluks] = useState([]);
    
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        verificationId: '',
        address: '',
        district: '',
        taluk: ''
    });

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.location.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Handle district change and update available taluks
    const handleDistrictChange = (e) => {
        const { name, value } = e.target;
        
        // Update form data with new district
        setNewUserData({
            ...newUserData,
            [name]: value,
            taluk: '' // Reset taluk when district changes
        });

        // Update available taluks based on selected district
        if (value) {
            const taluks = districtData?.taluksByDistrict[value] || [];
            setAvailableTaluks(taluks);
        } else {
            setAvailableTaluks([]);
        }
    };

    // Handle editing a user
    const handleEditClick = (user) => {
        setEditing(user.id);
        setEditFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleEditFormSubmit = (e) => {
        e.preventDefault();

        const updatedUsers = users.map(user => {
            if (user.id === editing) {
                return {
                    ...user,
                    name: editFormData.name,
                    email: editFormData.email,
                    phone: editFormData.phone,
                    location: editFormData.location
                };
            }
            return user;
        });

        setUsers(updatedUsers);
        setEditing(null);
    };

    // Handle adding a new user
    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setNewUserData({
            ...newUserData,
            [name]: value
        });
    };

    const handleAddFormSubmit = (e) => {
        e.preventDefault();

        const newUser = {
            id: users.length + 1,
            name: newUserData.name,
            email: newUserData.email,
            phone: newUserData.phone,
            location: newUserData.address, 
            district: newUserData.district,
            taluk: newUserData.taluk,
            registrationDate: new Date().toISOString().split('T')[0],
            verificationId: newUserData.verificationId
        };

        setUsers([...users, newUser]);
        setShowAddForm(false);
        resetNewUserForm();
    };

    const resetNewUserForm = () => {
        setNewUserData({
            name: '',
            email: '',
            phone: '',
            dob: '',
            verificationId: '',
            address: '',
            district: '',
            taluk: ''
        });
        setAvailableTaluks([]);
    };

    // Handle deleting a user
    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    return (
        <div className="manage-users-container">
            <div className="page-header">
                <h2>Manage Petitioners</h2>
                <button className="add-user-btn" onClick={() => setShowAddForm(true)}>
                    Add New Petitioner
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
                        <h3>Add New Petitioner</h3>
                        <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
                    </div>

                    <form onSubmit={handleAddFormSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newUserData.name}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newUserData.email}
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
                                    value={newUserData.phone}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Date of Birth:</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={newUserData.dob}
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
                                    value={newUserData.address}
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
                                    value={newUserData.district}
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
                                    name="taluk"
                                    value={newUserData.taluk}
                                    onChange={handleAddFormChange}
                                    required
                                    disabled={!newUserData.district}
                                >
                                    <option value="">--Select--</option>
                                    {availableTaluks.map(taluk => (
                                        <option key={taluk} value={taluk}>{taluk}</option>
                                    ))}
                                </select>
                                {!newUserData.district && 
                                    <p className="hint-text">Please select a district first</p>
                                }
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Verification ID (Aadhar/PAN):</label>
                                <input
                                    type="text"
                                    name="verificationId"
                                    value={newUserData.verificationId}
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
                                Add Petitioner
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
                            <th>Verification ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    {editing === user.id ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.name
                                    )}
                                </td>
                                <td>
                                    {editing === user.id ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={editFormData.email}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td>
                                    {editing === user.id ? (
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editFormData.phone}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.phone
                                    )}
                                </td>
                                <td>
                                    {editing === user.id ? (
                                        <input
                                            type="text"
                                            name="location"
                                            value={editFormData.location}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.location
                                    )}
                                </td>
                                <td>{user.district || '-'}</td>
                                <td>{user.taluk || '-'}</td>
                                <td>{user.registrationDate}</td>
                                <td>{user.verificationId}</td>
                                <td className="actions-cell">
                                    {editing === user.id ? (
                                        <>
                                            <button className="save-btn" onClick={handleEditFormSubmit}>Save</button>
                                            <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="edit-btn" onClick={() => handleEditClick(user)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="no-results">
                        <p>No petitioners found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;