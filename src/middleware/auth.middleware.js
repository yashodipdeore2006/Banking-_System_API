import userModel from '../models/user.model.js';
import jwt, { decode } from 'jsonwebtoken';




export async function authMiddleware(req, res, next) {

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized access, token is missing'
    });
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decode.userId);

    req.user = user;

    return next();

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Something went wrong'
    });
  };
};
