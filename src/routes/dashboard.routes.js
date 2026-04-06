const { Router }            = require('express');
const dashboardController   = require('../controllers/dashboard.controller');
const { authenticate }      = require('../middleware/auth');
const roleMiddleware         = require('../middleware/roleMiddleware');

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// All three roles have 'dashboard:read' permission — see src/config/roles.js
router.use(roleMiddleware('dashboard:read'));


//Route chain: authenticate → roleMiddleware('dashboard:read') → controller
router.get('/summary',            dashboardController.getSummary);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/trends',             dashboardController.getTrends);
router.get('/recent',             dashboardController.getRecentTransactions);

module.exports = router;