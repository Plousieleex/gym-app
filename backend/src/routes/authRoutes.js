const express = require('express');

const validateUser = require('../middlewares/validationMiddleware');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/signup')
  .post(validateUser, authController.signUpAuthUsersController);

router
  .route('/forgotPassword')
  .post(authController.forgotPasswordAuthController);

router
  .route('/resetPassword/:token')
  .patch(authController.resetPasswordAuthController);

router
  .route('/login')
  .post(
    authMiddleware.authProtectMiddleware,
    authController.loginAuthController,
  );

router
  .route('/changePassword')
  .patch(
    authMiddleware.authProtectMiddleware,
    authController.updatePasswordAuthController,
  );
/*router.route('/login').post(loginAuthController);

router.route('/forgotPassword').post(forgotPasswordAuthController);
router.route('/resetPassword/:token').patch(resetPasswordAuthController);

router
  .route('/changePassword')
  .patch(authProtectMiddleware, updatePasswordAuthController);*/

module.exports = router;
