const prisma = require('../config/db');
const bcrypt = require('bcrypt');
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
  const user = await prisma.users.findFirst({
    where: {
      activationToken,
      activationTokenExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid activation link!', 400);
  }

  const updatedUser = await prisma.users.update({
    where: { id: user.id },
    data: {
      userActive: true,
      activationToken: null,
      activationTokenExpires: null,
    },
  });

  const token = jwt.signTokenLocal(updatedUser.id);

  return { updatedUser, token };
};
