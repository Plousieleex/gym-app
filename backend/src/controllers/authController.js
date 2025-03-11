const handleAsync = require('../utils/handleAsync');
const { createUserService } = require('../services/userService');
const AppError = require('../utils/appError');
const _ = require('lodash');
const {
  loginAuthService,
  signUpAuthService,
  forgotPasswordAuthService,
  resetPasswordAuthService,
} = require('../services/authService');

// SIGN UP USERS
exports.signUpAuthController = handleAsync(async (req, res, next) => {
  // AUTH SERVICE SIGN UP
  const newUser = await signUpAuthService({
    name_surname: req.body.name_surname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  res.status(201).json({
    status: 'success',
    data: {
      newUser,
    },
  });
});

exports.loginAuthController = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await loginAuthService(email, password);
  /* 
  1) Check if email and password exist

  2) Check if user exists && password is correct

  3) If everything ok, send token to client
  */
  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });

  // AUTH SERVICE LOGIN
});

// FORGOT PASSWORD CONTROLLER
exports.forgotPasswordAuthController = handleAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const resetURL = await forgotPasswordAuthService(req.body.email);
  // 2) Generate the random reset token
  // 3) Send it to user's email

  res.status(200).json({
    status: 'success',
    message: 'Password reset URL sent!',
  });
});

// RESET PASSWORD AUTH CONTROLLER
exports.resetPasswordAuthController = handleAsync(async (req, res, next) => {
  const resetToken = req.params.token;
  const { newPassword, newPasswordConfirmation } = req.body;

  const { updatedUser, token } = await resetPasswordAuthService(
    resetToken,
    newPassword,
    newPasswordConfirmation,
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
