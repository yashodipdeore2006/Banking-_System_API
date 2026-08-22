import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createAccount } from '../controllers/account.controller.js';
//==================================
const router = express.Router();



//=========== Routes =================

/*
  POST /api/account

  Create a new account
  protected route
*/

router.post('/', authMiddleware, createAccount);





//==================================
export default router;