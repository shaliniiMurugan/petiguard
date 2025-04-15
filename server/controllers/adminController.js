const model = require('../models'); // Sequelize Model
const path = require('path');
const { DataTypes, Sequelize ,Op} = require('sequelize');
const moment = require('moment');

// Helper function to get date filter based on time range
const getDateRange = (timeRange) => {
    const endDate = new Date();
    let startDate;
    
    switch (timeRange) {
        case 'week':
            startDate = moment().subtract(1, 'weeks').toDate();
            break;
        case 'month':
            startDate = moment().subtract(1, 'months').toDate();
            break;
        case 'quarter':
            startDate = moment().subtract(3, 'months').toDate();
            break;
        case 'year':
            startDate = moment().subtract(1, 'years').toDate();
            break;
        default:
            startDate = moment().subtract(1, 'months').toDate(); // Default to month
    }
    
    return { startDate, endDate };
};

// Get overview statistics for dashboard
const getOverview = async (req, res) => {
    try {
        const { timeRange } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);
        
        // Get total petitions count
        const totalPetitions = await model.petiguard.petitionForm.count({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] }
            }
        });
        
        // Get resolved petitions count
        const resolvedPetitions = await model.petiguard.petitionForm.count({
            where: {
                status: 'resolved',
                createdAt: { [Op.between]: [startDate, endDate] }
            }
        });

        // Get pending petitions count
        const pendingPetitions = await model.petiguard.petitionForm.count({
            where: {
                status: 'pending',
                createdAt: { [Op.between]: [startDate, endDate] }
            }
        });

        // Calculate average resolution time
        const resolvedPetitionsWithTimes = await model.petiguard.petitionForm.findAll({
            where: {
                status: 'resolved',
                createdAt: { [Op.between]: [startDate, endDate] },
                updatedAt: { [Op.not]: null }
            },
            attributes: [
                [Sequelize.fn('AVG', 
                    Sequelize.fn('TIMESTAMPDIFF', 
                        Sequelize.literal('DAY'), 
                        Sequelize.col('createdAt'), 
                        Sequelize.col('updatedAt')
                    )
                ), 'avgDays']
            ],
            raw: true
        });

        // Placeholder for satisfaction rate - in real application, this would come from feedback data
        // For now, using a fixed value as shown in your frontend code
        const satisfactionRate = '87%';

        const avgResolutionTime = resolvedPetitionsWithTimes[0].avgDays ? 
            `${parseFloat(resolvedPetitionsWithTimes[0].avgDays).toFixed(1)} days` : 
            'N/A';

        res.status(200).json({
            totalPetitions,
            resolvedPetitions,
            pendingPetitions,
            avgResolutionTime,
            satisfactionRate
        });
    } catch (error) {
        console.error('Error fetching overview data:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get department performance metrics
const getDepartments = async (req, res) => {
    try {
        const { timeRange } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);
        
        // Get department metrics
        const departmentData = await model.petiguard.petitionForm.findAll({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            attributes: [
                'department',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'petitions'],
                [Sequelize.fn('SUM', 
                    Sequelize.literal(`CASE WHEN status = 'resolved' THEN 1 ELSE 0 END`)
                ), 'resolved']
            ],
            group: ['department']
        });

        // For each department, get the average resolution time
        const departmentPerformance = await Promise.all(
            departmentData.map(async (dept) => {
                const avgTimeResult = await model.petiguard.petitionForm.findAll({
                    where: {
                        department: dept.department,
                        status: 'resolved',
                        createdAt: { [Op.between]: [startDate, endDate] }
                    },
                    attributes: [
                        [Sequelize.fn('AVG', 
                            Sequelize.fn('TIMESTAMPDIFF', 
                                Sequelize.literal('DAY'), 
                                Sequelize.col('createdAt'), 
                                Sequelize.col('updatedAt')
                            )
                        ), 'avgDays']
                    ],
                    raw: true
                });
                
                const avgTime = avgTimeResult[0].avgDays ? 
                    `${parseFloat(avgTimeResult[0].avgDays).toFixed(1)} days` : 
                    'N/A';
                
                return {
                    name: dept.department,
                    petitions: parseInt(dept.dataValues.petitions),
                    resolved: parseInt(dept.dataValues.resolved),
                    avgTime
                };
            })
        );
        
        res.status(200).json(departmentPerformance);
    } catch (error) {
        console.error('Error fetching department data:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get monthly trends data - Complete rewrite to solve GROUP BY issues
const getTrends = async (req, res) => {
    try {
        const { timeRange } = req.query;
        let monthLimit = 12; // Default to a year
        
        if (timeRange === 'week') monthLimit = 1;
        else if (timeRange === 'month') monthLimit = 1;
        else if (timeRange === 'quarter') monthLimit = 3;
        
        const startDate = moment().subtract(monthLimit, 'months').startOf('month').toDate();
        const endDate = new Date();
        
        // Using raw SQL with sequelize to avoid GROUP BY issues
        const query = `
            SELECT 
                DATE_FORMAT(createdAt, '%b') as month,
                DATE_FORMAT(createdAt, '%Y-%m') as yearMonth,
                COUNT(id) as petitions,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM PetitionForm
            WHERE createdAt BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), DATE_FORMAT(createdAt, '%b')
            ORDER BY yearMonth ASC
        `;
        
        const monthlyData = await model.sequelize.query(query, {
            replacements: [startDate, endDate],
            type: model.sequelize.QueryTypes.SELECT
        });
        
        // Convert to the format needed by the frontend
        const monthlyTrends = monthlyData.map(item => ({
            month: item.month,
            petitions: parseInt(item.petitions),
            resolved: parseInt(item.resolved)
        }));
        
        res.status(200).json(monthlyTrends);
    } catch (error) {
        console.error('Error fetching trends data:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get priority distribution data
const getPriorities = async (req, res) => {
    try {
        const { timeRange } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);
        
        // Define priority keywords for analysis
        const priorityKeywords = {
            high: ['urgent', 'critical', 'emergency', 'vital', 'imperative', 'paramount', 'crucial', 'immediate'],
            medium: ['important', 'substantial', 'necessary', 'significant', 'moderate', 'considerable', 'standard'],
            low: ['routine', 'minor', 'trivial', 'optional', 'secondary', 'nominal', 'incidental', 'low']
        };
        
        // Fetch all petitions with their descriptions for the time range
        const petitions = await model.petiguard.petitionForm.findAll({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            attributes: ['id', 'description']
        });
        
        // Count total petitions
        const totalCount = petitions.length;
        
        // Initialize counters for different priority levels
        let criticalCount = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;
        
        // Analyze each petition description to determine priority
        petitions.forEach(petition => {
            const description = (petition.description || '').toLowerCase();
            
            // First check for "critical" keywords (we'll consider a subset of high as critical)
            if (['critical', 'emergency', 'urgent'].some(keyword => description.includes(keyword))) {
                criticalCount++;
            }
            // Then check for other high priority keywords
            else if (priorityKeywords.high.some(keyword => description.includes(keyword))) {
                highCount++;
            }
            // Check for medium priority keywords
            else if (priorityKeywords.medium.some(keyword => description.includes(keyword))) {
                mediumCount++;
            }
            // Default to low priority if no keywords match
            else {
                lowCount++;
            }
        });
        
        // Calculate percentages
        const calculatePercentage = (count) => {
            return parseFloat(((count / totalCount) * 100).toFixed(1)) || 0;
        };
        
        // Create priority distribution data
        const priorities = [
            { 
                priority: 'Critical', 
                count: criticalCount,
                percentage: calculatePercentage(criticalCount),
                color: '#e74c3c'
            },
            { 
                priority: 'High', 
                count: highCount,
                percentage: calculatePercentage(highCount),
                color: '#f39c12'
            },
            { 
                priority: 'Medium', 
                count: mediumCount,
                percentage: calculatePercentage(mediumCount),
                color: '#3498db'
            },
            { 
                priority: 'Low', 
                count: lowCount,
                percentage: calculatePercentage(lowCount),
                color: '#2ecc71'
            }
        ];
        
        res.status(200).json(priorities);
    } catch (error) {
        console.error('Error fetching priority data:', error);
        res.status(500).json({ error: error.message });
    }
};

// Function to get specific petition details
const getPetition = async (req, res) => {
    try {
        const { id } = req.params;
        
        const petition = await model.petiguard.petitionForm.findByPk(id);
        
        if (!petition) {
            return res.status(404).json({ error: 'Petition not found' });
        }
        
        res.status(200).json(petition);
    } catch (error) {
        console.error('Error fetching petition details:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all petitions with filtering capabilities
const getAllPetitions = async (req, res) => {
    try {
        const { department, status, timeRange, page = 1, limit = 10 } = req.query;
        
        // Build the where clause
        const whereClause = {};
        
        if (department) {
            whereClause.department = department;
        }
        
        if (status) {
            whereClause.status = status;
        }
        
        if (timeRange) {
            const { startDate, endDate } = getDateRange(timeRange);
            whereClause.createdAt = { [Op.between]: [startDate, endDate] };
        }
        
        // Calculate offset for pagination
        const offset = (page - 1) * limit;
        
        // Query with pagination
        const { count, rows } = await model.petiguard.petitionForm.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            petitions: rows
        });
    } catch (error) {
        console.error('Error fetching petitions:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update petition status
const updatePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_official_id, attachmentPath } = req.body;
        
        const petition = await model.petiguard.petitionForm.findByPk(id);
        
        if (!petition) {
            return res.status(404).json({ error: 'Petition not found' });
        }
        
        // Update the petition
        await petition.update({
            status,
            assigned_official_id,
            attachmentPath,
            updatedAt: new Date()
        });
        
        res.status(200).json({
            message: 'Petition updated successfully',
            petition
        });
    } catch (error) {
        console.error('Error updating petition:', error);
        res.status(500).json({ error: error.message });
    }
};

const getTotalStatus = async (req, res) => {
    try {
        
        // Get all status counts grouped by department and status
        const departmentStatusCounts = await model.petiguard.petitionForm.findAll({
            attributes: [
                'department',
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
            ],
            group: ['department', 'status']
        });

        // Calculate overall totals
        let overall = {
            pending: 0,
            in_progress : 0,
            resolved: 0,
            rejected: 0,
            urgent: 0,
            total: 0
        };

        // Process department data into the desired format
        const departments = {};
        
        departmentStatusCounts.forEach(item => {
            const department = item.department || 'Unassigned';
            const status = item.dataValues.status.toLowerCase();
            const count = parseInt(item.dataValues.count);
            
            // Initialize department object if it doesn't exist
            if (!departments[department]) {
                departments[department] = {
                    department: department,
                    pending: 0,
                    in_progress: 0,
                    resolved: 0,
                    rejected: 0,
                    urgent: 0,
                    total: 0
                };
            }
            
            // Update department status count
            if (status in departments[department]) {
                departments[department][status] = count;
                departments[department].total += count;
            }
            
            // Update overall counts
            if (status in overall) {
                overall[status] += count;
                overall.total += count;
            }
        });
        
        // Convert departments object to array format
        const departmentArray = Object.values(departments);
        
        // Return in the exact format requested
        res.status(200).json({
            overall: overall,
            departmentStatusCounts: departmentArray
        });
        
    } catch (error) {
        console.error('Error fetching department status counts:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await model.petiguard.user.findAll({
            attributes: ['id', 'email', 'name', 'phone', 'address','district','city','verificationId','createdAt'],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.body;
        const { email, name, phone, address, district, city, verificationId } = req.body;
        
        // Replace findOne(id) with findByPk(id)
        const user = await model.petiguard.user.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update the user
        await user.update({
            email,
            name,
            phone,
            address,
            district,
            city,
            verificationId
        });
        
        // Refresh user data after update
        const updatedUser = await user.reload();
        
        res.status(200).json({ 
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                district: updatedUser.district,
                city: updatedUser.city,
                verificationId: updatedUser.verificationId
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;
        
        // Find the user first to make sure it exists
        const user = await model.petiguard.user.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await user.destroy();
        
        res.status(200).json({ 
            message: 'User deleted successfully',
            id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllOfficial = async (req, res) => {
    try {
        const officials = await model.petiguard.official.findAll({
            attributes: ['id', 'email', 'name', 'phone', 'address','district','city','idProofNo','createdAt'],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({ officials });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOfficial = async (req, res) => {
    try {
        const { id } = req.body;
        const { email, name, phone, address, district, city, idProofNo } = req.body;
        
        // Replace findOne(id) with findByPk(id)
        const official = await model.petiguard.official.findByPk(id);
        
        if (!official) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update the user
        await official.update({
            email,
            name,
            phone,
            address,
            district,
            city,
            idProofNo
        });
        
        // Refresh user data after update
        const updatedOfficial = await official.reload();
        
        res.status(200).json({ 
            message: 'Official updated successfully',
            user: {
                id: updatedOfficial.id,
                name: updatedOfficial.name,
                email: updatedOfficial.email,
                phone: updatedOfficial.phone,
                address: updatedOfficial.address,
                district: updatedOfficial.district,
                city: updatedOfficial.city,
                idProofNo: updatedOfficial.idProofNo
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteOfficial = async (req, res) => {
    try {
        const { id } = req.body;
        
        // Find the user first to make sure it exists
        const official = await model.petiguard.official.findByPk(id);
        
        if (!official) {
            return res.status(404).json({ error: 'Official not found' });
        }
        
        await official.destroy();
        
        res.status(200).json({ 
            message: 'Official deleted successfully',
            id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = { getTotalStatus,getAllUsers,updateUser,deleteUser,
    getAllOfficial,updateOfficial,deleteOfficial,
    getOverview,
    getDepartments,
    getTrends,
    getPriorities,
    getPetition,
    getAllPetitions,
    updatePetition};