const express = require('express');

const { createUserController } = require('../controllers/userController');

const router = express.Router();

router.route('/').post(createUserController);

module.exports = router;
