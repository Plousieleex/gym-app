const jwt = require('jsonwebtoken');
const { type } = require('os');
const AppError = require('./appError');
const promisify = require('util').promisify;

exports.signTokenLocal = (id, userRole) => {
  return jwt.sign(
    { id: id, userRole: userRole, provider: 'local' },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS512',
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

exports.signTokenGoogle = (id, userEmail) => {
  return jwt.sign(
    {
      id: id,
      email: userEmail,
      provider: 'google',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
};

exports.signTokenPR = (id, userRole) => {
  return jwt.sign(
    { sub: id, userRole: userRole, provider: 'local', type: 'pw-reset' },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS512',
      expiresIn: '5m',
    },
  );
};

exports.verifyToken = async (token, expectedType) => {
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET, {
      algorithms: ['HS512'],
    });
  } catch (e) {
    throw new AppError('Invalid or expired token.', 401);
  }

  if (expectedType && decoded.type !== expectedType) {
    throw new AppError('Token type is invalid.', 401);
  }

  return decoded;
};

exports.protectVerifyToken = async (token) => {
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new AppError('Invalid or expired token.', 401);
  }

  return decoded;
};
