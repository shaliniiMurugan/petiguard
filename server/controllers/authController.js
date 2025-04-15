const bcrypt = require('bcryptjs')

const services = require('../service/index');
const model = require('../models');

const controller = {}

controller.loginUser = async (req, res) => {
    const { email, password, verificationId} = req.body;
    try {
        
        let result = await services.auth.loginService(email, password, verificationId)
        
        return res.status(result.status).json(result)
        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: `server error ${error}`
        })
    }   
}

controller.loginOfficial = async (req, res) => {
    const { email, password, idProof,idProofNo} = req.body;
    try {
        
        let result = await services.auth.officialLoginService(email, password, idProof,idProofNo)
        
        return res.status(result.status).json(result)
        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: `server error ${error}`
        })
    }   
}

controller.registerUser = async (req, res) => {
    try {
        // const { sin_number, name, email, password, father_name, year, department, college, quota, role } = req.body;
        const user = req.body
        console.log(user)
        const hashedPassword = await bcrypt.hash(user.password, 10);
        // const newUser = await model.user.create({ sin_number, name, email, password:hashedPassword, father_name, year, department, college, quota, role });
        user.password = hashedPassword
        console.log(user)
        const newUser = await model.petiguard.user.create(user)
        // console.log(newUser)
        res.status(201).json({status:201, message: 'User created successfully'});
    } catch (error) {
        console.log(error)
        let err = (error)
        res.status(500).json({ message: 'Server error', err });
    }
};

controller.registerOfficial = async (req, res) => {
    try {
        // const { sin_number, name, email, password, father_name, year, department, college, quota, role } = req.body;
        const official = req.body
        console.log(official)
        const hashedPassword = await bcrypt.hash(official.password, 10);
        // const newUser = await model.user.create({ sin_number, name, email, password:hashedPassword, father_name, year, department, college, quota, role });
        official.password = hashedPassword
        console.log(official)
        const newUser = await model.petiguard.official.create(official)
        // console.log(newUser)
        res.status(201).json({status:201, message: 'Official created successfully'});
    } catch (error) {
        console.log(error)
        let err = (error)
        res.status(500).json({ message: 'Server error', err });
    }
};


module.exports = controller