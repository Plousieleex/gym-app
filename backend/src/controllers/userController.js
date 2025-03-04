const prisma = require('../config/db');
const {
  getUserById,
  updateUserByID,
  deleteUserByID,
  getAllUsers,
} = require('../models/userModel');
const { createUser } = require('../services/userService');
const AppError = require('../utils/appError');
const handleAsync = require('../utils/handleAsync');
const APIFeatures = require('../utils/apiFeatures');

// CREATE USER
exports.createUserController = handleAsync(async (req, res, next) => {
  const user = await createUser(req.body);
  res.status(201).json({
    status: 'success',
    data: user,
  });
});

// GET USERS
exports.getAllUsersController = handleAsync(async (req, res, next) => {
  const feature = new APIFeatures('users', req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // console.log(req.query);
  const users = await feature.execute();
  res.status(201).json({
    status: 'success',
    data: {
      users,
    },
  });
});

// GET USER BY ID
exports.getUserById = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);
  if (!user) {
    return next(new AppError('Invalid user id.', 404));
  }
  res.status(201).json({
    status: 'success',
    data: user,
  });
});

// UPDATE USER BY ID
exports.updateUserController = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const userData = req.body;

  const updatedUser = await updateUserByID(id, userData);
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

// DELETE USER BY ID
exports.deleteUserController = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);
  if (!user) {
    return next(new AppError('Invalid User.', 404));
  }

  const deletedUser = await deleteUserByID(id);
  if (!deletedUser) {
    return next(new AppError('Failed to delete user.', 500));
  }
  res.status(204).send();
});

// CREATE USER PROFILE
exports.createUserProfileController = handleAsync(async (req, res, next) => {});
