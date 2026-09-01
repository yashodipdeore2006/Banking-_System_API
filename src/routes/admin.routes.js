import express from 'express';

//======== Local modules ======
import { authSystemUserMiddleware } from '../middleware/auth.middleware.js';
import { getAdminDashboardController } from '../controllers/adminController.js';



//================================================
const router = express.Router();



//================== Routers =======================

// GET /api/admin/dashboard
router.get('/dashboard', authSystemUserMiddleware, getAdminDashboardController);




//================================================
export default router;