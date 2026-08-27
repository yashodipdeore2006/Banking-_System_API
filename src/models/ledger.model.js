import mongoose from 'mongoose';


const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'ledger must be associated with an account'],
    index: true,
    immutable: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required for creating a ledger entry'],
    immutable: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: [true, 'Ledger must be associated with a transaction'],
    index: true,
    immutable: true
  },
  type: {
    type: String,
    enum: {
      values: ['CREDIT', 'DEBIT'],
      message: 'Type can be either CREDIT or DEBIT'
    },
    required: [true, 'Ledger type is required'],
    immutable: true
  }
}, { timestamps: true });



//Error if modification or deletion on a data or model is attempted
function preventLedgerModification() {
  throw new Error('Ledger entries are immutable and cannot be modified or deleted');
};

// ================================
// UPDATE PROTECTION
// ================================

ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findByIdAndUpdate', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('replaceOne', preventLedgerModification);

// ================================
// DELETE PROTECTION
// ================================

ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findByIdAndDelete', preventLedgerModification);



// ================================
// DOCUMENT SAVE PROTECTION
// ================================
ledgerSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(
      new Error(
        'Ledger entries are immutable and cannot be modified or deleted'
      )
    );
  }

  next();
});


//================= Ledger Model ==============================

const ledgerModel = mongoose.model('Ledger', ledgerSchema);



//=================================
export default ledgerModel;