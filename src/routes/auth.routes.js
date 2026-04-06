const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { validate, signupSchema, loginSchema } = require('../middleware/validate');

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login',  validate(loginSchema),  authController.login);

module.exports = router;