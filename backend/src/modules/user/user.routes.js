const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../auth/auth.middleware');

const router = express.Router();

router
  .route('/userprofile')
  .post(authMiddleware.protect, userController.createUserProfile);

module.exports = router;
