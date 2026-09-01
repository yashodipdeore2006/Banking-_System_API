import express from 'express';

//======== Local modules ======
import { authSystemUserMiddleware } from '../middleware/auth.middleware.js';
import { getAdminDashboardController, getUsersController, updateAccountStatusController } from '../controllers/adminController.js';



//================================================
const router = express.Router();



//================== Routers =======================

// GET /api/admin/dashboard
router.get('/dashboard', authSystemUserMiddleware, getAdminDashboardController);


// GET /api/admin/users
router.get(
  '/users', authSystemUserMiddleware,
  getUsersController
);


//PATCH '/accounts/: accountId / status /: status'
router.patch(
  '/accounts/:accountId/status/:status', authSystemUserMiddleware,
  updateAccountStatusController
);


//================================================
export default router;