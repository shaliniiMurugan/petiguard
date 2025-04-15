const express = require('express');
const routes = express.Router();

const controllers = require('../controllers/index')

const isAuthenticated = require('../middleware/authenticate');

routes.post('/register', controllers.auth.registerUser);
routes.post('/login', controllers.auth.loginUser);

routes.post('/official-register', controllers.auth.registerOfficial);
routes.post('/official-login', controllers.auth.loginOfficial);


// Admin
routes.put('/editUsers', controllers.admin.updateUser);
routes.delete('/deleteUsers', controllers.admin.deleteUser);
routes.get('/total', controllers.admin.getTotalStatus);
routes.get('/getAllUsers', controllers.admin.getAllUsers);
routes.put('/editOfficial', controllers.admin.updateOfficial);
routes.delete('/deleteOfficial', controllers.admin.deleteOfficial);
routes.get('/getAllOfficial', controllers.admin.getAllOfficial);
routes.get('/overview', controllers.admin.getOverview);
routes.get('/departments', controllers.admin.getDepartments);
routes.get('/trends', controllers.admin.getTrends);
routes.get('/priorities', controllers.admin.getPriorities);

// Petition management routes
routes.get('/petitions', controllers.admin.getAllPetitions);
routes.get('/petitions/:id', controllers.admin.getPetition);
routes.put('/petitions/:id', controllers.admin.updatePetition);

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


module.exports = routes;