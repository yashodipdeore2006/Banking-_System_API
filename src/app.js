import express from 'express';
import cookieParser from 'cookie-parser';

//==== Local Module ===
import authRouter from './routes/auth.routes.js';
import accountRouter from './routes/account.routes.js';
import transactionRouter from './routes/transaction.routes.js';
import usersRouter from './routes/users.router.js';
import adminRouter from './routes/admin.routes.js'
import transactionRouter from './routes/transactionVerification.routes.js;'
import transactionVerificationRouter from './routes/transactionVerification.routes.js';
//===================================
const app = express()

app.use(express.json());
app.use(cookieParser());


//=========== Routes ====================
app.use("/api/auth", authRouter);

app.use("/api/accounts", accountRouter);

app.use('/api/transactions', transactionRouter);

app.use('/api/users', usersRouter);

app.use('/api/admin', adminRouter);

app.use('/api/transactions/verification', transactionVerificationRouter);

//===================================
export default app;