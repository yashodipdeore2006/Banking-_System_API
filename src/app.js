import express from 'express';
import cookieParser from 'cookie-parser';

//==== Local Module ===
import authRouter from './routes/auth.routes.js';
import accountRouter from './routes/account.routes.js';

//===================================
const app = express()

app.use(express.json());
app.use(cookieParser());


//=========== Routes ====================
app.use("/api/auth", authRouter);

app.use("/api/accounts", accountRouter);




//===================================
export default app;