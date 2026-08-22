import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  user: {
    typeof: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Account must be associated with ta user'],
    index: true
  },
  status: {
    enum: {
      values: ['ACTIVE', 'FROZEN', 'CLOSED'],
      message: 'Status can be either ACTIVE, FROZEN or CLOSED'
    }
  },
  currency: {
    type: String,
    required: [true, 'currency is required for creating an account'],
    default: 'INR'
  },
}, { timestamps: true });



//Compound index (means single index for two fields like "user" and "status")
accountSchema.index({ user: 1, status: 1 });



//==================================
const accountModel = mongoose.model('Account', accountSchema);


//==================================
export default accountModel();