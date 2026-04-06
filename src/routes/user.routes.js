const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const roleMiddleware   = require('../middleware/roleMiddleware');

const router = Router();

router.use(authenticate);

// Any authenticated user can read their own profile
router.get('/me', userController.getMe);

// Only ADMINs can list or manage other users
router.get(
  '/',
  roleMiddleware('users:read'),
  userController.getAllUsers
);

router.put(
  '/:id/status',
  roleMiddleware('users:update'),
  userController.updateUserStatus
);

router.delete(
  '/:id',
  roleMiddleware('users:delete'),
  userController.deleteUser
);

module.exports = router;