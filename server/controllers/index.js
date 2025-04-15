const authController = require('./authController')
const formController = require('./petitionerController');
const adminController = require('./adminController');

const controllers = {}

controllers.auth = authController
controllers.form = formController;
controllers.admin = adminController

module.exports = controllers