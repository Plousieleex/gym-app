const handleAsync = require('../utils/handleAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const {
  getUserByIDService,
  updateUserByIDService,
  deleteUserByIDService,
  createUserService,
  updateAuthUserService,
  deactivateUserService,
  deleteUserService,
} = require('../services/userService');
const filterObject = require('../utils/filterObject');

// CREATE USER
/* 
  ONLY FOR ADMIN USAGE. 
  DON'T USE IF THIS ROUTE IS NOT PROTECTED!!
*/
exports.createUserController = handleAsync(async (req, res, next) => {
  const newUser = await createUserService({
    name_surname: req.body.name_surname,
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({
    status: 'success',
    data: newUser,
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

// GET USER BY ID (REFACTOR)
exports.getUserByIDController = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const user = await getUserByIDService(id);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// UPDATE USER BY ID (REFACTOR)
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

// DELETE USER BY ID (ADMIN MANUEL DELETE --> ALL DATA WILL GONE)
exports.deleteUserByIDController = handleAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  await deleteUserByIDService(id);
  res.status(204).send();
});

// AUTHENTICATE USER UPDATE DATA (ONLY FOR LOGGED IN USERS NOT FOR ADMINS)
exports.updateAuthUserController = handleAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You cant update your password here.', 400));
  }

  const updatedUser = await updateAuthUserService(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { updatedUser },
  });
});

// AUTHANTICATE USER INACTIVE (MAKES USER INACTIVE, USER CAN RETURN WITH THEIR DATA)
exports.deactivateUserController = handleAsync(async (req, res, next) => {
  // 1) Make user's userActive ---> false (Inactive - Controller will be add later)
  // 2) Authentication is a must
  const userID = req.user.id;

  await deactivateUserService(userID);

  res.status(200).json({
    status: 'success',
    message:
      'User deactivated succesfully. Users who do not return for 1 month will be deleted from the system.',
  });
});

// AUTHANTICATE USER DELETE (DELETES USER'S ALL DATA, USER CAN'T RETURN)
exports.deleteUserController = handleAsync(async (req, res, next) => {
  // 1) Authentication is a must
  // 2) Delete user with all relations
  const userID = req.user.id;

  await deleteUserService(userID);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
