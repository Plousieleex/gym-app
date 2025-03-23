const crypto = require('crypto');

exports.createPasswordResetToken = async () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  return { resetToken, hashedToken };
};

exports.createActivationToken = async () => {
  const activationToken = crypto.randomBytes(32).toString('hex');
  const activationHashedToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');

  return { activationToken, activationHashedToken };
};
