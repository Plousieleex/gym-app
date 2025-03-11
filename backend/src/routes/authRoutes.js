const express = require('express');

const validateUser = require('../middlewares/validationMiddleware');
const {
  signUpAuthController,
  loginAuthController,
  forgotPasswordAuthController,
  resetPasswordAuthController,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(validateUser, signUpAuthController);
router.route('/login').post(loginAuthController);

router.route('/forgotPassword').post(forgotPasswordAuthController);
router.route('/resetPassword/:token').patch(resetPasswordAuthController);

module.exports = router;
