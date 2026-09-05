import express, { json } from 'express';
import mongoose from 'mongoose';

//=== Local Modules ===
import accountModel from '../models/account.model.js';
import ledgerModel from '../models/ledger.model.js';
import transactionModel from '../models/transaction.model.js';
import { sendTransactionEmail, sendTransactionOtpEmail } from '../services/mail.service.js';
import { evaluateTransactionRisk } from '../services/risk.service.js';
import { evaluateTransactionCompliance } from '../services/compliance.service.js';
import { completeTransaction } from '../services/transaction.service.js';
import transactionVerificationModel from '../models/transactionVerification.model.js';
import { evaluateTransactionDecision } from '../services/decision.service.js';

import {
  generateOtp,
  hashOtp,
  getOtpExpiry
} from '../services/otp.service.js';



//=====================================================
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


//============================================================
export async function createTransaction(req, res) {
  try {

    /**
     * 1. ========== Request Validation ===============
     */

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "fromAccount, toAccount, amount & idempotencyKey are required"
      });
    }


    // Searching "fromAccount" in accountModel
    const fromUserAccount = await accountModel.findOne({
      _id: fromAccount
    });

    // Searching "toAccount" in accountModel
    const toUserAccount = await accountModel.findOne({
      _id: toAccount
    });

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount"
      });
    }


    /**
     * 2. ========== Idempotency Key Validation ===============
     */

    const isTransactionAlreadyExists =
      await transactionModel.findOne({
        idempotencyKey: idempotencyKey
      });

    if (isTransactionAlreadyExists) {

      if (isTransactionAlreadyExists.status === 'COMPLETED') {
        return res.status(200).json({
          message: 'Transaction already processed',
          transaction: isTransactionAlreadyExists
        });
      }

      if (isTransactionAlreadyExists.status === 'PENDING') {
        return res.status(200).json({
          message: 'Transaction is still processing'
        });
      }

      if (
        isTransactionAlreadyExists.status === 'FAILED' ||
        isTransactionAlreadyExists.status === 'REVERSED'
      ) {
        return res.status(200).json({
          message: 'Transaction processing failed, please try again'
        });
      }
    }


    /**
     * 3. ========== Account Status Check ===============
     */

    if (
      fromUserAccount.status !== 'ACTIVE' ||
      toUserAccount.status !== 'ACTIVE'
    ) {
      return res.status(400).json({
        message: 'Both fromAccount and toAccount must be ACTIVE to process transaction'
      });
    }


    /**
     * 4. ========== Balance Check ===============
     */

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is: ${balance}. Requested amount is: ${amount}`
      });
    }

    /**
    * 5. ========== Compliance Evaluation ===============
    */
    const complianceResult = await evaluateTransactionCompliance({
      fromAccount: fromUserAccount,
      toAccount: toUserAccount,
      amount,
      balance
    });


    // Block transaction if any compliance rule is violated
    if (!complianceResult.compliant) {
      return res.status(403).json({
        message: 'Transaction blocked by compliance rules',
        compliance: complianceResult
      });
    }

    /**
     * 6. ========== Risk Evaluation ===============
     */

    const riskResult = await evaluateTransactionRisk({
      user: req.user,
      fromAccount: fromUserAccount,
      toAccount: toUserAccount,
      amount
    });

    /**
     * 7. ========== Final Transaction Decision ===============
     */

    const decisionResult = evaluateTransactionDecision({
      riskResult,
      complianceResult
    });

    // Block transaction if decision engine rejects it
    if (decisionResult.decision === 'BLOCK') {
      return res.status(403).json({
        message: 'Transaction blocked',
        decision: decisionResult,
        compliance: complianceResult,
        risk: riskResult
      });
    }

    /**
     * 7. ========== HIGH Risk → OTP Verification ===============
     */

    if (riskResult.requiresOtp) {

      const otp = generateOtp();
      const otpHash = await hashOtp(otp);
      const expiresAt = getOtpExpiry();

      const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING',
        riskLevel: riskResult.riskLevel,
        riskScore: riskResult.riskScore,
        riskReasons: riskResult.riskReasons,
        requiresVerification: true
      });

      await transactionVerificationModel.createVerification(
        transaction._id,
        req.user._id,
        otpHash,
        expiresAt
      );

      await sendTransactionOtpEmail(
        req.user.email,
        req.user.name,
        otp
      );

      return res.status(202).json({
        message: 'Transaction requires OTP verification',
        transactionId: transaction._id,
        riskLevel: riskResult.riskLevel,
        expiresAt
      });
    }


    /**
     * 8. ========== LOW / MEDIUM Risk Transaction ===============
     */

    const createdTransaction = await transactionModel.create({
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: 'PENDING',
      riskLevel: riskResult.riskLevel,
      riskScore: riskResult.riskScore,
      riskReasons: riskResult.riskReasons,
      requiresVerification: false
    });

    const transaction = await completeTransaction(
      createdTransaction._id
    );


    /**
     * 8. ========== Send Transaction Email ===============
     */

    await sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount
    );


    /**
     * 10. ========== Response ===============
     */

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction: transaction
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}



export async function createInitialFundsTransaction(req, res) {

  try {

    const { toAccount, amount, idempotencyKey } = req.body;


    /**
     * 1. ========== Request Validation ===============
     */

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: 'toAccount, amount and idempotencyKey are required'
      });
    }


    /**
     * 2. ========== Idempotency Validation ===============
     */

    const existingTransaction = await transactionModel.findOne({
      idempotencyKey
    });

    if (existingTransaction) {

      if (existingTransaction.status === 'COMPLETED') {
        return res.status(200).json({
          message: 'Initial funds transaction already processed',
          transaction: existingTransaction
        });
      }

      if (existingTransaction.status === 'PENDING') {
        return res.status(200).json({
          message: 'Initial funds transaction is still processing'
        });
      }

      if (
        existingTransaction.status === 'FAILED' ||
        existingTransaction.status === 'REVERSED'
      ) {
        return res.status(200).json({
          message: 'Initial funds transaction failed, please try again'
        });
      }
    }


    /**
     * 3. ========== Find Receiver Account ===============
     */

    const toUserAccount = await accountModel.findOne({
      _id: toAccount
    });

    if (!toUserAccount) {
      return res.status(400).json({
        message: 'Invalid toAccount'
      });
    }


    /**
     * 4. ========== Find System/From Account ===============
     */

    const fromUserAccount = await accountModel.findOne({
      user: req.user
    });

    if (!fromUserAccount) {
      return res.status(400).json({
        message: 'System account not found'
      });
    }


    /**
     * 5. ========== Start MongoDB Transaction ===============
     */

    const session = await mongoose.startSession();

    try {

      session.startTransaction();


      /**
       * 6. ========== Create Transaction ===============
       */

      const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING'
      });

      await transaction.save({ session });


      /**
       * 7. ========== Create DEBIT Ledger Entry ===============
       */

      await ledgerModel.create([{
        account: fromUserAccount._id,
        type: 'DEBIT',
        amount,
        transaction: transaction._id
      }], { session });


      /**
       * 8. ========== Create CREDIT Ledger Entry ===============
       */

      await ledgerModel.create([{
        account: toAccount,
        type: 'CREDIT',
        amount,
        transaction: transaction._id
      }], { session });


      /**
       * 9. ========== Complete Transaction ===============
       */

      transaction.status = 'COMPLETED';

      await transaction.save({ session });


      /**
       * 10. ========== Commit MongoDB Transaction ===============
       */

      await session.commitTransaction();


      return res.status(201).json({
        message: 'Initial funds transaction completed successfully',
        transaction
      });

    } catch (error) {

      await session.abortTransaction();

      throw error;

    } finally {

      await session.endSession();

    }

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: 'Something went wrong',
      error: error.message
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


export async function getTransactionById(req, res) {
  try {
    const transactionId = req.params.id;

    const accounts = await accountModel.find({ user: req.user._id });

    const isTransactionExists = await transactionModel.findById(transactionId);

    if (!isTransactionExists) {
      return res.status(404).json({
        error: 'Transaction not found',
        status: 'Failed'
      });
    };

    const isUserAccount = accounts.some((account) => {
      return account._id.equals(isTransactionExists.toAccount) || account._id.equals(isTransactionExists);
    });

    if (!isUserAccount) {
      return res.status(404).json({
        error: 'Transaction does not found for any of your account'
      });
    };

    return res.status(200).json({
      message: `Transaction found your account : ${isUserAccount}`,
      transaction: isTransactionExists,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Something went wrong',
      status: 'Failed'
    });
  };
};