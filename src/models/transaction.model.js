import mongoose from "mongoose";

const transactionSChema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Transaction must be associated with a from account'],
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Transaction must be associated with a to account'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
      message: 'Status can be either PENDING, COMPLETED, FAILED or REVERSED'
    },
    default: 'PENDING'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required for creating a transaction'],
    min: [0, 'Transaction amount cannot be negative']
  },
  idempotencyKey: {
    type: String,
    required: [true, 'Idempotency Key is required for creating a transaction'],
    index: true,
    unique: true
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },

  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  requiresVerification: {
    type: Boolean,
    default: false
  },

  riskReasons: {
    type: [String],
    default: []
  }
}, { timestamps: true });



const transactionModel = mongoose.model('Transaction', transactionSChema);


export default transactionModel;