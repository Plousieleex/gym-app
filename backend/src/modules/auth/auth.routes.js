const express = require('express');
const authController = require('../auth/auth.controller');
const authMiddleware = require('./auth.middleware');

const router = express.Router();

router.route('/signup').post(authController.signUpAuthController);
router
  .route('/signup/activate')
  .post(authController.checkSixDigitTokenForActivateUser);

router.route('/loginEmail').post(authController.loginWithEmailController);
router.route('/loginPhone').post(authController.loginWithPhoneNumberController);

router.route('/sendCodeToEmail').post(authController.sendSixDigitTokenToEmail);

router
  .route('/checkCode')
  .post(authController.checkSixDigitTokenForLoginController);

module.exports = router;
