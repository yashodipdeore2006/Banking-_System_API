import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';




export async function authMiddleware(req, res, next) {

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized access, token is missing'
    });
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    req.user = user;

    return next();

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Something went wrong'
    });
  };
};


export async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized access token, token is missing'
    });
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select('+systemUser');

    if (!user.systemUser) {
      return res.status(403).json({
        message: 'Forbidden access, not a system user'
      });
    };


    req.user = user;
    return next();

  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized access, token is invalid',
    });
  };
};  