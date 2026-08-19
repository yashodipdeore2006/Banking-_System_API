import express from "express";


//==== LocalModules ===
import { registerUserController } from '../controllers/auth.controller.js';

//===================================
const router = express.Router();


//========= Routes =================

// POST /api/auth/register
router.post('/register', registerUserController);



//===================================
export default router;