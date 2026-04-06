
//PERMISSIONS: maps each role to the explicit set of actions it may perform.
             //Actions follow the pattern  "resource:operation".
 /**
 * Any middleware, service, or test that needs to reason about roles or
 * permissions should import from here — never hard-code strings elsewhere.
 */

const ROLES = Object.freeze({
    ADMIN:   'ADMIN',
    ANALYST: 'ANALYST',
    VIEWER:  'VIEWER',
  });
  
  const PERMISSIONS = Object.freeze({
    // ── ADMIN - full access
    [ROLES.ADMIN]: [
      'dashboard:read',
      'transactions:create',
      'transactions:read',
      'transactions:update',
      'transactions:delete',
      'users:read',
      'users:update',
      'users:delete',
    ],
  
    // ── ANALYST ─ read-only on transactions + dashboard 
    [ROLES.ANALYST]: [
      'dashboard:read',
      'transactions:read',
    ],
  
    // ── VIEWER ── dashboard only ────────────────────────────────────────────────
    [ROLES.VIEWER]: [
      'dashboard:read',
    ],
  });
  
  /**
   * Returns true if the given role holds the given permission.
   *
   * @param {string} role       - e.g. 'ADMIN'
   * @param {string} permission - e.g. 'transactions:read'
   */
  const hasPermission = (role, permission) => {
    return (PERMISSIONS[role] || []).includes(permission);
  };
  
  module.exports = { ROLES, PERMISSIONS, hasPermission };