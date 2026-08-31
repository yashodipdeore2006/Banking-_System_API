import express from "express";
import { getCurrentUserController } from '../controllers/users.controller.js'
import { authMiddleware } from "../middleware/auth.middleware.js";
//==== LocalModules ===


//===================================
const router = express.Router();


//========= Routes =================


//GET /api/users/me
router.get('/me', authMiddleware, getCurrentUserController);



//===================================
export default router;