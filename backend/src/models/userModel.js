const prisma = require('../config/db');
const AppError = require('../utils/appError');

// CREATING USER
exports.createUser = async (userData) => {
  return await prisma.users.create({
    data: userData,
  });
};

// GET ALL USERS
exports.getAllUsers = async () => {
  return await prisma.users.findMany({
    orderBy: {
      id: 'asc',
    },
  });
};

// GET USER
exports.getUserById = async (userID) => {
  return await prisma.users.findUnique({
    where: { id: userID },
  });
};

// UPDATE USER
exports.updateUserByID = async (userID, userData) => {
  delete userData.id; // DELETING ID TO PREVENT UPDATING USER ID

  return await prisma.users.update({
    where: { id: userID },
    data: {
      ...userData,
    },
  });
};

// DELETE USER BY ID
exports.deleteUserByID = async (userID) => {
  return await prisma.users.delete({
    where: { id: userID },
  });
};

// CREATE USER PROFILE
exports.createUserProfile = async (userData) => {
  return await prisma.user_profile.create({
    data: userData,
  });
};

// Get User By Looking to Email (CHECK FOR EXISTING EMAIL)
exports.getUserByEmail = async (email) => {
  return await prisma.users.findUnique({
    where: { email },
  });
};

// Get User By Looking to Username (CHECK FOR EXISTING USERNAME)
exports.getUserByUsername = async (username) => {
  return await prisma.users.findUnique({
    where: { username },
  });
};
