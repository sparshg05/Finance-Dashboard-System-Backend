const prisma = require('../config/prisma');


//All dashboard queries are scoped to a single userId.

// ─── Helper
const round2 = (n) => Math.round((n ?? 0) * 100) / 100;

// Dashboard widgets are organization-wide for dashboard:read roles.
// Keep a fallback to user scope for any unknown role.
const getDashboardWhere = (user) => {
  const globalDashboardRoles = new Set(['ADMIN', 'ANALYST', 'VIEWER']);
  if (!user || globalDashboardRoles.has(user.role)) return {};
  return { userId: user.id };
};


//Uses two parallel aggregate queries (one per TransactionType) so the
//database can use the existing @@index([type]) index on both.
const getSummary = async (user) => {
  const where = getDashboardWhere(user);
  const [incomeAgg, expenseAgg, transactionCount] = await Promise.all([
    prisma.financialRecord.aggregate({
      where:  { ...where, type: 'INCOME' },
      _sum:   { amount: true },
      _count: { id: true },
    }),
    prisma.financialRecord.aggregate({
      where:  { ...where, type: 'EXPENSE' },
      _sum:   { amount: true },
      _count: { id: true },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  const totalIncome  = round2(incomeAgg._sum.amount);
  const totalExpense = round2(expenseAgg._sum.amount);
  const netBalance   = round2(totalIncome - totalExpense);

  return {
    totalIncome,
    totalExpense,
    netBalance,
    transactionCount,
    incomeCount:  incomeAgg._count.id,
    expenseCount: expenseAgg._count.id,
  };
};

// ─── getCategoryBreakdown ─────────────────────────────────────────────────────

/**
 * Returns per-category totals, split by INCOME and EXPENSE.
 *
 * Uses a single groupBy query (category + type) so one DB round-trip
 * gives us all four dimensions: category, type, sum, count.
 *
 * Response shape:
 * [
 *   { category: "Salary",  type: "INCOME",  total: 85000, count: 2 },
 *   { category: "Rent",    type: "EXPENSE", total: 2400,  count: 2 },
 *   ...
 * ]
 */
const getCategoryBreakdown = async (user) => {
  const where = getDashboardWhere(user);
  const rows = await prisma.financialRecord.groupBy({
    by:      ['category', 'type'],
    where,
    _sum:    { amount: true },
    _count:  { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  return rows.map((r) => ({
    category: r.category,
    type:     r.type,
    total:    round2(r._sum.amount),
    count:    r._count.id,
  }));
};



/**
 * Returns income and expense totals grouped by the requested period.
 *
 * Supported periods: 'monthly' (default), 'weekly', 'daily'
 *
 * Implementation note:
 *   Prisma groupBy does not support date truncation directly, so we use
 *   $queryRaw with parameterised placeholders to ask PostgreSQL to do the
 *   grouping in a single query with the DATE_TRUNC function.
 *   The userId is passed as a typed parameter — never string-interpolated —
 *   so there is no SQL injection risk.
 *
 * Response shape:
 * [
 *   { period: "2026-04", income: 85000, expense: 3600, net: 81400 },
 *   { period: "2026-03", income: 72000, expense: 4100, net: 67900 },
 *   ...
 * ]
 */
const getTrends = async (user, period = 'monthly') => {
  const VALID_PERIODS = { monthly: 'month', weekly: 'week', daily: 'day' };
  const truncUnit = VALID_PERIODS[period] || 'month';
  const where = getDashboardWhere(user);
  const hasUserScope = Boolean(where.userId);

  // FORMAT pattern for the period label returned to the client
  const FORMAT_MAP = { month: 'YYYY-MM', week: 'IYYY-IW', day: 'YYYY-MM-DD' };
  const fmt = FORMAT_MAP[truncUnit];

  const rows = hasUserScope
    ? await prisma.$queryRaw`
        SELECT
          TO_CHAR(bucket, ${fmt}) AS period,
          SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expense
        FROM (
          SELECT DATE_TRUNC(${truncUnit}, "date") AS bucket, type, amount
          FROM financial_records
          WHERE "userId" = ${where.userId}::uuid
        ) scoped_records
        GROUP BY bucket
        ORDER BY bucket DESC
        LIMIT 24
      `
    : await prisma.$queryRaw`
        SELECT
          TO_CHAR(bucket, ${fmt}) AS period,
          SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expense
        FROM (
          SELECT DATE_TRUNC(${truncUnit}, "date") AS bucket, type, amount
          FROM financial_records
        ) all_records
        GROUP BY bucket
        ORDER BY bucket DESC
        LIMIT 24
      `;

  return rows.map((r) => ({
    period:  r.period,
    income:  round2(Number(r.income)),
    expense: round2(Number(r.expense)),
    net:     round2(Number(r.income) - Number(r.expense)),
  }));
};



/**
 * Returns the N most recent transactions for the user (default 5).
 * The limit is capped at 20 to prevent accidental large payloads.
 */
const getRecentTransactions = async (user, limit = 5) => {
  const take = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));
  const where = getDashboardWhere(user);

  const records = await prisma.financialRecord.findMany({
    where,
    orderBy: { date: 'desc' },
    take,
    select: {
      id:        true,
      amount:    true,
      type:      true,
      category:  true,
      date:      true,
      notes:     true,
      createdAt: true,
    },
  });

  return records;
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getRecentTransactions,
};