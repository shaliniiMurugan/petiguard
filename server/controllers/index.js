const authController = require('./authController')
const formController = require('./petitionerController');
// const noDueController = require('./noDueController');

const controllers = {}

controllers.auth = authController
controllers.form = formController;
// controllers.noDue = noDueController

module.exports = controllers