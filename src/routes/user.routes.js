const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// All /users routes require a valid JWT
router.use(authenticate);

router.get('/me', userController.getMe);

module.exports = router;