import mongoose from 'mongoose';

import transactionModel from '../models/transaction.model.js';
import transactionVerificationModel from '../models/transactionVerification.model.js';

import transactionModel from '../models/transaction.model.js';
import transactionVerificationModel from '../models/transactionVerification.model.js';


export const verifyTransactionController = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { otp } = req.body;

    // 1. Find pending verification
    const verification =
      await transactionVerificationModel.findPendingByTransaction(
        transactionId
      );

    if (!verification) {
      return res.status(404).json({
        message: 'Verification request not found'
      });
    }

    // 2. Check ownership
    if (!verification.user.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You are not authorized to verify this transaction'
      });
    }

    // 3. Check OTP attempts and expiry
    if (!verification.canAttempt()) {
      if (verification.isExpired()) {
        verification.status = 'EXPIRED';
        await verification.save();

        return res.status(400).json({
          message: 'OTP has expired'
        });
      }

      return res.status(400).json({
        message: 'OTP verification attempts exceeded'
      });
    }

    // 4. Verify OTP
    const isValid = await verification.verifyOtp(otp);

    if (!isValid) {
      verification.incrementAttempt();

      if (verification.attempts >= verification.maxAttempts) {
        verification.markFailed();
      }

      await verification.save();

      return res.status(400).json({
        message: 'Invalid OTP'
      });
    }

    // 5. Mark OTP as verified
    verification.markVerified();
    await verification.save();

    // 6. Find transaction
    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    return res.status(200).json({
      message: 'OTP verified successfully',
      transactionId: transaction._id
    });

  } catch (error) {
    return next(error);
  }
};