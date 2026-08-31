import express from 'express';

//=== Local Module ====
import { authMiddleware, authSystemUserMiddleware } from '../middleware/auth.middleware.js';
import { createTransaction, createInitialFundsTransaction, getTransactionHistory } from '../controllers/transaction.controller.js'
import transactionModel from '../models/transaction.model.js';

const router = express.Router();

//=================== Controller ===================

// Create Transaction
// POST /api/transactions/
router.post('/', authMiddleware, createTransaction);


// Create initial funds
// POST /api/transactions/system/initial-funds
router.post('/system/initial-funds', authSystemUserMiddleware, createInitialFundsTransaction);

// Get transaction history
// GET /api/transactions
router.get('/', authMiddleware, getTransactionHistory);


//==================================================
export default router;