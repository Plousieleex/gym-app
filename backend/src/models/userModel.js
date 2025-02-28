const prisma = require('../config/db');

// CREATING USER
exports.createUser = async userData => {
  return await prisma.users.create({
    data: userData,
  });
};

// CREATE USER PROFILE
exports.createUserProfile = async userData => {
  return await prisma.user_profile.create({
    data: userData,
  });
};

// Get User By Looking to Email
exports.getUserByEmail = async email => {
  return await prisma.users.findUnique({
    where: { email },
  });
};

// Get User By Looking to Username
exports.getUserByUsername = async username => {
  return await prisma.users.findUnique({
    where: { username },
  });
};
