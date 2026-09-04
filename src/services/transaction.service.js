import mongoose from 'mongoose';

import transactionModel from '../models/transaction.model.js';
import ledgerModel from '../models/ledger.model.js';


export const completeTransaction = async (transactionId) => {

  // 1. Find transaction
  const transaction = await transactionModel
    .findById(transactionId)
    .populate('fromAccount')
    .populate('toAccount');

  if (!transaction) {
    throw new Error('Transaction not found');
  }


  // 2. Validate transaction status
  if (transaction.status !== 'PENDING') {
    throw new Error('Transaction cannot be completed');
  }


  const fromAccount = transaction.fromAccount;
  const toAccount = transaction.toAccount;
  const amount = transaction.amount;


  // 3. Validate accounts
  if (!fromAccount || !toAccount) {
    throw new Error('Account not found');
  }

  if (fromAccount.status !== 'ACTIVE') {
    throw new Error('Sender account is not active');
  }

  if (toAccount.status !== 'ACTIVE') {
    throw new Error('Receiver account is not active');
  }


  // 4. Check sender balance
  const balance = await fromAccount.getBalance();

  if (balance < amount) {
    throw new Error(
      `Insufficient balance. Current balance is: ${balance}. Requested amount is: ${amount}`
    );
  }


  // 5. Start MongoDB session
  const session = await mongoose.startSession();

  try {

    // 6. Start MongoDB transaction
    session.startTransaction();


    // 7. Create DEBIT ledger entry
    await ledgerModel.create([{
      account: fromAccount._id,
      amount,
      transaction: transaction._id,
      type: 'DEBIT'
    }], { session });


    // 8. Create CREDIT ledger entry
    await ledgerModel.create([{
      account: toAccount._id,
      amount,
      transaction: transaction._id,
      type: 'CREDIT'
    }], { session });


    // 9. Mark transaction as COMPLETED
    transaction.status = 'COMPLETED';


    // 10. Save transaction
    await transaction.save({ session });


    // 11. Commit MongoDB transaction
    await session.commitTransaction();


    // 12. Return completed transaction
    return transaction;

  } catch (error) {

    // Rollback DEBIT, CREDIT and transaction changes
    await session.abortTransaction();


    // Mark transaction as FAILED
    await transactionModel.findByIdAndUpdate(
      transactionId,
      { status: 'FAILED' }
    );


    // Pass error to controller
    throw error;

  } finally {

    // 13. Always close session
    await session.endSession();

  }
};