const handleAsync = require('../../utils/handleAsync');
const authService = require('./auth.service');
const _ = require('lodash');

exports.signUpAuthController = handleAsync(async (req, res, next) => {
  const newUser = await authService.signUpAuthService({
    name_surname: req.body.name_surname,
    email: req.body.email,
    phone_number: req.body.phone_number,
    username: req.body.username,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  res.status(201).json({
    status: 'success',
    message:
      'User signed up successfully. Please activate your account via activation code.',
    data: newUser,
  });
});

exports.loginWithEmailController = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginWithEmailAuthService(
    email,
    password,
  );

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

exports.loginWithPhoneNumberController = handleAsync(async (req, res, next) => {
  const { phone_number, password } = req.body;
  const { user, token } = await authService.loginWithPhoneNumberAuthService(
    phone_number,
    password,
  );

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

exports.sendSixDigitTokenToEmail = handleAsync(async (req, res, next) => {
  const email = req.body.email;

  await authService.sendSixDigitTokenToEmail(email);

  res.status(201).json({
    status: 'success',
    message: 'Login code sent.',
  });
});

exports.checkSixDigitTokenForLoginController = handleAsync(
  async (req, res, next) => {
    const sixDigitToken = req.body.token;

    const { user, token } = await authService.checkSixDigitTokenForLoginService(
      sixDigitToken,
    );

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  },
);
