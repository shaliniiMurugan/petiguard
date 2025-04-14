const authService = require('./authService')
// const userService = require('./userService')

const services = {}

services.auth = authService
// services.user = userService

module.exports = services;