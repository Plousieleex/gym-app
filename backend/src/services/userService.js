const prisma = require('../config/db');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

// GET USER BY ID SERVİCE
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
