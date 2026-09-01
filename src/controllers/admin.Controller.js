import userModel from "../models/user.model.js";
import transactionModel from '../models/transaction.model.js';
import accountModel from '../models/account.model.js';

export async function getAdminDashboardController(req, res) {
  try {

    const usersData = await userModel.find();
    const accountsData = await accountModel.find();
    const transactionsData = await transactionModel.find();

    console.log(usersData);
    console.log(accountsData);
    console.log(transactionsData);

    const users = {
      total: userModel.length,
    };


    const accounts = {
      total: accountsData.length,
      active: accountsData.filter(data => data.status === 'ACTIVE').length,
      frozen: accountsData.filter(data => data.status === 'FROZEN').length,
    };


    const transactions = {
      total: transactionsData.length,
      completed: transactionsData.filter(data => data.status === 'COMPLETED').length,
      pending: transactionsData.filter(data => data.status === 'PENDING').length,
      failed: transactionsData.filter(data => data.status === 'FAILED').length,
      transactionVolume: transactionsData.filter(data => data.status === 'COMPLETED').reduce((total, transaction) => total + transaction.amount, 0)
    };

    return res.status(200).json({
      message: 'Admin dashboard fetched successfully',
      status: 'Successful',
      users,
      accounts,
      transactions
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Something went wrong',
      status: 'Failed'
    });
  };
};


export async function getUsersController(req, res) {
  try {
    const users = await userModel
      .find()
      .select('-password -systemUser');

    return res.status(200).json({
      message: 'Users fetched successfully',
      status: 'Successful',
      users
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Something went wrong',
      status: 'Failed'
    });
  }
}


export async function updateAccountStatusController(req, res) {
  try {
    const { accountId, status } = req.params;

    const account = await accountModel.findById(accountId);

    if (!account) {
      return res.status(404).json({
        error: 'Account not found',
        status: 'Failed'
      });
    }

    account.status = status;
    await account.save();

    return res.status(200).json({
      message: 'Account status changed successfully',
      status: 'Successful',
      account
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong',
      status: 'Failed'
    });
  }
}


export async function getAdminTransactionController(req, res) {
  try {
    const { transactionId } = req.params;

    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        status: 'Failed'
      });
    }

    return res.status(200).json({
      message: 'Transaction fetched successfully',
      status: 'Successful',
      transaction
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong',
      status: 'Failed'
    });
  }
}