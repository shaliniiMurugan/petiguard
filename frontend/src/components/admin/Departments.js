// // src/components/admin/Departments.js
// import React, { useState } from 'react';
// import './Departments.css';

// const Departments = () => {
//     // Sample departments data with categories
//     const [departments, setDepartments] = useState([
//         {
//             id: 1,
//             name: 'Municipality / Corporation Department',
//             head: 'Robert Johnson',
//             totalOfficials: 15,
//             activePetitions: 52,
//             avgResolutionTime: '8 days',
//             status: 'active',
//             description: 'Handles citizen grievances related to water supply, sanitation, roads, waste management, etc.'
//         },
//         {
//             id: 2,
//             name: 'Transport Department',
//             head: 'Maria Garcia',
//             totalOfficials: 12,
//             activePetitions: 45,
//             avgResolutionTime: '7 days',
//             status: 'active',
//             description: 'Manages petitions related to traffic violations, public transport complaints, road safety, and vehicle registration issues.'
//         },
//         {
//             id: 3,
//             name: 'Revenue Department',
//             head: 'Thomas Anderson',
//             totalOfficials: 10,
//             activePetitions: 38,
//             avgResolutionTime: '9 days',
//             status: 'active',
//             description: 'Handles petitions involving land records, tax disputes, or property-related grievances.'
//         },
//         {
//             id: 4,
//             name: 'Police Department',
//             head: 'Sophia Chen',
//             totalOfficials: 18,
//             activePetitions: 63,
//             avgResolutionTime: '5 days',
//             status: 'active',
//             description: 'Manages public complaints, FIR status, or law enforcement-related petitions.'
//         },
//         {
//             id: 5,
//             name: 'Judiciary / Legal Affairs',
//             head: 'James Wilson',
//             totalOfficials: 8,
//             activePetitions: 27,
//             avgResolutionTime: '12 days',
//             status: 'active',
//             description: 'Handles case tracking in courts, legal grievances, or RTI requests.'
//         },
//         {
//             id: 6,
//             name: 'Health Department',
//             head: 'Emily Davis',
//             totalOfficials: 14,
//             activePetitions: 41,
//             avgResolutionTime: '6 days',
//             status: 'active',
//             description: 'Manages complaints related to hospitals, medical negligence, or public health concerns.'
//         },
//         {
//             id: 7,
//             name: 'Electricity Board',
//             head: 'Michael Brown',
//             totalOfficials: 9,
//             activePetitions: 36,
//             avgResolutionTime: '4 days',
//             status: 'active',
//             description: 'Handles complaints related to power supply, billing issues, or infrastructure problems.'
//         },
//         {
//             id: 8,
//             name: 'Water Resources Department',
//             head: 'Rebecca Martinez',
//             totalOfficials: 7,
//             activePetitions: 29,
//             avgResolutionTime: '5 days',
//             status: 'active',
//             description: 'Manages petitions related to water scarcity, irrigation issues, or supply concerns.'
//         },
//         {
//             id: 9,
//             name: 'Education Department',
//             head: 'David Lee',
//             totalOfficials: 11,
//             activePetitions: 34,
//             avgResolutionTime: '7 days',
//             status: 'active',
//             description: 'Handles grievances regarding schools, colleges, scholarships, or educational institutions.'
//         },
//         {
//             id: 10,
//             name: 'Social Welfare Department',
//             head: 'Not Assigned',
//             totalOfficials: 6,
//             activePetitions: 25,
//             avgResolutionTime: '8 days',
//             status: 'inactive',
//             description: 'Manages petitions related to pension schemes, welfare programs, or benefits for marginalized communities.'
//         }
//     ]);

//     const [searchTerm, setSearchTerm] = useState('');
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [showEditForm, setShowEditForm] = useState(false);
//     const [currentDepartment, setCurrentDepartment] = useState(null);
//     const [departmentForm, setDepartmentForm] = useState({
//         name: '',
//         head: '',
//         description: '',
//         status: 'active'
//     });

//     // Filter departments based on search term
//     const filteredDepartments = departments.filter(dept =>
//         dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         dept.description.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Handle form change
//     const handleFormChange = (e) => {
//         const { name, value } = e.target;
//         setDepartmentForm({
//             ...departmentForm,
//             [name]: value
//         });
//     };

//     // Handle add new department
//     const handleAddDepartment = (e) => {
//         e.preventDefault();

//         const newDepartment = {
//             id: departments.length + 1,
//             name: departmentForm.name,
//             head: departmentForm.head || 'Not Assigned',
//             description: departmentForm.description,
//             totalOfficials: 0,
//             activePetitions: 0,
//             avgResolutionTime: 'N/A',
//             status: departmentForm.status
//         };

//         setDepartments([...departments, newDepartment]);
//         setShowAddForm(false);
//         setDepartmentForm({
//             name: '',
//             head: '',
//             description: '',
//             status: 'active'
//         });
//     };

//     // Handle edit department
//     const handleEditClick = (department) => {
//         setCurrentDepartment(department);
//         setDepartmentForm({
//             name: department.name,
//             head: department.head,
//             description: department.description,
//             status: department.status
//         });
//         setShowEditForm(true);
//     };

//     const handleUpdateDepartment = (e) => {
//         e.preventDefault();

//         const updatedDepartments = departments.map(dept => {
//             if (dept.id === currentDepartment.id) {
//                 return {
//                     ...dept,
//                     name: departmentForm.name,
//                     head: departmentForm.head,
//                     description: departmentForm.description,
//                     status: departmentForm.status
//                 };
//             }
//             return dept;
//         });

