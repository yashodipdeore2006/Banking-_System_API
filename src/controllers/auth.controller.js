import jwt from 'jsonwebtoken';

//=== Local Modules ===
import userModel from '../models/user.model.js';
import { sendRegistrationEmail } from '../services/mail.service.js';




//============== Controllers ====================
/**
 * - user register controller
 * - POST /api/auth/register
 */

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    const isExists = await userModel.findOne({ email: email });

    //Error if user already exists
    if (isExists) {
      return res.status(422).json({
        message: 'User already exists with email.',
        status: 'failed'
      });
    };

    const user = await userModel.create({
      email, password, name
    });


    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '3d'
      }
    );

    res.cookie('token', token);

    sendRegistrationEmail(email, name);

    res.status(201).json({
      message: 'User registered successfully',
      status: 'successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error) {
    console.log('Error : ', error);
    res.status(500).json({
      error: 'something went wrong'
    });
  };
};


export async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: 'Email or password is invalid',
        status: 'failed'
      });
    };

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email or password is invalid',
        status: 'failed'
      });
    };


    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '3d'
      }
    );

    res.cookie('token', token);


    res.status(200).json({
      message: 'User logged in successfully',
      status: 'successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token
    });


  } catch (error) {
    console.log('Error : ', error);
    res.status(500).json({
      error: 'something went wrong'
    });
  };
};


export async function logoutController(req, res) {
  try {
    res.clearCookie('token');

    return res.status(200).json({
      message: 'User logged out successfully',
      status: 'Successful'
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      status: 'Failed'
    });
  };
};