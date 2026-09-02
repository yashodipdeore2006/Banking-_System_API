import express from 'express';

//=== Local Module ====
import { authMiddleware } from '../middleware/auth.middleware.js';
import { verifyTransactionController } from "../controllers/transactionVerification.controller.js";

const router = express.Router();

//=================== Controller ===================

router.post(
  '/:transactionId',
  authMiddleware,
  verifyTransactionController
);



//==================================================
export default router;