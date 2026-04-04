const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

/**
 * GET /users/me
 * Returns the authenticated user's profile.
 */
const getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  sendSuccess(res, 200, { user });
});

module.exports = { getMe };