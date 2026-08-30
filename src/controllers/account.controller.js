import accountModel from "../models/account.model.js";
import mongoose from "mongoose";

export async function createAccount(req, res) {
  try {
    const user = req.user;

    const account = await accountModel.create({
      user: user._id,
    });

    res.status(201).json({
      message: 'Account create successfully',
      account
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong"
    });
  };
};



export async function getUserAccountsController(req, res) {
  try {
    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
      accounts
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong'
    });
  };
};


export async function getAccountBalanceController(req, res) {
  try {
    const { accountId } = req.params;


    //Check is account belong to the logged-in user or not.
    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id
    });


    //Error if account does not belong to the logged-in user
    if (!account) {
      return res.status(404).json({
        message: 'Account not found'
      });
    };

    //Getting the balance of account
    const balance = await account.getBalance();


    return res.status(200).json({
      message: 'Account balance fetched successfully',
      Balance: balance
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong'
    });
  };
};