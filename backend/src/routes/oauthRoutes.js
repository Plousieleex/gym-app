const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauthController');

router.get('/google', oauthController.googleLogin);
router.get('/google/callback', oauthController.googleCallback);

module.exports = router;
