const prisma = require('../config/db');
const { createUser } = require('../services/userService');
const handleAsync = require('../utils/handleAsync');

// CREATE USER
exports.createUserController = handleAsync(async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
});

// CREATE USER PROFILE
exports.createUserProfileController = handleAsync(async (req, res, next) => {});
