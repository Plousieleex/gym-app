const handleAsync = require('../utils/handleAsync');
const { createUserService } = require('../services/userService');

// SIGN UP USERS
exports.signUpAuthController = handleAsync(async (req, res, next) => {
  const newUser = await createUserService({
    name_surname: req.body.name_surname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: 'success',
    data: { newUser },
  });
});

exports.loginAuthController = handleAsync(async (req, res, next) => {
  const { email, password } = req.body.email;

  /* 
  1) Check if email and password exist

  2) Check if user exists && password is correct

  3) If everything ok, send token to client
  */
});
