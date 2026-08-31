import express, { json } from 'express';
import mongoose from 'mongoose';

//=== Local Modules ===
import accountModel from '../models/account.model.js';
import ledgerModel from '../models/ledger.model.js';
import transactionModel from '../models/transaction.model.js';
import { sendTransactionEmail } from '../services/mail.service.js';


/**
 * - Create a new transaction
 * THE 10 STEP TRANSACTION FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from layer
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */



export async function createTransaction(req, res) {
  try {

    /**
     * 1. ========== Request Validation ===============
     */

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    //Error if one of these (fromAccount, toAccount, amount, idempotencyKey) fields is not provided 
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "fromAccount, toAccount, amount &  are required"
      });
    };


    //Searching "fromAccount" user in accountModel
    const fromUserAccount = await accountModel.findOne({ _id: fromAccount });

    //Searching "toAccount" user in accountModel
    const toUserAccount = await accountModel.findOne({ _id: toAccount });

    //Error if "fromUserAccount" or "toUserAccount" does not exists
    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount"
      });
    };



    /**
     *=============  2. "idempotencyKey" Validation ===============
     */

    //
    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey: idempotencyKey });


    //Response depending on the status of the transaction (COMPLETED, PENDING, FAILED, REVERSED)
    if (isTransactionAlreadyExists) {
      if (isTransactionAlreadyExists.status === 'COMPLETED') {
        return res.status(200).json({
          message: 'Transaction already processed',
          transaction: isTransactionAlreadyExists
        });
      };


      if (isTransactionAlreadyExists.status === 'PENDING') {
        return res.status(200).json({
          message: 'Transaction is still processing'
        });
      };


      if (isTransactionAlreadyExists.status === 'FAILED') {
        return res.status(200).json({
          message: 'Transaction processing failed, please try again'
        });
      };

      if (isTransactionAlreadyExists.status === 'REVERSED') {
        return res.status(200).json({
          message: 'Transaction processing failed, please try again'
        });
      };
    };


    /**======================================================
     * 3. Check account status ('ACTIVE', 'FROZEN', 'CLOSED')
     * ======================================================
     */

    if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
      return res.status(400).json({
        message: 'Both fromAccount and toAccount must be ACTIVE  to process transaction'
      });
    };


    /**======================================================
     * 4. Derive sender balance from ledger
     * ======================================================     */

    //Getting the total balance of fromUser
    const balance = await fromUserAccount.getBalance();

    //Error if amount is more than account balance
    if (balance < amount) {
      return res.status(400).json(
        {
          message: `Insufficient balance. current balance is : ${balance}. Requested amount is : ${amount}`
        }
      );
    };



    /**
     * 5. ========= Creating Transaction ===========
    */

    let transaction;
    try {
      //Creating/starting transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      //Creating transaction entry
      const [createdTransaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING'
      }], { session });

      transaction = createdTransaction;

      //Deducting amount from senders account
      const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: 'DEBIT'
      }], { session });


      //Wait for 100 sec to send money to receiver
      await (() => {
        return new Promise((resolve) => setTimeout(resolve, 8 * 1000));
      })();

      //Adding amount to receivers account
      const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: 'CREDIT'
      }], { session });


      //Changing transaction status to "COMPLETED"
      transaction.status = 'COMPLETED';

      //Saving transaction
      await transaction.save({ session });


      //Commit transaction to DB
      await session.commitTransaction();

      //Ending transaction
      session.endSession();



    } catch (error) {
      await transactionModel.findOneAndUpdate(
        { idempotencyKey: idempotencyKey },
        { status: 'FAILED' }
      );

      return res.status(500).json({
        message: 'Transaction failed due to internal error',
        error: error.message
      });
    }



    /**
     * 10. ====== Send email notification ======
    */
    await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

    // Sending response
    res.status(201).json({
      message: "Transaction completed successfully",
      transaction: transaction
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Something went wrong'
    });
  };
};




export async function createInitialFundsTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    // Error if one of the required fields is missing
    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: 'toAccount, amount and idempotencyKey are required'
      });
    }

    // Find the user's account
    const toUserAccount = await accountModel.findOne({
      _id: toAccount
    });

    // Error if user's account is not found
    if (!toUserAccount) {
      return res.status(400).json({
        message: 'Invalid toAccount'
      });
    }

    // -----------------------------------------
    // Find system/from account
    // -----------------------------------------

    const fromUserAccount = await accountModel.findOne({
      user: req.user
    });

    if (!fromUserAccount) {
      return res.status(400).json({
        message: 'System account not found'
      });
    }

    // -----------------------------------------
    // Start MongoDB transaction
    // -----------------------------------------

    session.startTransaction();

    // -----------------------------------------
    // Create transaction
    // -----------------------------------------

    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: 'PENDING'
    });

    await transaction.save({ session });

    // -----------------------------------------
    // Create DEBIT ledger entry
    // -----------------------------------------

    await ledgerModel.create([{
      account: fromUserAccount._id,
      type: 'DEBIT',
      amount: amount,
      transaction: transaction._id
    }], { session });

    // -----------------------------------------
    // Create CREDIT ledger entry
    // -----------------------------------------

    await ledgerModel.create([{
      account: toAccount,
      type: 'CREDIT',
      amount: amount,
      transaction: transaction._id
    }], { session });

    // -----------------------------------------
    // Complete transaction
    // -----------------------------------------

    transaction.status = 'COMPLETED';

    await transaction.save({ session });

    // -----------------------------------------
    // Commit
    // -----------------------------------------

    await session.commitTransaction();

    return res.status(201).json({
      message: 'Initial funds transaction completed successfully',
      transaction
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }

    console.error(error);

    return res.status(500).json({
      error: 'Something went wrong'
    });
  }
}


export async function getTransactionHistory(req, res) {
  try {
    const accounts = await accountModel.find({ user: req.user._id }).select('_id');


    const accountIds = accounts.map(account => account._id);

    const transactions = await transactionModel.find({
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } }
      ]
    });

    const accountsTransactions = new Array(accounts.length);

    accountIds.forEach((accountId, index) => {
      accountsTransactions[index] = {
        accountId,
        transactions:
          transactions.filter(transaction =>
            transaction.fromAccount.equals(accountId) ||
            transaction.toAccount.equals(accountId)
          )
      };
    });

    return res.status(200).json({
      message: 'Users accounts history fetched successfully',
      status: 'Successful',
      History: accountsTransactions
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Something went wrong',
      status: 'Failed'
    });
  };
};