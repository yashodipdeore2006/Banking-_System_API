import express from 'express';

//=== Local Modules ===
import { authMiddleware } from '../middleware/auth.middleware.js'

/**
 * - Create a new transaction
 * THE 10 STEP TRANSACTION FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from layer
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification

 */


export async function createTransaction(req, res) {
  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;



  } catch (error) {
    console.error(error);
    req.status(500).json({
      error: 'Something went wrong'
    });
  };
};