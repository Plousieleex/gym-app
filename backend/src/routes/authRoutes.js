const express = require('express');

const validateUser = require('../middlewares/validationMiddleware');
const {
  signUpAuthController,
  loginAuthController,
  forgotPasswordAuthController,
  resetPasswordAuthController,
  updatePasswordAuthController,
} = require('../controllers/authController');
const { authProtectMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/signup').post(validateUser, signUpAuthController);
router.route('/login').post(loginAuthController);

router.route('/forgotPassword').post(forgotPasswordAuthController);
router.route('/resetPassword/:token').patch(resetPasswordAuthController);

router
  .route('/changePassword')
  .patch(authProtectMiddleware, updatePasswordAuthController);

module.exports = router;
