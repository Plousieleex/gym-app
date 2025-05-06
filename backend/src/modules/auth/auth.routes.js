import { Router } from 'express';
import authController from './auth.controller.js';
import authMiddleware from './auth.middleware.js';

const router = Router();

router.route('/signup').post(authController.signUpAuthController);
router
  .route('/signup/activate')
  .post(authController.checkSixDigitTokenForActivateUser);

router.route('/login/email').post(authController.loginWithEmailController);
router
  .route('/login/phone')
  .post(authController.loginWithPhoneNumberController);

router
  .route('/login/sendcodetoemail')
  .post(authController.sendSixDigitTokenToEmail);

router
  .route('/login/checkcode')
  .post(authController.checkSixDigitTokenForLoginController);

export default router;
