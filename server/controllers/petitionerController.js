const model = require('../models'); // Sequelize Model
const path = require('path');
const multer = require('multer');
const { DataTypes, Sequelize } = require('sequelize');
const authenticateToken = require('../middleware/authenticate');
const nodemailer = require('nodemailer');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');
const StreamTransport = require('nodemailer/lib/stream-transport');
// const { sendMail } = require('../utils/emailService'); // Email utility

// Multer Storage Setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage }).single('attachments'); // Accepts only one file

// Function to generate petitionId
const generatePetitionId = async () => {
    const year = new Date().getFullYear();

    // Find the latest petition ID
    const latestPetition = await model.petiguard.petitionForm.findOne({
        order: [['createdAt', 'DESC']],
        attributes: ['petitionId'],
    });

    let nextNumber = 1;
    if (latestPetition && latestPetition.petitionId) {
        // Extract the last number from petitionId
        const lastNumber = parseInt(latestPetition.petitionId.slice(-5), 10);
        nextNumber = lastNumber + 1;
    }
    else {
        console.log("nextNumber::", nextNumber);
        nextNumber = 1
    }

    // Format ID (e.g., PET20230001)
    return `PET${year}${String(nextNumber).padStart(5, '0')}`;
};

// Store Petition Form
const createPetition = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: 'File upload failed' });
        console.log("Received Petition Form Data:", req.body);

        try {
            const petitionId = await generatePetitionId();
            const assignedOfficial = await model.petiguard.official.findOne({
                where: {
                    district: req.body.district,
                    city: req.body.city,
                    department: req.body.department
                }
            });

            if (!assignedOfficial) {
                return res.status(400).json({ error: 'No official found for this petition request' });
            }

            // Check if the user has already submitted a petition for the same department within the last 10 days
            const existingPetition = await model.petiguard.petitionForm.findOne({
                where: {
                    email: req.user.email,
                    department: req.body.department
                },
                order: [['createdAt', 'DESC']] // Get the latest petition
            });

            if (existingPetition) {
                const lastSubmittedDate = new Date(existingPetition.createdAt);
                const currentDate = new Date();

                // Calculate the difference in days
                const diffTime = Math.abs(currentDate - lastSubmittedDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

                if (diffDays < 10) {
                    return res.status(400).json({
                        error: `You can only resubmit a petition for the same department after 10 days. Last submitted on ${lastSubmittedDate.toDateString()}.`
                    });
                }
            }

            const petitionData = {
                ...req.body,
                petitionId,
                email: req.user.email,
                status: 'pending',
                assigned_official_id: assignedOfficial.email,
                attachmentPath: req.file ? `/uploads/${req.file.filename}` : null,
            };

            const newPetition = await model.petiguard.petitionForm.create(petitionData);

            res.status(201).json({ message: 'Petition submitted successfully', data: newPetition });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

// Fetch Petition Forms
const getPetitions = async (req, res) => {
    try {
        const petitions = await model.petiguard.petitionForm.findAll({
            where: { email: req.user.email },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ petitions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPetitionStatus = async (req, res) => {
    try {
        if (!req.body.petitionId) {
            return res.status(400).json({ error: 'Petition ID is required' });
        }

        let whereCondition = {
            petitionId: req.body.petitionId
        };

        if (req.user && Array.isArray(req.user.role) && req.user.role[0] === "user") {
            whereCondition.email = req.user.email;
        } else if (req.official) {
            whereCondition.assigned_official_id = req.official.email;
        } else {
            return res.status(400).json({ error: 'User information not found' });
        }

        const petition = await model.petiguard.petitionForm.findOne({
            where: whereCondition
        });
        
        if (!petition) {
            return res.status(404).json({ error: 'Petition not found' });
        }
        
        res.status(200).json({ petition });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRecentActivity = async (req, res) => {
    try {
        const petitions = await model.petiguard.petitionForm.findAll({
            where: { email: req.user.email },
            order: [['updatedAt', 'DESC']],
            limit: 5,
            attributes: ['petitionId', 'status', 'updatedAt', 'petitionType', 'description']

        });
        res.status(200).json({ petitions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const streamTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'priyadharshinipandiyan2002@gmail.com', // Replace with your Gmail address
        pass: 'objq kguz frma xccn'          // Replace with your Gmail password or an App Password
    }
}); 

const sendMail = async (req, res) => {
    // const { name, email, requestType, subject, message } = req.body;

    // if (!name || !email || !requestType || !subject || !message) {
    //     return res.status(400).json({ message: 'All fields are required.' });
    // }

    const mailOptions = {
        from: "priyadharshinipandiyan28@gmail.com", // Your email address
        to: req.body.email, // The email address where support requests should go
        subject: `Support Request - ${req.body.requestType}: ${req.body.subject}`,
        html: `
            <h3>New Support Request</h3>
            <p><strong>Name:</strong> ${req.body.name}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Request Type:</strong> ${req.body.requestType}</p>
            <p><strong>Subject:</strong> ${req.body.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${req.body.message.replace(/\n/g, '<br>')}</p>
        `
    };
    try {
        const petitions = await streamTransport.sendMail(mailOptions);
        res.status(200).json({ petitions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserPetitionStatus = async (req, res) => {
    try {
        const status = await model.petiguard.petitionForm.findAll({
            where: { email: req.user.email },
            attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']],
            group: ['status']
        });

        // Calculate the total count of petitions
        const total = status.reduce((sum, item) => sum + parseInt(item.dataValues.count), 0);

        // Add the total to the result
        const statusWithTotal = {
            status: status.map(item => ({
                status: item.dataValues.status,
                count: parseInt(item.dataValues.count)
            })),
            total: total
        };

        res.status(200).json({ statusWithTotal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOfficialPetitions = async (req, res) => {
    try {
        console.log("Request Official Object:", req.official);
        console.log("Official Email:", req.official?.email);

        // Get the counts by status
        const statusCounts = await model.petiguard.petitionForm.findAll({
            where: { assigned_official_id: req.official.email },
            attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']],
            group: ['status'],
            raw: true
        });
        
        // Get all form details without pagination
        const petitionDetails = await model.petiguard.petitionForm.findAll({
            where: { assigned_official_id: req.official.email },
            raw: true
        });
        
        // Define priority keywords
        const priorityKeywords = {
            high: ['urgent', 'critical', 'emergency', 'vital', 'imperative', 'paramount', 'crucial', 'immediate'],
            medium: ['important', 'substantial', 'necessary', 'significant', 'moderate', 'considerable', 'standard'],
            low: ['routine', 'minor', 'trivial', 'optional', 'secondary', 'nominal', 'incidental', 'low']
        };
        
        // Track high priority count
        let urgentCount = 0;
        
        // Assign priority based on keywords in description
        const petitionsWithPriority = petitionDetails.map(petition => {
            const description = (petition.description || '').toLowerCase();
            let priority = 'low'; // Default priority
            
            // Check for high priority keywords
            if (priorityKeywords.high.some(keyword => description.includes(keyword))) {
                priority = 'high';
                urgentCount++; // Increment urgent count for high priority items
            }
            // Check for medium priority keywords (only if high priority wasn't found)
            else if (priorityKeywords.medium.some(keyword => description.includes(keyword))) {
                priority = 'medium';
            }
            
            return {
                ...petition,
                priority: priority
            };
        });
        
        const total = statusCounts.reduce((sum, item) => sum + parseInt(item.count), 0);

        const enhancedStatusCounts = [
            ...statusCounts.map(item => ({
                status: item.status,
                count: parseInt(item.count)
            })),
            {
                status: 'urgent',
                count: urgentCount 
            }
        ];

        // Add the total to the result
        const statusWithTotal = {
            status: enhancedStatusCounts,
            total: total,
            forms: petitionsWithPriority
        };
        
        console.log("Petition:::", statusWithTotal);
        res.status(200).json({ statusWithTotal });
    } catch (error) {
        console.log("Petition:::", error);
        res.status(500).json({ error: error.message });
    }
};

// Update Petition Status
const updatePetitionStatus = async (req, res) => {
    try {
        const petitions = req.body; // Expecting an array of objects with petitionId and status
        
        // These should match EXACTLY what's in your database ENUM definition
        // Update this list based on your actual database schema
        const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
        
        // Log what values are allowed
        console.log('Valid status values:', validStatuses);
        
        if (!Array.isArray(petitions)) {
            // Handle single petition case
            const { petitionId, status } = req.body;
            
            console.log(`Attempting to update petition ${petitionId} with status "${status}"`);
            
            // Check if the submitted status matches one of the valid options
            if (!validStatuses.includes(status)) {
                console.warn(`Invalid status value: "${status}". Valid values are: ${validStatuses.join(', ')}`);
                return res.status(400).json({ 
                    error: `Invalid status value. Status must be one of: ${validStatuses.join(', ')}` 
                });
            }
            
            const petition = await model.petiguard.petitionForm.findOne({ where: { petitionId } });
            
            if (!petition) {
                return res.status(404).json({ error: 'Petition not found' });
            }
            
            // Log current and new status
            console.log(`Updating petition status from "${petition.status}" to "${status}"`);
            
            await petition.update({ status });
            
            return res.status(200).json({ message: 'Petition status updated successfully' });
        }
        
        // Handle multiple petitions
        const results = [];
        const errors = [];
        
        // Process each petition
        for (const item of petitions) {
            const { petitionId, status } = item;
            
            try {
                console.log(`Attempting to update petition ${petitionId} with status "${status}"`);
                
                // Check if the submitted status matches one of the valid options
                if (!validStatuses.includes(status)) {
                    console.warn(`Invalid status value: "${status}". Valid values are: ${validStatuses.join(', ')}`);
                    errors.push({ 
                        petitionId, 
                        error: `Invalid status value. Status must be one of: ${validStatuses.join(', ')}` 
                    });
                    continue;
                }
                
                const petition = await model.petiguard.petitionForm.findOne({ where: { petitionId } });
                
                if (!petition) {
                    errors.push({ petitionId, error: 'Petition not found' });
                    continue;
                }
                
                // Log current and new status
                console.log(`Updating petition status from "${petition.status}" to "${status}"`);
                
                await petition.update({ status });
                results.push({ petitionId, status: 'updated' });
            } catch (error) {
                console.error(`Error updating petition ${petitionId}:`, error);
                errors.push({ petitionId, error: error.message });
            }
        }
        
        res.status(200).json({ 
            message: 'Petition status updates processed',
            results,
            errors: errors.length ? errors : undefined
        });
    } catch (error) {
        console.error('Error updating petition status:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createPetition, sendMail,getRecentActivity, getPetitionStatus, getPetitions, getUserPetitionStatus, getOfficialPetitions, updatePetitionStatus };