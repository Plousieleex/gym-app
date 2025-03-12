const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const { signToken } = require('../utils/jwt');
const filterObject = require('../utils/filterObject');
const handleAsync = require('../utils/handleAsync');

// CREATE USER SERVICE (FOR ADMIN USAGE)
exports.createUserService = async ({ name_surname, email, password }) => {
  const existingUser = await prisma.users.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new AppError('Invalid email.', 401);
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  password = hashedPassword;

  const newUser = await prisma.users.create({
    data: {
      name_surname,
      email,
      password,
    },
  });
  const token = signToken(newUser.id);

  return { newUser, token };
};

// GET USER BY ID SERVICE
exports.getUserByIDService = async (userID) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

// UPDATE USER BY ID SERVICE
exports.updateUserByIDService = async (userID, userData) => {
  if (userData.password || userData.passwordConfirm) {
    throw new AppError('This route is not for password updates.', 400);
  }
  const filteredBody = filterObject(userData, 'name_surname');
  const updatedUser = await prisma.users.update({
    where: { id: userID },
    data: {
      ...filteredBody,
    },
  });

  return updatedUser;
};

// DELETE USER BY ID SERVICE
exports.deleteUserByIDService = async (userID) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('Invalid user.', 404);
  }

  const deletedUser = await prisma.users.delete({
    where: { id: userID },
  });
  if (!deletedUser) {
    throw new AppError('Failed to delete user.', 500);
  }
  return deletedUser;
};

// AUTHENTICATE USER UPDATE DATA (ONLY FOR LOGGED IN USERS NOT FOR ADMINS)
exports.updateAuthUserService = async (userID, updateFields) => {
  // 2) Update user data
  const allowedFields = filterObject(updateFields, 'name_surname');
  const user = await prisma.users.update({
    where: { id: userID },
    data: { ...allowedFields },
  });

  return user;
};

// AUTHANTICATE USER INACTIVE (MAKES USER INACTIVE, USER CAN RETURN WITH THEIR DATA)
exports.deactivateUserService = async (userID) => {
  const deletedAt = new Date();
  deletedAt.setDate(deletedAt.getDate() + 30);
  return await prisma.users.update({
    where: { id: userID },
    data: {
      userActive: false,
      deletedAt: deletedAt.toISOString(),
      lastLogoutAt: new Date(),
    },
  });
};

exports.deleteUserService = async (userID) => {
  return await prisma.users.delete({
    where: { id: userID },
  });
};
