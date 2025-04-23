const handleAsync = require('../utils/handleAsync');
const authService = require('../services/authService');
const _ = require('lodash');

// SIGN UP USERS (EMAIL OR SMS VALIDATION NEEDED ---> SIX DIGIT CODE)
exports.signUpAuthUsersController = handleAsync(async (req, res, next) => {
  const newUser = await authService.signUpUsersAuthService({
    name_surname: req.body.name_surname,
    email: req.body.email,
    phone_number: req.body.phone_number,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  res.status(201).json({
    status: 'success',
    message:
      'User signed up successfully. Please activate your account via activation code.',
    data: {
      newUser,
    },
  });
});

// LOGIN AUTH CONTROLLER
// LOGIN WITH EMAIL
exports.loginAuthWithEmailController = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginAuthWithEmailService(
    email,
    password,
  );

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

// LOGIN AUTH CONTROLLER
// LOGIN WITH PHONE NUMBER
exports.loginAuthWithPhoneNumberController = handleAsync(
  async (req, res, next) => {
    const { phone_number, password } = req.body;
    const { user, token } = await authService.loginAuthWithPhoneNumberService(
      phone_number,
      password,
    );

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  },
);

// SEND SIX DIGIT CODE FOR LOGIN
// USES EMAIL SERVICE TO SEND TOKEN
exports.sendSixDigitTokenToEmailLoginController = handleAsync(
  async (req, res, next) => {
    const email = req.body.email;

    await authService.sendSixDigitTokenToEmailService(email);

    res.status(201).json({
      status: 'success',
      message: 'Login code sent.',
    });
  },
);

// CHECK SIX DIGIT CODE FOR LOGIN
exports.checkSixDigitTokenLoginController = handleAsync(
  async (req, res, next) => {
    const sixDigitToken = req.body.token;

    const { user, token } =
      await authService.checkSixDigitTokenLoginService(sixDigitToken);

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  },
);
/*
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

exports.activateAccountAuthController = handleAsync(async (req, res, next) => {
  const activationToken = req.params.token;

  const { updatedUser, token } =
    await authService.activateAccountAuthService(activationToken);

  res.status(200).json({
    status: 'success',
    message: 'User activated successfully.',
    token,
    data: { updatedUser },
  });
});

exports.resendActivationTokenAuthController = handleAsync(
  async (req, res, next) => {
    const email = req.body.email;

    await authService.resendActivationTokenAuthService(email);

    res.status(200).json({
      status: 'success',
      message: 'Activation link resent successfully.',
    });
  },
);
/!*
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
*!/
*/
