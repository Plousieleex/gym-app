const { getGoogleAuthUrl } = require('../config/oauth');
const crypto = require('crypto');
const oauthService = require('../services/oauthService');
const { signTokenGoogle } = require('../utils/jwt');
const AppError = require('../utils/appError');

const oauthController = {
  googleLogin(req, res) {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;
    const url = getGoogleAuthUrl(state);
    res.redirect(url);
  },

  async googleCallback(req, res, next) {
    try {
      const { code, state } = req.query;

      if (!state || state !== req.session.oauthState) {
        next(new AppError('Invalid user or password.', 400));
      }
      delete req.session.oauthState;

      const tokens = await oauthService.getGoogleTokenFromCode(code);
      const userInfo = await oauthService.getGoogleInfo(tokens);
      const user = await oauthService.findOrCreateUser(
        userInfo,
        tokens,
        'google',
      );

      const token = signTokenGoogle(user.id, user.email);

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
