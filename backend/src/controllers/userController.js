const handleAsync = require('../utils/handleAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const {
  getUserByIDService,
  updateUserByIDService,
  deleteUserByIDService,
} = require('../services/userService');

// CREATE USER
/* 
  ONLY FOR ADMIN USAGE.
*/
exports.createUserController = handleAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'NOT DEFINED',
    message: 'USER SERVICE WILL BE USED FOR THIS OPERATION',
  });
});

// GET ALL USERS
exports.getAllUsersController = handleAsync(async (req, res, next) => {
  const feature = new APIFeatures('users', req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await feature.execute();
  res.status(201).json({
    status: 'success',
    data: {
      users,
    },
  });
});

// GET USER BY ID
exports.getUserByIDController = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const user = await getUserByIDService(id);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// UPDATE USER BY ID
exports.updateUserByIDController = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const updatedUser = await updateUserByIDService(id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// DELETE USER BY ID
exports.deleteUserByIDController = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  deleteUserByIDService(id);
  res.status(204).send();
});
