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