import React, { useState, useEffect } from 'react';
import './ManageUsers.css';
import { districtData } from '../petitioner/districtData'; // Import district data

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
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
        verificationId: ''
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
        taluk: '',
        password: '',
        confirmPassword: ''
    });

    // Fetch users data from the API
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/user/getAllUsers');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Transform the API data to match our component's expected format
            const transformedUsers = data.users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.address,
                district: user.district,
                taluk: user.city, // API uses 'city' instead of 'taluk'
                registrationDate: new Date(user.createdAt).toISOString().split('T')[0],
                verificationId: user.verificationId
            }));

            setUsers(transformedUsers);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Failed to load petitioners. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

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
            address: user.location,
            district: user.district,
            city: user.taluk,
            verificationId: user.verificationId
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
            const response = await fetch('http://localhost:3000/api/user/editUsers', {
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
                    verificationId: editFormData.verificationId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user');
            }

            const data = await response.json();

            // Update local state with the updated user data
            const updatedUsers = users.map(user => {
                if (user.id === editing) {
                    return {
                        ...user,
                        name: data.user.name,
                        email: data.user.email,
                        phone: data.user.phone,
                        location: data.user.address, // Map API's 'address' to component's 'location'
                        district: data.user.district,
                        taluk: data.user.city, // Map API's 'city' to component's 'taluk'
                        verificationId: data.user.verificationId
                    };
                }
                return user;
            });

            setUsers(updatedUsers);
            setEditing(null);
            alert("User updated successfully!");
        } catch (err) {
            console.error("Failed to update user:", err);
            alert("Failed to update user: " + err.message);
        }
    };

    // Handle adding a new user
    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setNewUserData({
            ...newUserData,
            [name]: value
        });
    };

    const handleAddFormSubmit = async (e) => {
        e.preventDefault();

        // Validate password matching
        if (newUserData.password !== newUserData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newUserData.name,
                    email: newUserData.email,
                    phone: newUserData.phone,
                    address: newUserData.address,
                    district: newUserData.district,
                    city: newUserData.taluk,
                    dob: newUserData.dob,
                    verificationId: newUserData.verificationId,
                    role: ["user"],
                    password: newUserData.password,
                    confirmPassword: newUserData.confirmPassword
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add user');
            }

            // Refresh the users list after adding a new user
            await fetchUsers();

            setShowAddForm(false);
            resetNewUserForm();
            alert("New petitioner added successfully!");
        } catch (err) {
            console.error("Failed to add user:", err);
            alert("Failed to add petitioner: " + err.message);
        }
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
            taluk: '',
            password: '',
            confirmPassword: ''
        });
        setAvailableTaluks([]);
    };

    // Handle deleting a user
    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch('http://localhost:3000/api/user/deleteUsers', {
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
                    throw new Error(errorData.error || 'Failed to delete user');
                }

                // Update local state
                setUsers(users.filter(user => user.id !== id));
                alert("User deleted successfully!");
            } catch (err) {
                console.error("Failed to delete user:", err);
                alert("Failed to delete user: " + err.message);
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading petitioners data...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

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
                                    maxLength="36"
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
                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
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
                                    pattern="\d{10}"
                                    maxLength="10"
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
                                    max={new Date().toISOString().split('T')[0]}
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
                                <label>Verification ID:</label>
                                <input
                                    type="text"
                                    name="verificationId"
                                    value={newUserData.verificationId}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newUserData.password}
                                    onChange={handleAddFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={newUserData.confirmPassword}
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
                                            name="address"
                                            value={editFormData.address}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.location
                                    )}
                                </td>
                                <td>
                                    {editing === user.id ? (
                                        <input
                                            type="text"
                                            name="district"
                                            value={editFormData.district}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.district || '-'
                                    )}
                                </td>
                                <td>
                                    {editing === user.id ? (
                                        <input
                                            type="text"
                                            name="city"
                                            value={editFormData.city}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.taluk || '-'
                                    )}
                                </td>
                                <td>{user.registrationDate}</td>
                                <td>
                                    {editing === user.id ? (
                                        <input
                                            type="text"
                                            name="verificationId"
                                            value={editFormData.verificationId}
                                            onChange={handleEditFormChange}
                                            required
                                        />
                                    ) : (
                                        user.verificationId
                                    )}
                                </td>
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