const express = require('express');
const routes = express.Router();

const controllers = require('../controllers/index')

const isAuthenticated = require('../middleware/authenticate');

routes.post('/register', controllers.auth.registerUser);
routes.post('/login', controllers.auth.loginUser);

routes.post('/official-register', controllers.auth.registerOfficial);
routes.post('/official-login', controllers.auth.loginOfficial);


routes.use(isAuthenticated);
routes.post('/petition', controllers.form.createPetition);
routes.get('/petition', controllers.form.getPetitions);
routes.post('/petition-status', controllers.form.getPetitionStatus);
// router.get('/my-forms', authenticateToken, getUserPetitions);
routes.get('/status', controllers.form.getUserPetitionStatus);
routes.get('/recent-activity',controllers.form.getRecentActivity);

routes.post('/send-mail',controllers.form.sendMail)

// Official Routes
routes.get('/assigned', controllers.form.getOfficialPetitions);
routes.put('/update-status', controllers.form.updatePetitionStatus);

// router.post('/bonafide', authController.submitBonafide);

module.exports = routes;