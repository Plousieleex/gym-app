const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const jwt = require('../utils/jwt');
const sendEmail = require('../utils/email');
const resetTokens = require('../utils/resetTokens');
const filterObject = require('../utils/filterObject');

// FORGOT Password User Service (Forgot Password User Controller)
exports.forgotPasswordUserService = async (email) => {
  const user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AppError('Invalid email.', 404);
  }

  // 6 HANELİ KOD
  const { resetToken, hashedResetToken } =
    await resetTokens.createPasswordResetToken();

  const updatedUser = await prisma.users.update({
    where: { email: email },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    },
  });

  const resetURL = `${process.env.APPLICATION_URL}/api/v1/users/resetPassword/${resetToken}`;

  await sendEmail({
    email: updatedUser.email,
    subject: 'Password Reset Link!',
    message: `Password reset link: ${resetURL}`,
  });
};

exports.resetPasswordUserService = async (
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
    throw new AppError('Passwords doesnt match.', 401);
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

  const token = jwt.signTokenLocal(updatedUser.id, updatedUser.userRole);

  return { updatedUser, token };
};

exports.updatePasswordUserService = async (
  userID,
  currentPassword,
  newPassword,
  newPasswordConfirm,
) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError('Invalid user or password.');
  }

  if (newPassword !== newPasswordConfirm) {
    throw new AppError('Passwords doesnt match.', 401);
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

exports.deactivateUserService = async (userID) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('User not found.', 401);
  }

  const deletedAt = new Date();
  deletedAt.setDate(deletedAt.getDate() + 30);

  return prisma.users.update({
    where: { id: userID },
    data: {
      userActive: false,
      deletedAt: deletedAt.toISOString(),
      lastLogoutAt: new Date(),
    },
  });
};

exports.deleteUserPermanentlyUserService = async (userID) => {
  return prisma.users.delete({
    where: { id: userID },
  });
};

exports.changeEmailUserService = async (currentEmail, newEmail, userID) => {
  const user = await prisma.users.findUnique({
    where: { email: currentEmail, id: userID },
  });

  if (!user || currentEmail !== user.email) {
    throw new AppError('User not found.', 401);
  }

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Change Code.',
      message: '123123',
    });
  } catch (error) {
    throw new AppError('Code cant send, please try again later.', 500);
  }
};
/*
const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const jwt = require('../utils/jwt');
const filterObject = require('../utils/filterObject');

// CREATE USER SERVICE (FOR ADMIN USAGE)
exports.createUserService = async ({
  name_surname,
  email,
  password,
  userRole,
}) => {
  const existingUser = await prisma.users.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new AppError('User already exists.', 401);
  }

  password = await bcrypt.hash(password, 12);

  const user = await prisma.users.create({
    data: {
      name_surname,
      email,
      password,
      userRole,
    },
  });

  const token = jwt.signTokenLocal(user.id);

  return { user, token };
};

// GET USER BY LOOKING TO ID
exports.getUserByIDService = async ({ userID }) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('User not found', 401);
  }

  return user;
};

// UPDATE USER BY LOOKING TO ID
exports.updateUserByIDService = async (userID, userData) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('User not found', 401);
  }

  if (userData.password || userData.passwordConfirm) {
    throw new AppError('This service is not for password updates.', 400);
  }

  const filteredBody = filterObject(userData, 'name_surname');

  return prisma.users.update({
    where: { id: userID },
    data: {
      ...filteredBody,
    },
  });
};

// DELETE USER BY ID (ADMIN MANUAL DELETE / ALL DATA WILL GONE --> MAKE PROTECTED)
exports.deleteUserByIDService = async (userID) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('User not found', 401);
  }

  try {
    return prisma.users.delete({
      where: { id: userID },
    });
  } catch (error) {
    throw new AppError('Failed to delete user.', 500);
  }
};

// AUTHENTICATE USER UPDATE DATA (ONLY FOR LOGGED IN USERS NOT FOR ADMINS)
exports.updateAuthUserService = async (userID, userData) => {
  const allowedFields = filterObject(userData, 'name_surname');
  return prisma.users.update({
    where: { id: userID },
    data: {
      ...allowedFields,
    },
  });
};

// AUTHENTICATE USER INACTIVE (MAKES USER INACTIVE, USER CAN RETURN WITH THEIR DATA)
exports.deactivateUserService = async (userID) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('User not found', 401);
  }

  const deletedAt = new Date();
  deletedAt.setDate(deletedAt.getDate() + 30);
  return prisma.users.update({
    where: { id: userID },
    data: {
      userActive: false,
      deletedAt: deletedAt.toISOString(),
      lastLogoutAt: new Date(),
    },
  });
};

// AUTHENTICATE USER DELETE (DELETES USER'S ALL DATA, USER CAN'T RETURN)
exports.deleteUserPermanentlyService = async (userID) => {
  return prisma.users.delete({
    where: { id: userID },
  });
};

// USER ACTIVATION BY EMAIL (EMAIL SENDING IS HANDLING IN AUTH SERVICE)
exports.activateAccountUserService = async (activationToken) => {
  const activationHashedToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');

  const user = await prisma.users.findFirst({
    where: {
      activationToken: activationHashedToken,
    },
  });

  if (!user || user.activationTokenExpires < new Date()) {
    throw new AppError('Token is invalid or has expired. Please resend.', 400);
  }

  const updatedUser = await prisma.users.update({
    where: { id: user.id },
    data: {
      isActivated: true,
      activationToken: null,
      activationTokenExpires: null,
    },
  });

  const token = jwt.signTokenLocal(updatedUser.id);

  return { updatedUser, token };
};
*/
