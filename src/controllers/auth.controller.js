const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

/**
 * POST /auth/signup
 * Creates a new user account.
 */
const signup = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    // Handled cleanly by AppError in service, but guard here for clarity
    return res.status(400).json({
      status: 'fail',
      message: 'Email and password are required.',
    });
  }

  const { user, token } = await authService.signup({ email, password, role });

  sendSuccess(res, 201, { user, token }, 'Account created successfully.');
});

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT token.
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email and password are required.',
    });
  }

  const { user, token } = await authService.login({ email, password });

  sendSuccess(res, 200, { user, token }, 'Logged in successfully.');
});

module.exports = { signup, login };