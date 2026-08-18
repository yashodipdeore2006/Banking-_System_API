import express from "express";


//==== LocalModules ===
import { registerUser } from '../controllers/auth.controller.js';

//===================================
const router = express.Router();


//========= Routes =================

// POST /api/auth/register
router.post('/register', registerUser);



//===================================
export default router;