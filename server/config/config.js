require('dotenv').config()

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    jwtSecret: process.env.JWT_SECRET,
    email: process.env.EMAIL,
    appPassword: process.env.PASSWORD,
    qrCodeIP: process.env.QRCODE_IP
}

module.exports = config