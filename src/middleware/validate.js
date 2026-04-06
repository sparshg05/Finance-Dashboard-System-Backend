/**
 * Validation middleware factory.
 *
 * Accepts a schema object whose keys map to validation functions:
 *   { fieldName: (value, body) => errorMessage | null }
 *
 * Returns a middleware that runs all validators against req.body and
 * short-circuits with a structured 422 response if any fail:
 *
 *   {
 *     "error": "Validation error",
 *     "details": [
 *       { "field": "email",    "message": "must be a valid email address." },
 *       { "field": "password", "message": "must be at least 8 characters." }
 *     ]
 *   }
 *
 * Usage:
 *   router.post('/signup', validate(signupSchema), authController.signup)
 */
const validate = (schema) => {
    return (req, res, next) => {
      const details = [];
  
      for (const [field, validator] of Object.entries(schema)) {
        const value = req.body[field];
        const error = validator(value, req.body);
        if (error) {
          details.push({ field, message: error });
        }
      }
  
      if (details.length > 0) {
        return res.status(422).json({
          error: 'Validation error',
          details,
        });
      }
  
      next();
    };
  };
  
  // ─── Reusable validator helpers ──────────────────────────────────────────────
  
  const isString      = (v) => typeof v === 'string';
  const isNonEmpty    = (v) => isString(v) && v.trim().length > 0;
  const isNumber      = (v) => typeof v === 'number' && !isNaN(v);
  const isValidDate   = (v) => !isNaN(new Date(v).getTime());
  const EMAIL_RE      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // ─── Auth schemas ─────────────────────────────────────────────────────────────
  
  const signupSchema = {
    email: (v) => {
      if (!isNonEmpty(v))        return 'email is required.';
      if (!EMAIL_RE.test(v.trim())) return 'email must be a valid email address.';
      return null;
    },
    password: (v) => {
      if (!isNonEmpty(v))        return 'password is required.';
      if (v.trim().length < 8)   return 'password must be at least 8 characters.';
      if (!/[A-Z]/.test(v))      return 'password must contain at least one uppercase letter.';
      if (!/[0-9]/.test(v))      return 'password must contain at least one number.';
      return null;
    },
    role: (v) => {
      if (v === undefined || v === null || v === '') return null; // optional
      const valid = ['ADMIN', 'ANALYST', 'VIEWER'];
      if (!valid.includes(String(v).toUpperCase())) {
        return `role must be one of: ${valid.join(', ')}.`;
      }
      return null;
    },
  };
  
  const loginSchema = {
    email: (v) => {
      if (!isNonEmpty(v))           return 'email is required.';
      if (!EMAIL_RE.test(v.trim())) return 'email must be a valid email address.';
      return null;
    },
    password: (v) => {
      if (!isNonEmpty(v)) return 'password is required.';
      return null;
    },
  };
  
  // ─── Transaction schemas ──────────────────────────────────────────────────────
  
  const createTransactionSchema = {
    amount: (v) => {
      if (v === undefined || v === null) return 'amount is required.';
      if (!isNumber(v))                  return 'amount must be a number.';
      if (v <= 0)                        return 'amount must be greater than 0.';
      return null;
    },
    type: (v) => {
      if (!isNonEmpty(v))                        return 'type is required.';
      const valid = ['INCOME', 'EXPENSE'];
      if (!valid.includes(v.toUpperCase()))       return `type must be one of: ${valid.join(', ')}.`;
      return null;
    },
    category: (v) => {
      if (!isNonEmpty(v))                return 'category is required.';
      if (v.trim().length > 100)         return 'category must be 100 characters or fewer.';
      return null;
    },
    date: (v) => {
      if (!isNonEmpty(v))     return 'date is required.';
      if (!isValidDate(v))    return 'date must be a valid ISO 8601 date string (e.g. 2026-04-01).';
      return null;
    },
    notes: (v) => {
      if (v === undefined || v === null || v === '') return null; // optional
      if (!isString(v))          return 'notes must be a string.';
      if (v.length > 500)        return 'notes must be 500 characters or fewer.';
      return null;
    },
  };
  
  /**
   * For updates, every field is optional — only validate fields that are present.
   */
  const updateTransactionSchema = {
    amount: (v) => {
      if (v === undefined) return null;
      if (!isNumber(v))    return 'amount must be a number.';
      if (v <= 0)          return 'amount must be greater than 0.';
      return null;
    },
    type: (v) => {
      if (v === undefined) return null;
      const valid = ['INCOME', 'EXPENSE'];
      if (!isNonEmpty(v) || !valid.includes(v.toUpperCase())) {
        return `type must be one of: ${valid.join(', ')}.`;
      }
      return null;
    },
    category: (v) => {
      if (v === undefined)       return null;
      if (!isNonEmpty(v))        return 'category must be a non-empty string.';
      if (v.trim().length > 100) return 'category must be 100 characters or fewer.';
      return null;
    },
    date: (v) => {
      if (v === undefined)   return null;
      if (!isValidDate(v))   return 'date must be a valid ISO 8601 date string (e.g. 2026-04-01).';
      return null;
    },
    notes: (v) => {
      if (v === undefined || v === null || v === '') return null;
      if (!isString(v))    return 'notes must be a string.';
      if (v.length > 500)  return 'notes must be 500 characters or fewer.';
      return null;
    },
  };
  
  module.exports = {
    validate,
    signupSchema,
    loginSchema,
    createTransactionSchema,
    updateTransactionSchema,
  };