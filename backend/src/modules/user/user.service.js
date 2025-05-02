const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('../../utils/appError');
const jwt = require('../../utils/jwt');
const sendEmail = require('../../utils/email');
const resetTokens = require('../../utils/resetTokens');
const calculateBMI = require('../../utils/bmiCalculator');

// Forgot Password
exports.forgotPasswordUserService = async (email) => {
  const userRecord = await prisma.users.findUnique({
    where: { email },
  });

  if (!userRecord) {
    throw new AppError('Invalid email.', 404);
  }

  const { randomCode, finalRandomCode } =
    await resetTokens.createPasswordResetToken();

  const resetToken = `Password Reset Code: ${randomCode}`;

  try {
    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        passwordResetToken: finalRandomCode,
        passwordResetExpires: new Date(
          Date.now() + 3 * 60 * 1000,
        ).toISOString(),
      },
    });

    await sendEmail({
      email: updatedUser.email,
      subject: 'Password Reset Code!',
      message: `${resetToken}`,
    });
  } catch (e) {
    throw new AppError(
      'Error occured while sending code. Try again later.',
      500,
    );
  }
};

exports.verifyResetTokenService = async (resetToken) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  try {
    const userRecord = await prisma.users.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!userRecord) {
      throw new AppError('Token is invalid or has expired.', 401);
    }

    const prToken = jwt.signTokenPR(userRecord.id, userRecord.userRole);

    return { valid: true, resetSessionToken: prToken };
  } catch (e) {
    throw new AppError('Error occured. Try again later.', 500);
  }
};

exports.resetPasswordService = async (
  resetSessionToken,
  newPassword,
  confirmPassword,
) => {
  if (newPassword !== confirmPassword) {
    throw new AppError('Passwords dont match.', 400);
  }

  const payload = await jwt.verifyToken(resetSessionToken, 'pw-reset');
  const userID = payload.sub;

  const user = await prisma.users.findUnique({ where: { id: userID } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const password = await bcrypt.hash(newPassword, 12);

  try {
    const updatedUser = await prisma.users.update({
      where: { id: userID },
      data: {
        password: password,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });

    const token = jwt.signTokenLocal(updatedUser.id, updatedUser.userRole);

    return { token };
  } catch (e) {
    throw new AppError(
      'Error occured while reseting password. Try again later.',
      500,
    );
  }
};

// NOT COMPLETED
exports.updatePasswordUserService = async (
  userID,
  currentPassword,
  newPassword,
  passwordConfirm,
) => {
  const userRecord = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (
    !userRecord ||
    !(await bcrypt.compare(currentPassword, userRecord.password))
  ) {
    throw new AppError('Invalid user or password.', 401);
  }

  if (newPassword !== passwordConfirm) {
    throw new AppError('Passwords dont match.', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
};

exports.createUserProfile = async ({
  userID,
  height,
  weight,
  age,
  training_experience,
  training_aim,
  user_sex,
  training_duration,
  birthdate,
  social_media_accounts,
  biography,
  profile_img,
}) => {
  const existingUserProfile = await prisma.user_profile.findUnique({
    where: { userId: userID },
    include: { user: true },
  });

  if (existingUserProfile) {
    throw new AppError('You already created a user profile.', 400);
  }

  // Calculate bmi here
  // FIX THIS PART
  const userBMI = calculateBMI.calculateBMI(height, weight);

  try {
    const newUserProfile = await prisma.user_profile.create({
      data: {
        userId: userID,
        height,
        weight,
        age,
        body_mass_index: userBMI,
        training_experience,
        training_aim,
        user_sex,
        training_duration,
        birthdate,
        social_media_accounts,
        biography,
        profile_img,
      },
    });

    return newUserProfile;
  } catch (e) {
    console.log(e);
    throw new AppError(
      'Error occured while creating user profile. Try again later.',
      500,
    );
  }
};
