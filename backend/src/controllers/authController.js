const handleAsync = require('../utils/handleAsync');
const authService = require('../services/authService');
const _ = require('lodash');

// SIGN UP USERS (EMAIL OR SMS VALIDATION NEEDED)
exports.signUpAuthUsersController = handleAsync(async (req, res, next) => {
  const newUser = await authService.signUpUsersAuthService({
    name_surname: req.body.name_surname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: 'success',
    message:
      'User signed up successfully. Please activate your account via email.',
    data: {
      newUser,
    },
  });
});

// LOGIN AUTH CONTROLLER
exports.loginAuthController = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginAuthService(email, password);

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

// FORGOT PASSWORD CONTROLLER
exports.forgotPasswordAuthController = handleAsync(async (req, res, next) => {
  const email = req.body.email;
  await authService.forgotPasswordAuthService(email);

  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent.',
  });
});

// RESET PASSWORD AUTH CONTROLLER
exports.resetPasswordAuthController = handleAsync(async (req, res, next) => {
  const resetToken = req.params.token;

  const { newPassword, newPasswordConfirm } = req.body;
  const { updatedUser, token } = await authService.resetPasswordAuthService(
    resetToken,
    newPassword,
    newPasswordConfirm,
  );

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: _.omit(updatedUser, [
        'password',
        'id',
        'createdAt',
        'passwordChangedAt',
        'userRole',
        'passwordResetToken',
        'passwordResetExpires',
      ]),
    },
  });
});

// UPDATED USER PASSWORD (CLIENT VERSION) (ONLY FOR LOGGED IN USERS)
exports.updatePasswordAuthController = handleAsync(async (req, res, next) => {
  const userID = req.params.id;
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const { updatedUser, token } = await authService.updatePasswordAuthService(
    userID,
    currentPassword,
    newPassword,
    newPasswordConfirm,
  );

  res.status(200).json({
    status: 'success',
    token,
    data: {
      updatedUser,
    },
  });
});

// UPDATE EMAIL CONTROLLER (ONLY FOR LOGGED IN USERS)
exports.updateEmailAuthController = handleAsync(async (req, res, next) => {
  const userID = req.params.id;
});
