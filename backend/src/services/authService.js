const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const jwt = require('../utils/jwt');
const crypto = require('crypto');
const passwordResetToken = require('../utils/passwordResetToken');
const sendEmail = require('../utils/email');
const { token } = require('morgan');

// SIGN UP USERS SERVICE
exports.signUpUsersAuthService = async ({
  name_surname,
  email,
  password,
  passwordConfirm,
}) => {
  const existingUser = await prisma.users.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new AppError('User already exists', 401);
  }

  if (!(password === passwordConfirm)) {
    throw new AppError('Passwords do not match', 401);
  }

  password = await bcrypt.hash(password, 12);
  delete passwordConfirm;

  try {
    const newUser = await prisma.users.create({
      data: {
        name_surname,
        email,
        password,
        activationToken: crypto.randomBytes(32).toString('hex'),
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const activationLink = `${process.env.APPLICATION_URL}/api/v1/users/activate/${newUser.activationToken}`;

    await sendEmail({
      email: newUser.email,
      subject: 'Activate Your Account!',
      message: `Please click to activate your account: ${activationLink}`,
    });

    return { newUser };
  } catch (error) {
    await prisma.users.deleteMany({ where: { email } });

    throw new AppError('User creation failed.', 500);
  }
};

// LOGIN AUTH SERVICE
exports.loginAuthService = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide an email or password', 400);
  }

  let user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (!user.isActive) {
    user = await prisma.users.update({
      where: { id: user.id },
      data: {
        userActive: true,
        deletedAt: null,
        lastLogoutAt: null,
      },
    });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  delete user.password;

  const token = jwt.signTokenLocal(user.id, user.userRole);

  return { user, token };
};

// FORGOT PASSWORD SERVICE (TAKES EMAIL, THIS IS NOT A RESET OR CHANGE)
exports.forgotPasswordAuthService = async (email) => {
  const user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AppError('Invalid email.', 404);
  }

  const { resetToken, hashedToken } =
    await passwordResetToken.createPasswordResetToken();
  const updatedUser = await prisma.users.update({
    where: { email: email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    },
  });

  const resetURL = `${process.env.APPLICATION_URL}/api/v1/auth/resetPassword/${resetToken}`;

  await sendEmail({
    email: updatedUser.email,
    subject: 'Password Reset',
    message: `Password reset link: ${resetURL}`,
  });
};

// RESET PASSWORD AUTH SERVICE
exports.resetPasswordAuthService = async (
  resetToken,
  newPassword,
  newPasswordConfirm,
) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await prisma.users.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gte: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired.', 401);
  }

  if (newPassword !== newPasswordConfirm) {
    throw new AppError("Passwords doesn't match", 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const updatedUser = await prisma.users.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date(),
    },
  });

  const token = jwt.signTokenLocal(user.id, user.userRole);

  return { updatedUser, token };
};

// UPDATED USER PASSWORD (CLIENT VERSION) (ONLY FOR LOGGED IN USERS)
exports.updatePasswordAuthService = async (
  userID,
  currentPassword,
  newPassword,
  newPasswordConfirm,
) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError('Invalid user or password.', 400);
  }

  if (newPassword !== newPasswordConfirm) {
    throw new AppError('Passwords do not match', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.users.update({
    where: { id: userID },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  const token = jwt.signTokenLocal(updatedUser.id, updatedUser.userRole);

  return { updatedUser, token };
};
