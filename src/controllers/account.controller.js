import accountModel from "../models/account.model.js";


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
