const userService = require('../services/user.service');
const catchAsync  = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

/** GET /api/v1/users/me */
const getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  sendSuccess(res, 200, { user });
});

/** GET /api/v1/users  — ADMIN only */
const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  sendSuccess(res, 200, { users, count: users.length });
});

/** PUT /api/v1/users/:id/status  — ADMIN only */
const updateUserStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const user = await userService.updateUserStatus(req.params.id, status);
  sendSuccess(res, 200, { user }, 'User status updated successfully.');
});

/** DELETE /api/v1/users/:id  — ADMIN only */
const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);
  sendSuccess(res, 200, null, 'User deleted successfully.');
});

module.exports = { getMe, getAllUsers, updateUserStatus, deleteUser };