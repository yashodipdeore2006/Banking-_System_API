import express from "express";


//==== LocalModules ===
import { registerUserController, loginUserController, logoutController } from '../controllers/auth.controller.js';

//===================================
const router = express.Router();


//========= Routes =================

// POST /api/auth/register
router.post('/register', registerUserController);


//POST /api/auth/login
router.post('/login', loginUserController);


//POST /api/auth/logout
router.post('/logout', logoutController);

//===================================
export default router;