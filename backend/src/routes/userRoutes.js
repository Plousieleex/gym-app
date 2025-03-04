const express = require('express');

const {
  createUserController,
  updateUserController,
  deleteUserController,
  getAllUsersController,
} = require('../controllers/userController');
const validateUser = require('../middlewares/validationMiddleware');
const { getUserById } = require('../controllers/userController');

const router = express.Router();

router
  .route('/')
  .get(getAllUsersController)
  .post(validateUser, createUserController);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserController)
  .delete(deleteUserController);

module.exports = router;
