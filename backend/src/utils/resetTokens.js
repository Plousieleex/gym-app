import crypto from 'crypto';

export async function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  return { resetToken, hashedToken };
}

export async function createActivationToken() {
  const activationToken = crypto.randomBytes(32).toString('hex');
  const activationHashedToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');

  return { activationToken, activationHashedToken };
}

export async function createSixDigitToken() {
  const randomCode = crypto.randomInt(0, 1_000_000);
  const finalRandomCode = String(randomCode).padStart(6, '0');

  const hashedFinalRandomCode = crypto
    .createHash('sha256')
    .update(finalRandomCode)
    .digest('hex');

  return { finalRandomCode, hashedFinalRandomCode };
}

export default {
  createPasswordResetToken,
  createActivationToken,
  createSixDigitToken,
};
