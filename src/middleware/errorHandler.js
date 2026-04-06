const AppError = require('../utils/AppError');

// ─── Prisma error translators ─────────────────────────────────────────────────

const PRISMA_ERROR_MAP = {
  P2002: (err) => {
    const field = err.meta?.target?.[0] || 'field';
    return new AppError(`A record with this ${field} already exists.`, 409);
  },
  P2025: () => new AppError('The requested record was not found.', 404),
  P2003: (err) => {
    const field = err.meta?.field_name || 'field';
    return new AppError(`Foreign key constraint failed on field: ${field}.`, 400);
  },
  P2014: () => new AppError('The change violates a required relation.', 400),
  P2021: () => new AppError('Database table does not exist. Run prisma migrate.', 500),
};

const handlePrismaKnownError = (err) => {
  const handler = PRISMA_ERROR_MAP[err.code];
  return handler ? handler(err) : new AppError('Database error occurred.', 500);
};

const handlePrismaValidationError = () =>
  new AppError('Invalid data supplied to the database.', 400);

// ─── JWT error translators ────────────────────────────────────────────────────

const handleJWTError     = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpired   = () => new AppError('Your session has expired. Please log in again.', 401);

// ─── Response formatters ──────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status:  err.status,
    message: err.message,
    stack:   err.stack,
    error:   err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Trusted, user-facing error
    return res.status(err.statusCode).json({
      status:  err.status,
      message: err.message,
    });
  }

  // Unknown / programming error — never leak internals
  console.error('💥 UNEXPECTED ERROR:', err);
  return res.status(500).json({
    status:  'error',
    message: 'Something went wrong. Please try again later.',
  });
};

// ─── Main handler ─────────────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  err.statusCode = err.statusCode || 500;
  err.status     = err.status     || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  // Clone so we don't mutate the original
  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);

  if (err.name === 'PrismaClientKnownRequestError')  error = handlePrismaKnownError(err);
  if (err.name === 'PrismaClientValidationError')    error = handlePrismaValidationError();
  if (err.name === 'JsonWebTokenError')              error = handleJWTError();
  if (err.name === 'TokenExpiredError')              error = handleJWTExpired();

  // SyntaxError from express.json() on a malformed body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new AppError('Invalid JSON in request body.', 400);
  }

  sendErrorProd(error, res);
};

module.exports = errorHandler;