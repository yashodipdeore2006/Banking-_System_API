import express from 'express';

//=== Local Module ====
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createTransaction } from '../controllers/transaction.controller.js'

const router = express.Router();

//============ Controller ===================


router.post('/', authMiddleware, createTransaction);




//==================================
export default router;