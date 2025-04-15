// ftxw shpr hapi scwz 

var nodemailer = require('nodemailer');

const fs = require('fs')

const config = require('../../config/config');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email,
        pass: config.appPassword

        // user: 'venuvk0304@gmail.com',
        // pass: 'ftxw shpr hapi scwz'
    }
})

const sendMail = async (pdfBuffer, name, email, cc, body, subject) => {

    var mailOptions = {
        from: config.email,
        to: email,
        subject: subject,
        html: body,
        attachments: [],
        cc: cc
    }

    if (pdfBuffer != "") {
        mailOptions.attachments.push({
            filename: name,
            content: pdfBuffer
        })
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error)
            throw error
        } else {
            console.log('Email sent: ' + info.response)
            return {
                status: 200,
                message: 'Email sent successfully'
            }
        }
    })
}

module.exports = { sendMail };