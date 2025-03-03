const bcrypt = require('bcrypt');
const {
  createUser,
  getUserByEmail,
  getUserByUsername,
  getUserById,
} = require('../models/userModel');
const AppError = require('../utils/appError');

// CREATE USER
exports.createUser = async (userData) => {
  const existingUserByEmail = await getUserByEmail(userData.email);
  if (existingUserByEmail) {
    throw new AppError('Invalid email.', 400);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;

  const newUser = await createUser(userData);

  return newUser;
};

/* // UPDATE USER
exports.updateUser = async (userData) => {}; */

/* // GET USER BY ID
exports.findUserById = async (userId) => {
  const existingUserById = await getUserById(userId.id);
  if (!existingUserById) {
    throw new AppError('Invalid ID.', 404);
  }
}; */

// CREATE USER PROFILE
exports.registerUserProfile = async (userData) => {
  const existingUserByUsername = await getUserByUsername(userData.username);
  if (existingUserByUsername) {
    throw new Error('Invalid username.');
  }
};
