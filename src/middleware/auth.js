const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/env');

const authenticate = catchAsync(async (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify token
  const decoded = jwt.verify(token, config.jwt.secret);

  // 3. Check if user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (user.status === 'INACTIVE') {
    return next(new AppError('Your account has been deactivated. Contact support.', 403));
  }

  // 4. Attach user to request object
  req.user = user;
  next();
});

/**
 * Role-based access control middleware factory.
 * Usage: authorize('ADMIN', 'ANALYST')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };