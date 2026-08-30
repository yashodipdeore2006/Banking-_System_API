import mongoose from "mongoose";
import ledgerModel from "./ledger.model.js";

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Account must be associated with ta user'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['ACTIVE', 'FROZEN', 'CLOSED'],
      message: 'Status can be either ACTIVE, FROZEN or CLOSED'
    },
    default: 'ACTIVE'
  },
  currency: {
    type: String,
    required: [true, 'currency is required for creating an account'],
    default: 'INR'
  },
}, { timestamps: true });



//Compound index (means single index for two fields like "user" and "status")
accountSchema.index({ user: 1, status: 1 });


/**
 * ==== Calculate the total balance of ====
 */

accountSchema.methods.getBalance = async function () {
  const result = await ledgerModel.aggregate([
    {
      $match: {
        account: this._id
      }
    },

    {
      $group: {
        _id: null,

        credit: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'CREDIT'] },
              '$amount',
              0
            ]
          }
        },

        debit: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'DEBIT'] },
              '$amount',
              0
            ]
          }
        }
      }
    },

    {
      $project: {
        _id: 0,

        totalBalance: {
          $subtract: ['$credit', '$debit']
        }
      }
    }
  ]);

  return result[0]?.totalBalance ?? 0;
};


//============================================================
const accountModel = mongoose.model('Account', accountSchema);


//=============================================================
export default accountModel;