const express = require('express');

const {
  createUserController,
  updateUserController,
} = require('../controllers/userController');
const validateUser = require('../middlewares/validationMiddleware');
const { getUserById } = require('../controllers/userController');

const router = express.Router();

router.route('/').post(validateUser, createUserController);

router.route('/:id').get(getUserById).patch(updateUserController);

module.exports = router;
