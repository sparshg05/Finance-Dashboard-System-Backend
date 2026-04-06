const AppError = require('../utils/AppError');
const { hasPermission } = require('../config/roles');

/**
 * Role-based access control middleware factory.
 *
 * Two calling conventions are supported:
 *
 *   1. Role-based  — pass one or more role strings:
 *        roleMiddleware('ADMIN')
 *        roleMiddleware('ADMIN', 'ANALYST')
 *
 *   2. Permission-based — pass a single permission action string:
 *        roleMiddleware('transactions:read')
 *        roleMiddleware('users:delete')
 *
 * The middleware must run AFTER authenticate so that req.user is populated.
 *
 * Usage in routes:
 *   router.get('/', authenticate, roleMiddleware('ANALYST', 'ADMIN'), controller)
 *   router.post('/', authenticate, roleMiddleware('transactions:create'), controller)
 */
const roleMiddleware = (...allowedRolesOrPermissions) => {
  if (allowedRolesOrPermissions.length === 0) {
    throw new Error('roleMiddleware requires at least one role or permission argument.');
  }

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }

    const { role } = req.user;
    const [first] = allowedRolesOrPermissions;

    // ── Permission-based check (argument contains ':')
    if (first.includes(':')) {
      const permission = first; // single permission string
      if (!hasPermission(role, permission)) {
        return next(
          new AppError(
            `Access denied. Your role (${role}) does not have the '${permission}' permission.`,
            403
          )
        );
      }
      return next();
    }

    // ── Role-based check (plain role names) 
    const allowedRoles = allowedRolesOrPermissions.map((r) => r.toUpperCase());
    if (!allowedRoles.includes(role)) {
      return next(
        new AppError(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleMiddleware;