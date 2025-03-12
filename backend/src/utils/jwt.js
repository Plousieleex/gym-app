import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const signToken = (id, userRole) => {
  return jwt.sign({ id: id, userRole: userRole }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const verifyToken = async (token) => {
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

export { signToken, verifyToken };
