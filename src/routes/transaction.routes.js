const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// All transaction routes require a valid JWT
router.use(authenticate);

router.post('/',     transactionController.createTransaction);
router.get('/',      transactionController.getTransactions);
router.get('/:id',   transactionController.getTransactionById);
router.put('/:id',   transactionController.updateTransaction);
router.delete('/:id',transactionController.deleteTransaction);

module.exports = router;