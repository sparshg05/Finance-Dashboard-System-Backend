const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticate }      = require('../middleware/auth');
const roleMiddleware         = require('../middleware/roleMiddleware');
const {
  validate,
  createTransactionSchema,
  updateTransactionSchema,
} = require('../middleware/validate');

const router = Router();

// Every transaction route requires a valid JWT
router.use(authenticate);


// ── Read (ANALYST + ADMIN) ────────────────────────────────────────────────────
router.get(
  '/',
  roleMiddleware('transactions:read'),
  transactionController.getTransactions
);

router.get(
  '/:id',
  roleMiddleware('transactions:read'),
  transactionController.getTransactionById
);

// ── Write (ADMIN only) ────────────────────────────────────────────────────────
router.post(
  '/',
  roleMiddleware('transactions:create'),
  validate(createTransactionSchema),
  transactionController.createTransaction
);

router.put(
  '/:id',
  roleMiddleware('transactions:update'),
  validate(updateTransactionSchema),
  transactionController.updateTransaction
);

router.delete(
  '/:id',
  roleMiddleware('transactions:delete'),
  transactionController.deleteTransaction
);

module.exports = router;