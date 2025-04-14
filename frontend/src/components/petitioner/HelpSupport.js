// src/components/petitioner/HelpSupport.js
import React, { useState } from 'react';
import './HelpSupport.css';

const HelpSupport = () => {
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        requestType: 'general'
    });
    const [submitted, setSubmitted] = useState(false);

    const toggleQuestion = (index) => {
        setActiveQuestion(activeQuestion === index ? null : index);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setTimeout(() => {
            console.log('Support request submitted:', formData);
            setSubmitted(true);
            // Reset form after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    requestType: 'general'
                });
            }, 3000);
        }, 1000);
    };

    const faqs = [
        {
            question: 'How do I submit a petition?',
            answer: 'To submit a petition, navigate to the "Submit Petition" page from the sidebar menu. Fill out all required fields in the form including your personal details, petition subject, and description. You can also attach supporting documents if needed. Once completed, click the "Submit Petition" button at the bottom of the form.'
        },
        {
            question: 'How long does it take to process a petition?',
            answer: 'Processing time varies depending on the type and complexity of your petition. Most petitions are initially reviewed within 3-5 business days. Once your petition is assigned to the relevant department, you will receive an updated status along with an estimated completion timeframe. Urgent matters may be processed faster.'
        },
        {
            question: 'How can I check the status of my petition?',
            answer: 'You can check your petition status in two ways: 1) Go to the "Track Status" page and enter your petition ID, or 2) View all your petitions by navigating to "My Petitions" in the sidebar menu. Each petition card displays its current status, and you can click "View Details" for more information.'
        },
        {
            question: 'What if I forgot my petition ID?',
            answer: 'If you\'ve forgotten your petition ID, you can find all your submitted petitions in the "My Petitions" section. Alternatively, you can contact our support team with your registered email address, and they will help you recover your petition ID.'
        },
        {
            question: 'Can I update my petition after submission?',
            answer: 'Once a petition is submitted, you cannot directly edit it. However, you can provide additional information or documents by contacting our support team with your petition ID. For substantial changes, we may recommend submitting a new petition.'
        }
    ];

    return (
        <div className="help-support-container">
            <h2>Help & Support</h2>

            {submitted && (
                <div className="success-message">
                    <span>✓</span> Your support request has been submitted successfully. We will get back to you shortly.
                </div>
            )}

            <div className="help-support-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <div className="faq-question" onClick={() => toggleQuestion(index)}>
                                <span>{faq.question}</span>
                                <span>{activeQuestion === index ? '−' : '+'}</span>
                            </div>
                            <div className={`faq-answer ${activeQuestion === index ? 'open' : ''}`}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="help-support-section">
                <h3>Contact Us</h3>
                <div className="contact-options">
                    <div className="contact-card">
                        <div className="contact-icon">📞</div>
                        <div className="contact-title">Phone Support</div>
                        <div className="contact-info">Available Mon-Fri, 9am-5pm</div>
                        <div className="contact-info">1-800-PETITION</div>
                        <a href="tel:1-800-PETITION" className="contact-link">Call Now</a>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon">✉️</div>
                        <div className="contact-title">Email Support</div>
                        <div className="contact-info">Response within 24 hours</div>
                        <div className="contact-info">support@petiguard.gov</div>
                        <a href="mailto:support@petiguard.gov" className="contact-link">Send Email</a>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon">💬</div>
                        <div className="contact-title">Live Chat</div>
                        <div className="contact-info">Available 24/7</div>
                        <div className="contact-info">Get instant support</div>
                        <a href="#" className="contact-link">Start Chat</a>
                    </div>
                </div>
            </div>

            <div className="help-support-section">
                <h3>Submit a Support Request</h3>
                <form className="support-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Request Type</label>
                        <select
                            name="requestType"
                            value={formData.requestType}
                            onChange={handleInputChange}
                        >
                            <option value="general">General Inquiry</option>
                            <option value="technical">Technical Support</option>
                            <option value="petition">Petition Help</option>
                            <option value="feedback">Feedback</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>
                    <div class="d-flex justify-content-center align-items-center">

                        <button type="submit" className="submit-btn">Submit Request</button>
                    </div>
                </form>
            </div>

            <div className="help-support-section">
                <h3>Helpful Resources</h3>
                <div className="resources-grid">
                    <div className="resource-card">
                        <div className="resource-icon">📄</div>
                        <div className="resource-title">User Guide</div>
                        <div className="resource-desc">Complete guide to using the PetiGuard platform</div>
                        <a href="#" className="resource-link">View Guide</a>
                    </div>
                    <div className="resource-card">
                        <div className="resource-icon">🎬</div>
                        <div className="resource-title">Video Tutorials</div>
                        <div className="resource-desc">Step-by-step visual instructions</div>
                        <a href="#" className="resource-link">Watch Now</a>
                    </div>
                    <div className="resource-card">
                        <div className="resource-icon">📊</div>
                        <div className="resource-title">Best Practices</div>
                        <div className="resource-desc">Tips for submitting effective petitions</div>
                        <a href="#" className="resource-link">Learn More</a>
                    </div>
                    <div className="resource-card">
                        <div className="resource-icon">🔍</div>
                        <div className="resource-title">Common Issues</div>
                        <div className="resource-desc">Solutions to frequently encountered problems</div>
                        <a href="#" className="resource-link">Read More</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;