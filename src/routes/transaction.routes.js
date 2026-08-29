import express from 'express';

//=== Local Module ====
import { authMiddleware, authSystemUserMiddleware } from '../middleware/auth.middleware.js';
import { createTransaction, createInitialFundsTransaction } from '../controllers/transaction.controller.js'
import transactionModel from '../models/transaction.model.js';

const router = express.Router();

//=================== Controller ===================

// Create Transaction
// POST /api/accounts/
router.post('/', authMiddleware, createTransaction);


// Create initial funds
// POST /api/transactions/system/initial-funds
router.post('/system/initial-funds', authSystemUserMiddleware, createInitialFundsTransaction);



//==================================================
export default router;