/*
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router
  .route('/activate/:token')
  .get(userController.activateAccountUserController);

router.route('/updateUser').patch(userController.updateAuthUserController);
router
  .route('/deactivateUser')
  .patch(
    authMiddleware.authProtectMiddleware,
    userController.deactivateUserController,
  );
router
  .route('/deleteUser')
  .delete(userController.deleteUserPermanentlyController);

router
  .route('/')
  .get(userController.getAllUsersController)
  .post(userController.createUserController);

router
  .route('/:id')
  .get(userController.getUserByIDController)
  .patch(userController.updateUserByIDController)
  .delete(userController.deleteUserByIDController);

module.exports = router;

/!*const express = require('express');

const {
  getAllUsersController,
  getUserByIDController,
  updateUserByIDController,
  deleteUserByIDController,
  createUserController,
  updateAuthUserController,
  deactivateUserController,
  deleteUserController,
} = require('../controllers/userController');

const {
  authProtectMiddleware,
  checkUserRole,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.patch('/updateUser', authProtectMiddleware, updateAuthUserController);
router.patch(
  '/deactivateUser',
  authProtectMiddleware,
  deactivateUserController,
);
router.delete('/deleteUser', authProtectMiddleware, deleteUserController);

router
  .route('/')
  .get(authProtectMiddleware, checkUserRole('ADMIN'), getAllUsersController)
  .post(authProtectMiddleware, checkUserRole('ADMIN'), createUserController);

router
  .route('/:id')
  .get(authProtectMiddleware, checkUserRole('ADMIN'), getUserByIDController)
  .patch(
    authProtectMiddleware,
    checkUserRole('ADMIN'),
    updateUserByIDController,
  )
  .delete(
    authProtectMiddleware,
    checkUserRole('ADMIN'),
    deleteUserByIDController,
  );

module.exports = router;*!/
*/
