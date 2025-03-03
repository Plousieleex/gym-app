const prisma = require('../config/db');
const { getUserById, updateUserByID } = require('../models/userModel');
const { createUser } = require('../services/userService');
const AppError = require('../utils/appError');
const handleAsync = require('../utils/handleAsync');

// CREATE USER
exports.createUserController = handleAsync(async (req, res, next) => {
  const user = await createUser(req.body);
  res.status(201).json({
    status: 'success',
    data: user,
  });
});

// GET USER BY ID
exports.getUserById = handleAsync(async (req, res, next) => {
  const id = req.params.id * 1;
  const user = await getUserById(id);
  if (!user) {
    return next(new AppError('Invalid user id.', 404));
  }
  res.status(201).json({
    status: 'success',
    data: user,
  });
});

// UPDATE USER
exports.updateUserController = handleAsync(async (req, res, next) => {
  const id = req.params.id * 1;
  const userData = req.body;

  const updatedUser = await updateUserByID(id, userData);
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

// CREATE USER PROFILE
exports.createUserProfileController = handleAsync(async (req, res, next) => {});
