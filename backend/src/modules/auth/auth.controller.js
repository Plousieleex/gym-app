import handleAsync from '../../utils/handleAsync.js';
import authService from './auth.service.js';
import _ from 'lodash';

export const signUpAuthController = handleAsync(async (req, res, next) => {
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

export const loginWithEmailController = handleAsync(async (req, res, next) => {
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

export const loginWithPhoneNumberController = handleAsync(
  async (req, res, next) => {
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
  },
);

export const sendSixDigitTokenToEmail = handleAsync(async (req, res, next) => {
  const email = req.body.email;

  await authService.sendSixDigitTokenToEmail(email);

  res.status(201).json({
    status: 'success',
    message: 'Login code sent.',
  });
});
//fix
export const checkSixDigitTokenForLoginController = handleAsync(
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

export const checkSixDigitTokenForActivateUser = handleAsync(
  async (req, res, next) => {
    const userID = req.body.id;
    const sixDigitToken = req.body.token;

    const { user, token } = await authService.checkSixDigitTokenForActivateUser(
      userID,
      sixDigitToken,
    );

    res.status(200).json({
      status: 'success',
      token,
      data: user,
    });
  },
);

export default {
  signUpAuthController,
  loginWithEmailController,
  loginWithPhoneNumberController,
  sendSixDigitTokenToEmail,
  checkSixDigitTokenForLoginController,
  checkSixDigitTokenForActivateUser,
};
