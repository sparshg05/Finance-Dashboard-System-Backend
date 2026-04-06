const authService = require('../services/auth.service');
const catchAsync  = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');


//POST /api/v1/auth/signup
const signup = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const { user, token } = await authService.signup({ email, password, role });
  sendSuccess(res, 201, { user, token }, 'Account created successfully.');
});


//POST /api/v1/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });
  sendSuccess(res, 200, { user, token }, 'Logged in successfully.');
});

module.exports = { signup, login };