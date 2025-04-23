const jwt = require('jsonwebtoken');
const promisify = require('util').promisify;

exports.signTokenLocal = (id, userRole) => {
  return jwt.sign(
    { id: id, userRole: userRole, provider: 'local' },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
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

