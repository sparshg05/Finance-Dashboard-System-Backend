const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

// Valid enum values — used for validation
const VALID_TYPES = ['INCOME', 'EXPENSE'];


//Validates and normalises the fields for create / update.
const validateFields = ({ amount, type, category, date }, requireAll = true) => {
  const errors = [];

  if (requireAll || amount !== undefined) {
    if (amount === undefined || amount === null) {
      errors.push('amount is required.');
    } else if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      errors.push('amount must be a positive number.');
    }
  }

  if (requireAll || type !== undefined) {
    if (!type) {
      errors.push('type is required.');
    } else if (!VALID_TYPES.includes(type.toUpperCase())) {
      errors.push(`type must be one of: ${VALID_TYPES.join(', ')}.`);
    }
  }

  if (requireAll || category !== undefined) {
    if (!category || typeof category !== 'string' || !category.trim()) {
      errors.push('category is required and must be a non-empty string.');
    }
  }

  if (requireAll || date !== undefined) {
    if (!date) {
      errors.push('date is required.');
    } else {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        errors.push('date must be a valid ISO 8601 date string.');
      }
    }
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }
};


//Creates a new financial record owned by the authenticated user.
const createTransaction = async (userId, body) => {
  const { amount, type, category, date, notes } = body;

  validateFields({ amount, type, category, date }, true);

  const record = await prisma.financialRecord.create({
    data: {
      userId,
      amount,
      type: type.toUpperCase(),
      category: category.trim(),
      date: new Date(date),
      notes: notes?.trim() || null,
    },
  });

  return record;
};


//Returns a paginated, filtered list of financial records for the user.
const getTransactions = async (userId, query) => {
  const {
    type,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = query;

  // ── Build dynamic where clause ──────────────────────────────────────────────
  const where = { userId };

  if (type) {
    const t = type.toUpperCase();
    if (!VALID_TYPES.includes(t)) {
      throw new AppError(`type filter must be one of: ${VALID_TYPES.join(', ')}.`, 400);
    }
    where.type = t;
  }

  if (category) {
    where.category = { equals: category.trim(), mode: 'insensitive' };
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      const sd = new Date(startDate);
      if (isNaN(sd.getTime())) throw new AppError('startDate must be a valid date.', 400);
      where.date.gte = sd;
    }
    if (endDate) {
      const ed = new Date(endDate);
      if (isNaN(ed.getTime())) throw new AppError('endDate must be a valid date.', 400);
      // Include the full end day
      ed.setHours(23, 59, 59, 999);
      where.date.lte = ed;
    }
  }

  // ── Pagination maths ────────────────────────────────────────────────────────
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // ── Run count + data queries in parallel ────────────────────────────────────
  const [total, records] = await Promise.all([
    prisma.financialRecord.count({ where }),
    prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limitNum,
    }),
  ]);

  return {
    data: records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1,
    },
  };
};


//Returns a single financial record by id.
const getTransactionById = async (userId, recordId) => {
  const record = await prisma.financialRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    throw new AppError('Transaction not found.', 404);
  }

  if (record.userId !== userId) {
    throw new AppError('You do not have permission to access this transaction.', 403);
  }

  return record;
};


//Updates an existing financial record.
const updateTransaction = async (userId, recordId, body) => {
  // Ownership check first
  await getTransactionById(userId, recordId);

  const { amount, type, category, date, notes } = body;

  // Validate only the fields that were sent
  validateFields({ amount, type, category, date }, false);

  const updateData = {};
  if (amount !== undefined)   updateData.amount   = amount;
  if (type !== undefined)     updateData.type     = type.toUpperCase();
  if (category !== undefined) updateData.category = category.trim();
  if (date !== undefined)     updateData.date     = new Date(date);
  if (notes !== undefined)    updateData.notes    = notes?.trim() || null;

  const updated = await prisma.financialRecord.update({
    where: { id: recordId },
    data: updateData,
  });

  return updated;
};


//Deletes a financial record.
const deleteTransaction = async (userId, recordId) => {
  // Ownership check
  await getTransactionById(userId, recordId);

  await prisma.financialRecord.delete({ where: { id: recordId } });
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};