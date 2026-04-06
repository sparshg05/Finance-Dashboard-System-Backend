const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const SAFE_USER_SELECT = {
  id: true, email: true, role: true, status: true, createdAt: true,
};

/**
 * Returns the authenticated user's own profile.
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: SAFE_USER_SELECT,
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Returns all users (ADMIN only).
 * Supports optional ?status=ACTIVE|INACTIVE and ?role=ADMIN|ANALYST|VIEWER filters.
 */
const getAllUsers = async (query = {}) => {
  const { status, role } = query;
  const where = {};
  if (status) where.status = status.toUpperCase();
  if (role)   where.role   = role.toUpperCase();

  const users = await prisma.user.findMany({
    where,
    select:  SAFE_USER_SELECT,
    orderBy: { createdAt: 'desc' },
  });
  return users;
};

/**
 * Activates or deactivates a user account (ADMIN only).
 */
const updateUserStatus = async (targetId, status) => {
  const valid = ['ACTIVE', 'INACTIVE'];
  if (!valid.includes(status?.toUpperCase())) {
    throw new AppError(`status must be one of: ${valid.join(', ')}.`, 400);
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new AppError('User not found.', 404);

  const updated = await prisma.user.update({
    where:  { id: targetId },
    data:   { status: status.toUpperCase() },
    select: SAFE_USER_SELECT,
  });
  return updated;
};

/**
 * Permanently deletes a user and all their financial records (ADMIN only).
 * Cascade is handled by the DB via onDelete: Cascade on FinancialRecord.
 */
const deleteUser = async (targetId, requestingUserId) => {
  if (targetId === requestingUserId) {
    throw new AppError('You cannot delete your own account.', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new AppError('User not found.', 404);

  await prisma.user.delete({ where: { id: targetId } });
};

module.exports = { getMe, getAllUsers, updateUserStatus, deleteUser };