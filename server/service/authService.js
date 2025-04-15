const model = require('../models/index')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const { jwtSecret } = require('../config/config')

const service = {}


const generateToken = (userPayload) => {
    return jwt.sign(
        {userPayload}, 
        jwtSecret, 
        {
            expiresIn: '1h'
        })
}


service.loginService = async (email, password,verificationId) => {
        const user = await model.petiguard.user.scope('withPassword').findOne({
            where: {
                email,
                verificationId
            }
        })
        if ( !user ) {
            return {
                status: 401,
                message: 'user not registered',
                token: ""
            }
        }

        console.log(user)
        let comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return {
                status: 401,
                message: 'unauthorised user',
                token: ""
            }
        }
        return {
            status: 200,
            message: 'login success',
            token:  generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            }),
            user: {
                "id": user.id,
                "sin_no": user.sin_no,
                "name": user.name,
                "email": user.email,
                "department": user.department,
                "college": user.college,
                "role": user.role,
                "phone": user.phone,
                "photo": user.photo
            }
        }
}

service.officialLoginService = async (email, password,idProof,idProofNo) => {
    const official = await model.petiguard.official.scope('withPassword').findOne({
        where: {
            email,
            idProof,
            idProofNo
        }
    })
    if ( !official ) {
        return {
            status: 401,
            message: 'official not registered',
            token: ""
        }
    }

    console.log(official)
    let comparePassword = await bcrypt.compare(password, official.password)
    if (!comparePassword) {
        return {
            status: 401,
            message: 'unauthorised official',
            token: ""
        }
    }
    return {
        status: 200,
        message: 'login success',
        token:  generateToken({
            id: official.id,
            email: official.email,
            role: official.role
        }),
        official: {
            "id": official.id,
            "name": official.name,
            "email": official.email,
            "department": official.department,
            "college": official.college,
            "role": official.role,
            "phone": official.phone,
        }
    }
}




module.exports = service