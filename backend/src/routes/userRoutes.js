const express = require('express');

const { registerUserController } = require('../controllers/userController');

const router = express.Router();

router.route('/').post(registerUserController);

module.exports = router;
