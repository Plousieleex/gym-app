const { getGoogleAuthUrl } = require('../config/oauth');
const oauthService = require('../services/oauthService');
const jwt = require('jsonwebtoken');

const oauthController = {
  googleLogin(req, res) {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  },

  async googleCallback(req, res) {
    try {
      const { code } = req.query;
      const tokens = await oauthService.getGoogleTokenFromCode(code);
      const userInfo = await oauthService.getGoogleInfo(tokens);
      const user = await oauthService.findOrCreateUser(
        userInfo,
        tokens,
        'google',
      );

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
      );

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Strict',
      });

      res.json({
        message: 'Login Successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name_surname,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Interval server error.' });
    }
  },
};

module.exports = oauthController;
