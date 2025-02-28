const bcrypt = require('bcrypt');
const {
  createUser,
  getUserByEmail,
  getUserByUsername,
} = require('../models/userModel');

// CREATE USER
exports.createUser = async userData => {
  const existingUserByEmail = await getUserByEmail(userData.email);
  if (existingUserByEmail) {
    throw new Error('Invalid Email.');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;

  const newUser = await createUser(userData);

  return newUser;
};

// CREATE USER PROFILE
exports.registerUserProfile = async userData => {
  const existingUserByUsername = await getUserByUsername(userData.username);
  if (existingUserByUsername) {
    throw new Error('Invalid username.');
  }
};
