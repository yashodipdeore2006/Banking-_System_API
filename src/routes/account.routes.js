import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createAccount, getUserAccountsController, getAccountBalanceController, getAccountController } from '../controllers/account.controller.js';
//==================================
const router = express.Router();



//=========== Routes =================

/*
  POST /api/account

  Create a new account
  protected route
*/
router.post('/', authMiddleware, createAccount);


/**
 * - GET /api/accounts
 * - Get all the accounts of the logged-in user
 * - Protected route
 */
router.get('/', authMiddleware, getUserAccountsController);

/**
 * - GET /api/balance/:accountId
 */
router.get('/balance/:accountId', authMiddleware, getAccountBalanceController)



/**
 * - GET /api/accounts/:accountId
 */

router.get('/:accountId', authMiddleware, getAccountController);

//==================================
export default router;