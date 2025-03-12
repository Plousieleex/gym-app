const express = require('express');

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

module.exports = router;
