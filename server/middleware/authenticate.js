// const jwt = require('jsonwebtoken');

// const authenticate = (req, res, next) => {
//     const token = req.header('Authorization')?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Access denied, no token provided' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(400).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authenticate;


const jwt = require('jsonwebtoken')

const config = require('../config/config')

const model = require('../models/index')

const isAuthenticated = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res
            .status(401)
            .json({
                status: 401,
                message: 'no auth token provided'
            })
    }

    try {
        const decoded = (jwt.verify(token, config.jwtSecret,{ expiresIn: "1h" }));

        const { email, role } = decoded.userPayload; // Extract role for user vs. official

        console.log("Authenticated Email:", email,role);
        
        if (role[0] === 'user') {
            // user = await model.petiguard.user.findOne({ where: { email } });
            await model.petiguard.user.findOne(
                { 
                    where: {
                        email
                    }
                }
            ).then((result) => {
                console.log(result)
                if (result.length == 0 ) {
                    return res
                       .status(401)
                       .json({
                            status: 401,
                            message: 'invalid token unauthorized user'
                        })
                } 
    
    
                console.log("Final::::::::::",result)
                req.user = result
                console.log("User:::::::::::",req.user)
                next()
            })
        } else if (role[0] === 'official') {
            await model.petiguard.official.findOne(
                { 
                    where: {
                        email
                    }
                }
            ).then((result) => {
                console.log(result)
                if (result.length == 0 ) {
                    return res
                       .status(401)
                       .json({
                            status: 401,
                            message: 'invalid token unauthorized user'
                        })
                } 
    
    
                console.log("Final::::::::::",result)
                req.official = result
                console.log("User:::::::::::",req.official)
                next()
            })
        }

        // // let email = decoded.userPayload.email
        // console.log("Email:::::::::::::",email);
        
    } catch(error) {
        return res
           .status(401)
           .json({
                status: 401,
                message: `invalid token ${error}`
            })
    }
}

module.exports = isAuthenticated