const transactionService = require('../services/transaction.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');


//Creates a new financial record for the authenticated user. 
const createTransaction = catchAsync(async (req, res) => {
  const record = await transactionService.createTransaction(req.user.id, req.body);
  sendSuccess(res, 201, { transaction: record }, 'Transaction created successfully.');
});


//Returns paginated + filtered list of the user's financial records.
//Query params: type, category, startDate, endDate, page, limit
const getTransactions = catchAsync(async (req, res) => {
  const result = await transactionService.getTransactions(req.user.id, req.query);
  sendSuccess(res, 200, result);
});


//Returns a single financial record by id.
const getTransactionById = catchAsync(async (req, res) => {
  const record = await transactionService.getTransactionById(req.user.id, req.params.id);
  sendSuccess(res, 200, { transaction: record });
});


//Partially updates a financial record (only supplied fields are changed).
const updateTransaction = catchAsync(async (req, res) => {
  const record = await transactionService.updateTransaction(
    req.user.id,
    req.params.id,
    req.body
  );
  sendSuccess(res, 200, { transaction: record }, 'Transaction updated successfully.');
});


//Deletes a financial record.
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