const transactionService = require('../services/transaction.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

/**
 * POST /api/v1/transactions
 * Creates a new financial record for the authenticated user.
 */
const createTransaction = catchAsync(async (req, res) => {
  const record = await transactionService.createTransaction(req.user.id, req.body);
  sendSuccess(res, 201, { transaction: record }, 'Transaction created successfully.');
});

/**
 * GET /api/v1/transactions
 * Returns paginated + filtered list of the user's financial records.
 *
 * Query params: type, category, startDate, endDate, page, limit
 */
const getTransactions = catchAsync(async (req, res) => {
  const result = await transactionService.getTransactions(req.user.id, req.query);
  sendSuccess(res, 200, result);
});

/**
 * GET /api/v1/transactions/:id
 * Returns a single financial record by id.
 */
const getTransactionById = catchAsync(async (req, res) => {
  const record = await transactionService.getTransactionById(req.user.id, req.params.id);
  sendSuccess(res, 200, { transaction: record });
});

/**
 * PUT /api/v1/transactions/:id
 * Partially updates a financial record (only supplied fields are changed).
 */
const updateTransaction = catchAsync(async (req, res) => {
  const record = await transactionService.updateTransaction(
    req.user.id,
    req.params.id,
    req.body
  );
  sendSuccess(res, 200, { transaction: record }, 'Transaction updated successfully.');
});

/**
 * DELETE /api/v1/transactions/:id
 * Deletes a financial record.
 */
const deleteTransaction = catchAsync(async (req, res) => {
  await transactionService.deleteTransaction(req.user.id, req.params.id);
  sendSuccess(res, 200, null, 'Transaction deleted successfully.');
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};