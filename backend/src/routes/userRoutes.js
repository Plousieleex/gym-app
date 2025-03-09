const express = require('express');

const { signUpAuthController } = require('../controllers/authController');

const {
  getAllUsersController,
  getUserByIDController,
  updateUserByIDController,
  deleteUserByIDController,
} = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(signUpAuthController);

router.route('/').get(getAllUsersController);

router
  .route('/:id')
  .get(getUserByIDController)
  .patch(updateUserByIDController)
  .delete(deleteUserByIDController);

module.exports = router;
