const handleAsync = require('../utils/handleAsync');
const APIFeatures = require('../utils/apiFeatures');

const userService = require('../services/userService');

// CREATE USER CONTROLLER (FOR ADMIN USAGE --> MAKE PROTECTED)
exports.createUserController = handleAsync(async (req, res, next) => {
  const newUser = await userService.createUserService({
    name_surname: req.body.name_surname,
    email: req.body.email,
    password: req.body.password,
    userRole: req.body.userRole,
  });

  res.status(201).json({
    status: 'success',
    data: newUser,
  });
});

// GET ALL USERS (FOR ADMIN USAGE --> MAKE PROTECTED)
exports.getAllUsersController = handleAsync(async (req, res, next) => {
  const feature = new APIFeatures('users', req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = feature.execute();

  res.status(201).json({
    status: 'success',
    data: users,
  });
});

// GET USER BY ID (FOR ADMIN USAGE --> MAKE PROTECTED)
exports.getUserByIDController = handleAsync(async (req, res, next) => {
  const userID = Number(req.params.id);
  const user = await userService.getUserByIDService({ userID });

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

// UPDATE USER BY ID (FOR ADMIN USAGE --> MAKE PROTECTED)
exports.updateUserByIDController = handleAsync(async (req, res, next) => {
  const userID = Number(req.params.id);
  const updatedUser = await userService.updateUserByIDService(userID, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// DELETE USER BY ID (ADMIN MANUAL DELETE / ALL DATA WILL GONE --> MAKE PROTECTED)
exports.deleteUserByIDController = handleAsync(async (req, res, next) => {
  const userID = Number(req.params.id);
  await userService.deleteUserByIDService(userID);

  res.status(204).json();
});

// AUTHENTICATE USER UPDATE DATA (ONLY FOR LOGGED IN USERS NOT FOR ADMINS)
exports.updateAuthUserController = handleAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Can\t update password.', 400));
  }

  const updatedUser = await userService.updateAuthUserService(
    req.user.id,
    req.body,
  );

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

// AUTHENTICATE USER INACTIVE (MAKES USER INACTIVE, USER CAN RETURN WITH THEIR DATA)
exports.deactivateUserController = handleAsync(async (req, res, next) => {
  const userID = req.user.id;

  await userService.deactivateUserService(userID);

  res.status(200).json({
    status: 'success',
    message:
      'User deactivated successfully. Users who do not return for 1 month will be deleted from the system permanently.',
  });
});

// AUTHENTICATE USER DELETE (DELETES USER'S ALL DATA, USER CAN'T RETURN)
exports.deleteUserPermanentlyController = handleAsync(
  async (req, res, next) => {
    const userID = req.user.id;

    await userService.deleteUserPermanentlyService(userID);

    res.status(204).json({
      status: 'success',
      message: 'User deleted permanently.',
      data: null,
    });
  },
);

// USER ACTIVATION BY EMAIL (EMAIL SENDING IS HANDLING IN AUTH SERVICE)
exports.activateAccountUserController = handleAsync(async (req, res, next) => {
  const { activationToken } = req.params;
  const { updatedUser, token } =
    await userService.activateAccountUserService(activationToken);

  res.status(200).json({
    status: 'success',
    message: 'User activated successfully.',
    token,
    data: { updatedUser },
  });
});
