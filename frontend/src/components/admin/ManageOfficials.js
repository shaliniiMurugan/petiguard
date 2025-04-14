import React, { useState, useEffect } from 'react';
import './ManageOfficials.css';
import { districtData } from '../petitioner/districtData'; // Import district data

const ManageOfficials = () => {
    // Sample officials data
    const [officials, setOfficials] = useState([
        {
            id: 1,
            name: 'Robert Johnson',
            email: 'robert.j@govdept.org',
            phone: '555-123-7890',
            department: 'Transport Department',
            role: 'Department Head',
            joinDate: '2022-01-10',
            status: 'active',
            address: '123 Main St, Central Area',
            district: 'Central District',
            taluk: 'Central Taluk',
            dob: '1980-05-15',
            governmentIdType: 'aadhar',
            governmentId: '1234-5678-9012'
        },
        {
            id: 2,
            name: 'Maria Garcia',
            email: 'maria.g@govdept.org',
            phone: '555-456-7890',
            department: 'Municipality Department',
            role: 'Senior Official',
            joinDate: '2022-02-15',
            status: 'active',
            address: '456 Oak Ave, West Area',
            district: 'Western District',
            taluk: 'West Taluk',
            dob: '1985-07-22',
            governmentIdType: 'voter',
            governmentId: 'VOT12345678'
        },
        {
            id: 3,
            name: 'James Williams',
            email: 'james.w@govdept.org',
            phone: '555-789-1234',
            department: 'Public Works Department',
            role: 'Junior Official',
            joinDate: '2022-03-20',
            status: 'inactive',
            address: '789 Pine Rd, South Area',
            district: 'Southern District',
            taluk: 'South Taluk',
            dob: '1990-11-18',
            governmentIdType: 'pan',
            governmentId: 'ABCDE1234F'
        },
        {
            id: 4,
            name: 'Sophia Chen',
            email: 'sophia.c@govdept.org',
            phone: '555-234-5678',
            department: 'Water Department',
            role: 'Department Head',
            joinDate: '2022-02-05',
            status: 'active',
            address: '101 Elm St, East Area',
            district: 'Eastern District',
            taluk: 'East Taluk',
            dob: '1982-09-27',
            governmentIdType: 'license',
            governmentId: 'DL123456789'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newOfficialData, setNewOfficialData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        taluk: '',
        department: '',
        dob: '',
        governmentIdType: 'aadhar',
        governmentId: '',
        role: '',
        status: 'active'
    });
    const [availableTaluks, setAvailableTaluks] = useState([]);

    // Get unique departments for filter
    const departments = [...new Set(officials.map(official => official.department))];

    // Filter officials based on search term and department
    const filteredOfficials = officials.filter(official => {
        const matchesSearch = official.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            official.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            official.role.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = filterDepartment === 'all' || official.department === filterDepartment;

        return matchesSearch && matchesDepartment;
    });

    // Handle adding a new official
    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setNewOfficialData({
            ...newOfficialData,
            [name]: value
        });
    };

    // Handle district change and update available taluks
    const handleDistrictChange = (e) => {
        const { name, value } = e.target;
        
        // Update form data with new district
        setNewOfficialData({
            ...newOfficialData,
            [name]: value,
            taluk: '' // Reset taluk when district changes
        });

        // Update available taluks based on selected district
        if (value) {
            const taluks = districtData.taluksByDistrict[value] || [];
            setAvailableTaluks(taluks);
        } else {
            setAvailableTaluks([]);
        }
    };

    const handleAddFormSubmit = (e) => {
        e.preventDefault();

        const newOfficial = {
            id: officials.length + 1,
            ...newOfficialData,
            joinDate: new Date().toISOString().split('T')[0]
        };

        setOfficials([...officials, newOfficial]);
        setShowAddForm(false);
        setNewOfficialData({
            name: '',
            email: '',
            phone: '',
            address: '',
            district: '',
            taluk: '',
            department: '',
            dob: '',
            governmentIdType: 'aadhar',
            governmentId: '',
            role: '',
            status: 'active'
        });
    };

    // Handle delete official
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this official?')) {
            setOfficials(officials.filter(official => official.id !== id));
        }
    };

    // Handle edit official function
    const handleEdit = (id) => {
        // Here you would typically implement the edit functionality
        // For example, you might want to set up a form with the official's current data
        console.log(`Editing official with ID: ${id}`);
        
        // For demonstration purposes, we'll just log a message
        alert(`Edit functionality would open for official ID: ${id}`);
    };

    return (
        <div className="manage-officials-container">
            <div className="page-header">
                <h2>Manage Officials</h2>
                <button className="add-official-btn" onClick={() => setShowAddForm(true)}>
                    Add New Official
                </button>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, email, or role"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="department-filter">
                    <label>Department:</label>
                    <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                        <option value="all">All Departments</option>
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {showAddForm && (
                <div className="add-official-form-container">
                    <div className="form-header">
                        <h3>Add New Official</h3>
                        <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
                    </div>

                    <form onSubmit={handleAddFormSubmit} className="add-official-form">
                        <div className="form-section">
                            <h4>Official Information</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name:</label>
                                    <input
                                        type="text"
                                        name="name"
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
                                        {districtData.districts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Taluk:</label>
                                    <select
                                        name="taluk"
                                        value={newOfficialData.taluk}
                                        onChange={handleAddFormChange}
                                        required
                                        disabled={!newOfficialData.district}
                                    >
                                        <option value="">--Select--</option>
                                        {availableTaluks.map(taluk => (
                                            <option key={taluk} value={taluk}>{taluk}</option>
                                        ))}
                                    </select>
                                    {!newOfficialData.district && (
                                        <p className="hint-text">Please select a district first</p>
                                    )}
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
                                </div>

                                <div className="form-group">
                                    <label>Role:</label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={newOfficialData.role}
                                        onChange={handleAddFormChange}
                                        required
                                        placeholder="e.g. Department Head, Senior Official"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Government ID Type:</label>
                                    <select
                                        name="governmentIdType"
                                        value={newOfficialData.governmentIdType}
                                        onChange={handleAddFormChange}
                                    >
                                        <option value="aadhar">Aadhar Card</option>
                                        <option value="voter">Voter ID</option>
                                        <option value="license">Driving License</option>
                                        <option value="pan">PAN Card</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Government ID:</label>
                                    <input
                                        type="text"
                                        name="governmentId"
                                        value={newOfficialData.governmentId}
                                        onChange={handleAddFormChange}
                                        required
                                        placeholder="Enter government ID number"
                                    />
                                </div>
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

            <div className="officials-table-container">
                <table className="officials-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOfficials.map(official => (
                            <tr key={official.id} className={official.status === 'inactive' ? 'inactive-row' : ''}>
                                <td>{official.name}</td>
                                <td>{official.email}</td>
                                <td>{official.phone}</td>
                                <td>{official.department}</td>
                                <td>{official.role}</td>
                                <td>{official.joinDate}</td>
                                <td className="actions-cell">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(official.id)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDelete(official.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOfficials.length === 0 && (
                    <div className="no-results">
                        <p>No officials found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOfficials;