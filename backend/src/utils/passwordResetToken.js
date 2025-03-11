const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.createPasswordResetToken = async () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 12);
  return { resetToken, hashedToken };
};
