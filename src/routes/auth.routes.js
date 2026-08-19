import express from "express";


//==== LocalModules ===
import { registerUserController, loginUserController } from '../controllers/auth.controller.js';

//===================================
const router = express.Router();


//========= Routes =================

// POST /api/auth/register
router.post('/register', registerUserController);


//POST /api/auth/login
router.post('/login', loginUserController);


//===================================
export default router;