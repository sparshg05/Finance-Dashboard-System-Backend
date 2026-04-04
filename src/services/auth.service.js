const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const config = require('../config/env');

/**
 * Generates a signed JWT token containing userId and role.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Strips sensitive fields from a user object before sending to client.
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * Registers a new user.
 * Throws if email is already taken.
 */
const signup = async ({ email, password, role }) => {
  // Check for existing user manually for a clear error message
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const SALT_ROUNDS = 12;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role || 'VIEWER',
    },
  });

  const token = generateToken(user.id, user.role);

  return { user: sanitizeUser(user), token };
};

/**
 * Authenticates a user with email/password.
 * Throws if credentials are invalid or account is inactive.
 */
const login = async ({ email, password }) => {
  // Fetch user including password for comparison
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status === 'INACTIVE') {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  const token = generateToken(user.id, user.role);

  return { user: sanitizeUser(user), token };
};

module.exports = { signup, login };