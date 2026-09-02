import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const transactionVerificationSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: [true, 'Transaction is required for verification'],
    index: true,
    immutable: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for verification'],
    index: true,
    immutable: true
  },

  otpHash: {
    type: String,
    required: [true, 'OTP hash is required'],
    select: false
  },

  expiresAt: {
    type: Date,
    required: [true, 'OTP expiry time is required']
  },

  attempts: {
    type: Number,
    default: 0,
    min: [0, 'Attempts cannot be negative']
  },

  maxAttempts: {
    type: Number,
    default: 5,
    min: [1, 'Maximum attempts must be at least 1']
  },

  status: {
    type: String,
    enum: {
      values: ['PENDING', 'VERIFIED', 'FAILED', 'EXPIRED'],
      message: 'Status can be PENDING, VERIFIED, FAILED or EXPIRED'
    },
    default: 'PENDING'
  },

  verifiedAt: {
    type: Date
  }
}, { timestamps: true });


// One OTP verification record per transaction.
transactionVerificationSchema.index(
  { transaction: 1 },
  { unique: true }
);


// ================================
// INSTANCE METHODS
// ================================

transactionVerificationSchema.methods.isExpired = function () {
  return new Date() >= this.expiresAt;
};


transactionVerificationSchema.methods.canAttempt = function () {
  return (
    this.status === 'PENDING' &&
    !this.isExpired() &&
    this.attempts < this.maxAttempts
  );
};


transactionVerificationSchema.methods.verifyOtp = async function (otp) {
  return bcrypt.compare(otp, this.otpHash);
};


transactionVerificationSchema.methods.incrementAttempt = function () {
  this.attempts += 1;
  return this.attempts;
};


transactionVerificationSchema.methods.markVerified = function () {
  this.status = 'VERIFIED';
  this.verifiedAt = new Date();
  return this;
};


transactionVerificationSchema.methods.markFailed = function () {
  this.status = 'FAILED';
  return this;
};


// ================================
// STATIC METHODS
// ================================

transactionVerificationSchema.statics.findPendingByTransaction = function (transactionId) {
  return this.findOne({
    transaction: transactionId,
    status: 'PENDING'
  }).select('+otpHash');
};


transactionVerificationSchema.statics.createVerification = function (
  transactionId,
  userId,
  otpHash,
  expiresAt
) {
  return this.create({
    transaction: transactionId,
    user: userId,
    otpHash,
    expiresAt
  });
};


const transactionVerificationModel = mongoose.model(
  'TransactionVerification',
  transactionVerificationSchema
);


export default transactionVerificationModel;
