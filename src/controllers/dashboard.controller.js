const dashboardService = require('../services/dashboard.service');
const catchAsync       = require('../utils/catchAsync');
const AppError         = require('../utils/AppError');


const sendDashboard = (res, data) =>
  res.status(200).json({ success: true, data });

// ─── GET /api/v1/dashboard/summary
//Returns totalIncome, totalExpense, netBalance and counts.
const getSummary = catchAsync(async (req, res) => {
  const data = await dashboardService.getSummary(req.user);
  sendDashboard(res, data);
});

// ─── GET /api/v1/dashboard/category-breakdown 
//Returns per-category totals split by type (INCOME / EXPENSE).
const getCategoryBreakdown = catchAsync(async (req, res) => {
  const data = await dashboardService.getCategoryBreakdown(req.user);
  sendDashboard(res, { breakdown: data });
});

// ─── GET /api/v1/dashboard/trends
//Returns income vs expense grouped by period.
//Query param: period = monthly (default) | weekly | daily
const getTrends = catchAsync(async (req, res) => {
  const { period = 'monthly' } = req.query;
  const VALID = ['monthly', 'weekly', 'daily'];

  if (!VALID.includes(period)) {
    throw new AppError(
      `Invalid period. Must be one of: ${VALID.join(', ')}.`,
      400
    );
  }

  const data = await dashboardService.getTrends(req.user, period);
  sendDashboard(res, { period, trends: data });
});


// ─── GET /api/v1/dashboard/recent
//Returns the N most-recent transactions.
//Query param: limit = 1–20 (default 5)
const getRecentTransactions = catchAsync(async (req, res) => {
  const { limit = 5 } = req.query;
  const data = await dashboardService.getRecentTransactions(req.user, limit);
  sendDashboard(res, { transactions: data, count: data.length });
});

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getRecentTransactions,
};