//         setDepartments(updatedDepartments);
//         setShowEditForm(false);
//         setCurrentDepartment(null);
//         setDepartmentForm({
//             name: '',
//             head: '',
//             description: '',
//             status: 'active'
//         });
//     };

//     // Toggle department status
//     const handleStatusToggle = (id) => {
//         setDepartments(departments.map(dept => {
//             if (dept.id === id) {
//                 return {
//                     ...dept,
//                     status: dept.status === 'active' ? 'inactive' : 'active'
//                 };
//             }
//             return dept;
//         }));
//     };

//     return (
//         <div className="departments-container">
//             <div className="page-header">
//                 <h2>Departments</h2>
//                 <button className="add-dept-btn" onClick={() => setShowAddForm(true)}>
//                     Add New Department
//                 </button>
//             </div>

//             <div className="search-section">
//                 <div className="search-box">
//                     <input
//                         type="text"
//                         placeholder="Search by department name, head, or description"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>
//             </div>

//             {showAddForm && (
//                 <div className="department-form-container">
//                     <div className="form-header">
//                         <h3>Add New Department</h3>
//                         <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
//                     </div>

//                     <form onSubmit={handleAddDepartment}>
//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Department Name:</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={departmentForm.name}
//                                     onChange={handleFormChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Department Head:</label>
//                                 <input
//                                     type="text"
//                                     name="head"
//                                     value={departmentForm.head}
//                                     onChange={handleFormChange}
//                                     placeholder="Leave blank if not assigned"
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Description:</label>
//                                 <textarea
//                                     name="description"
//                                     value={departmentForm.description}
//                                     onChange={handleFormChange}
//                                     rows="3"
//                                     placeholder="Enter department description"
//                                 ></textarea>
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Status:</label>
//                                 <select
//                                     name="status"
//                                     value={departmentForm.status}
//                                     onChange={handleFormChange}
//                                 >
//                                     <option value="active">Active</option>
//                                     <option value="inactive">Inactive</option>
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="form-actions">
//                             <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
//                                 Cancel
//                             </button>
//                             <button type="submit" className="save-btn">
//                                 Add Department
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             {showEditForm && currentDepartment && (
//                 <div className="department-form-container">
//                     <div className="form-header">
//                         <h3>Edit Department</h3>
//                         <button className="close-btn" onClick={() => setShowEditForm(false)}>×</button>
//                     </div>

//                     <form onSubmit={handleUpdateDepartment}>
//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Department Name:</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={departmentForm.name}
//                                     onChange={handleFormChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Department Head:</label>
//                                 <input
//                                     type="text"
//                                     name="head"
//                                     value={departmentForm.head}
//                                     onChange={handleFormChange}
//                                     placeholder="Leave blank if not assigned"
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Description:</label>
//                                 <textarea
//                                     name="description"
//                                     value={departmentForm.description}
//                                     onChange={handleFormChange}
//                                     rows="3"
//                                     placeholder="Enter department description"
//                                 ></textarea>
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Status:</label>
//                                 <select
//                                     name="status"
//                                     value={departmentForm.status}
//                                     onChange={handleFormChange}
//                                 >
//                                     <option value="active">Active</option>
//                                     <option value="inactive">Inactive</option>
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="form-actions">
//                             <button type="button" className="cancel-btn" onClick={() => setShowEditForm(false)}>
//                                 Cancel
//                             </button>
//                             <button type="submit" className="save-btn">
//                                 Update Department
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             <div className="departments-grid">
//                 {filteredDepartments.map(dept => (
//                     <div key={dept.id} className={`department-card ${dept.status === 'inactive' ? 'inactive' : ''}`}>
//                         <div className="department-card-header">
//                             <h3>{dept.name}</h3>
//                             <span className={`status-badge ${dept.status}`}>
//                                 {dept.status}
//                             </span>
//                         </div>

//                         <div className="department-details">
//                             <div className="detail-item">
//                                 <span className="detail-label">Department Head:</span>
//                                 <span className="detail-value">{dept.head}</span>
//                             </div>

//                             <div className="detail-item">
//                                 <span className="detail-label">Description:</span>
//                                 <span className="detail-value description">{dept.description}</span>
//                             </div>

//                             <div className="detail-item">
//                                 <span className="detail-label">Total Officials:</span>
//                                 <span className="detail-value">{dept.totalOfficials}</span>
//                             </div>

//                             <div className="detail-item">
//                                 <span className="detail-label">Active Petitions:</span>
//                                 <span className="detail-value">{dept.activePetitions}</span>
//                             </div>

//                             <div className="detail-item">
//                                 <span className="detail-label">Avg. Resolution Time:</span>
//                                 <span className="detail-value">{dept.avgResolutionTime}</span>
//                             </div>
//                         </div>

//                         <div className="department-actions">
//                             <button className="edit-btn" onClick={() => handleEditClick(dept)}>
//                                 Edit
//                             </button>
//                             <button
//                                 className={`status-toggle-btn ${dept.status === 'active' ? 'deactivate' : 'activate'}`}
//                                 onClick={() => handleStatusToggle(dept.id)}
//                             >
//                                 {dept.status === 'active' ? 'Deactivate' : 'Activate'}
//                             </button>
//                             <button className="view-officials-btn">
//                                 View Officials
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {filteredDepartments.length === 0 && (
//                 <div className="no-results">
//                     <p>No departments found matching your search.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Departments;