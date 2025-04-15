import React, { useState, useEffect } from 'react';
import './PetitionForm.css';
import { districtData } from './districtData'; // Import from separate file
import axios from 'axios'; // Make sure to import axios

// Create a speech recognition object with browser prefix handling
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

// Check if the browser supports speech recognition
const isSpeechRecognitionSupported = () => {
    return SpeechRecognition !== undefined;
};

const PetitionForm = () => {
    // ==================== STATE MANAGEMENT ====================
    const [petitionData, setPetitionData] = useState({
        // Petition Details
        petitionType: '',
        department: '',
        description: '',

        // Applicant Details
        name: '',
        fatherHusbandName: '',
        mobileNumber: '',
        gender: '',
        community: '',
        specialCategory: '',

        // Address Details
        doorNumber: '',
        street: '',
        area: '',
        district: '',
        taluk: '',
        revenueVillage: '',

        // Contact Details
        email: '',

        // Attachments
        attachments: null
    });

    // Form state management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [petitionId, setPetitionId] = useState('');
    const [transcription, setTranscription] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [speechSupported, setSpeechSupported] = useState(true);

    // Section expand/collapse state
    const [expandPetitionDetails, setExpandPetitionDetails] = useState(true);
    const [expandApplicantDetails, setExpandApplicantDetails] = useState(true);

    // Dynamic dropdown options based on selections
    const [availableTaluks, setAvailableTaluks] = useState([]);
    const [availableVillages, setAvailableVillages] = useState([]);

    // ==================== SPEECH RECOGNITION SETUP ====================
    useEffect(() => {
        // Check if speech recognition is supported
        if (isSpeechRecognitionSupported()) {
            // Initialize speech recognition
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US'; // Set language

            // Set up event handlers
            recognition.onresult = (event) => {
                let currentTranscript = '';
                
                // Collect all speech segments
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        currentTranscript += transcript;
                    }
                }
                
                // Update transcription state
                setTranscription(prev => {
                    const newTranscription = prev + ' ' + currentTranscript;
                    
                    // Also update the description field with the transcription
                    setPetitionData(prevData => ({
                        ...prevData,
                        description: newTranscription.trim()
                    }));
                    
                    return newTranscription;
                });
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setAlert({
                    show: true,
                    message: `Microphone error: ${event.error}. Please check microphone permissions.`,
                    type: 'error'
                });
                setIsListening(false);
            };

            recognition.onend = () => {
                // Only set listening to false if the user manually stopped
                // or an error occurred (handled in onerror)
                if (isListening) {
                    setIsListening(false);
                }
            };
        } else {
            setSpeechSupported(false);
        }

        // Clean up function
        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, []);

    // ==================== EVENT HANDLERS ====================

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPetitionData({
            ...petitionData,
            [name]: value
        });
    };

    // Handle file upload
    const handleFileChange = (e) => {
        setPetitionData({
            ...petitionData,
            attachments: e.target.files[0]
        });
    };

    // Handle section toggle (expand/collapse)
    const toggleSection = (section) => {
        if (section === 'petition') {
            setExpandPetitionDetails(!expandPetitionDetails);
        } else if (section === 'applicant') {
            setExpandApplicantDetails(!expandApplicantDetails);
        }
    };

    // District change handler (updates available taluks)
    const handleDistrictChange = (e) => {
        const district = e.target.value;

        // Update district in form data and reset dependent fields
        setPetitionData({
            ...petitionData,
            district: district,
            taluk: '',
            revenueVillage: ''
        });

        // Set available taluks based on selected district
        if (district && districtData.taluksByDistrict[district]) {
            setAvailableTaluks(districtData.taluksByDistrict[district]);
        } else {
            setAvailableTaluks([]);
        }

        // Reset available villages
        setAvailableVillages([]);
    };

    // Taluk change handler (updates available villages)
    const handleTalukChange = (e) => {
        const taluk = e.target.value;

        // Update taluk in form data and reset dependent fields
        setPetitionData({
            ...petitionData,
            taluk: taluk,
            revenueVillage: ''
        });

        // For demonstration, generate villages based on taluk
        if (taluk) {
            // In a real app, this would come from a proper mapping
            const villageList = [
                `${taluk} North`,
                `${taluk} South`,
                `${taluk} East`,
                `${taluk} West`,
                `${taluk} Central`
            ];
            setAvailableVillages(villageList);
        } else {
            setAvailableVillages([]);
        }
    };

    // Voice recording toggle with actual microphone access
    const toggleRecording = () => {
        if (!speechSupported) {
            setAlert({
                show: true,
                message: 'Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.',
                type: 'error'
            });
            return;
        }

        if (isListening) {
            // Stop recording
            recognition.stop();
            setIsListening(false);
        } else {
            // Clear previous transcription only if starting fresh
            if (!transcription) {
                setTranscription('');
            }

            // Request microphone permission and start recording
            try {
                recognition.start();
                setIsListening(true);
            } catch (error) {
                console.error('Speech recognition error:', error);
                setAlert({
                    show: true,
                    message: 'Failed to start speech recognition. Please check microphone permissions.',
                    type: 'error'
                });
            }
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAlert({ show: false, message: '', type: '' });

        try {
            // Get token from localStorage (matching your login handler)
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication required. Please log in.');
            }

            // Get user data from localStorage if needed
            // This can be used to pre-fill some fields if needed
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');

            // Prepare data for API call
            const submissionData = {
                petitionType: petitionData.petitionType,
                department: petitionData.department,
                description: petitionData.description, // Now this could contain transcription
                name: petitionData.name,
                fatherHusbandName: petitionData.fatherHusbandName,
                mobileNumber: petitionData.mobileNumber,
                gender: petitionData.gender,
                community: petitionData.community || 'None',
                specialCategory: petitionData.specialCategory || 'None',
                doorNumber: petitionData.doorNumber,
                street: petitionData.street,
                area: petitionData.area,
                district: petitionData.district,
                city: petitionData.taluk, // Using taluk as city since it's in the API payload
                revenueVillage: petitionData.revenueVillage || 'None',
                email: petitionData.email || userData.email, // Use user email if form email is empty
                status: 'pending',
                attachments: ''
            };

            // Make the API call using axios (to match your login implementation)
            let response;
            
            if (petitionData.attachments) {
                // If there's a file to upload, use FormData
                const formData = new FormData();
                formData.append('attachments', petitionData.attachments);
                
                // Add all other fields to the FormData
                Object.entries(submissionData).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                response = await axios.post('http://localhost:3000/api/user/petition', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // No file, just send JSON
                response = await axios.post('http://localhost:3000/api/user/petition', submissionData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            // Process successful response
            if (response.data && response.data.data) {
                // Set petition ID from response
                setPetitionId(response.data.data.petitionId);
                setSubmitted(true);
                
                // Show success message
                setAlert({
                    show: true,
                    message: response.data.message || 'Petition submitted successfully!',
                    type: 'success'
                });
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error submitting petition:', error);
            
            // Show error message
            setAlert({
                show: true,
                message: error.response?.data?.message || error.message || 'Failed to submit petition',
                type: 'error'
            });
            
            // Auto-hide alert after 5 seconds
            setTimeout(() => {
                setAlert({ show: false, message: '', type: '' });
            }, 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form after submission
    const resetForm = () => {
        setPetitionData({
            petitionType: '',
            department: '',
            description: '',
            name: '',
            fatherHusbandName: '',
            mobileNumber: '',
            gender: '',
            community: '',
            specialCategory: '',
            doorNumber: '',
            street: '',
            area: '',
            district: '',
            taluk: '',
            revenueVillage: '',
            email: '',
            attachments: null
        });
        setTranscription('');
        setSubmitted(false);
        setPetitionId('');
        setAvailableTaluks([]);
        setAvailableVillages([]);
        setAlert({ show: false, message: '', type: '' });
        
        // Make sure speech recognition is stopped
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    };

    // ==================== RENDER HELPERS ====================

    // Render Alert Message
    const renderAlert = () => {
        if (!alert.show) return null;
        
        return (
            <div className={`alert alert-${alert.type}`}>
                {alert.message}
            </div>
        );
    };

    // Render Petition Details section
    const renderPetitionDetailsSection = () => (
        <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('petition')}>
                <h3>Petition Related Details</h3>
                <span className={`toggle-icon ${expandPetitionDetails ? 'expanded' : ''}`}>▼</span>
            </div>

            {expandPetitionDetails && (
                <div className="section-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Petition Type</label>
                            <select
                                name="petitionType"
                                value={petitionData.petitionType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">--Select--</option>
                                {districtData.petitionTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="required">Department</label>
                            <select
                                name="department"
                                value={petitionData.department}
                                onChange={handleChange}
                                required
                            >
                                <option value="">--Select--</option>
                                {districtData.departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="required">Petition Detail</label>
                        <textarea
                            name="description"
                            value={petitionData.description}
                            onChange={handleChange}
                            rows="5"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Upload Petition Copy / Supporting Documents (Optional)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg"
                        />
                        <p className="file-formats">
                            Maximum file size allowed 1.5 MB. Only PDF or JPEG file should be uploaded, if
                            you have many files, combine them into a single file.
                        </p>
                    </div>

                    <div className="form-group voice-recorder">
                        <label>Voice Recording (for those who can't type)</label>
                        <div className="voice-recorder-controls">
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`record-btn ${isListening ? 'recording' : ''}`}
                            >
                                {isListening ? 'Stop Recording' : 'Start Recording'}
                            </button>
                            {isListening && <span className="recording-indicator">Recording... Speak now</span>}
                        </div>
                        {!speechSupported && (
                            <p className="warning-text">
                                Speech recognition not supported in your browser. Please use Chrome, Edge, or Safari.
                            </p>
                        )}
                        {transcription && (
                            <div className="transcription-result">
                                <h4>Transcription:</h4>
                                <p>{transcription}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Render Applicant Details section
    const renderApplicantDetailsSection = () => (
        <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('applicant')}>
                <h3>Applicant Details & Communication Address</h3>
                <span className={`toggle-icon ${expandApplicantDetails ? 'expanded' : ''}`}>▼</span>
            </div>

            {expandApplicantDetails && (
                <div className="section-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobileNumber"
                                value={petitionData.mobileNumber}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                placeholder="10-digit mobile number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={petitionData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">Father / Husband Name</label>
                            <input
                                type="text"
                                name="fatherHusbandName"
                                value={petitionData.fatherHusbandName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Gender</label>
                            <select
                                name="gender"
                                value={petitionData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">--Select--</option>
                                {districtData.genderOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Community</label>
                            <select
                                name="community"
                                value={petitionData.community}
                                onChange={handleChange}
                            >
                                <option value="">--Select--</option>
                                {districtData.communities.map(community => (
                                    <option key={community} value={community}>{community}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Special Category</label>
                            <select
                                name="specialCategory"
                                value={petitionData.specialCategory}
                                onChange={handleChange}
                            >
                                <option value="">--Select--</option>
                                {districtData.specialCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Address Door Number</label>
                            <input
                                type="text"
                                name="doorNumber"
                                value={petitionData.doorNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">Street</label>
                            <input
                                type="text"
                                name="street"
                                value={petitionData.street}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">Area / Ward / Place</label>
                            <input
                                type="text"
                                name="area"
                                value={petitionData.area}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">District</label>
                            <select
                                name="district"
                                value={petitionData.district}
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
                            <label className="required">Taluk</label>
                            <select
                                name="taluk"
                                value={petitionData.taluk}
                                onChange={handleTalukChange}
                                required
                                disabled={!petitionData.district}
                            >
                                <option value="">--Select--</option>
                                {availableTaluks.map(taluk => (
                                    <option key={taluk} value={taluk}>{taluk}</option>
                                ))}
                            </select>
                            {!petitionData.district &&
                                <p className="hint-text">Please select a district first</p>
                            }
                        </div>

                        <div className="form-group">
                            <label>Revenue Village</label>
                            <input
                                type="text"
                                name="revenueVillage"
                                value={petitionData.revenueVillage}
                                onChange={handleChange}
                                disabled={!petitionData.taluk}
                            />
                            {!petitionData.taluk &&
                                <p className="hint-text">Please select a taluk first</p>
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Render success message after submission
    const renderSuccessMessage = () => (
        <div className="success-message">
            <div className="checkmark-circle">
                <div className="checkmark"></div>
            </div>
            <h3>Petition Submitted Successfully!</h3>
            <p>Your petition has been received and will be processed soon.</p>
            <p>Petition ID: <strong>{petitionId}</strong></p>
            <p>Please save this ID for tracking your petition status.</p>
            <button onClick={resetForm} className="new-petition-btn">Submit Another Petition</button>
        </div>
    );

    // ==================== MAIN RENDER ====================
    return (
        <div className="petition-form-container">
            <h2>Submit New Petition</h2>

            {renderAlert()}

            {submitted ? (
                renderSuccessMessage()
            ) : (
                <form onSubmit={handleSubmit} className="petition-form">
                    {renderPetitionDetailsSection()}
                    {renderApplicantDetailsSection()}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Petition'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default PetitionForm;