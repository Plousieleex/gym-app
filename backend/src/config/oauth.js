const { google } = require('googleapis');

// CONFIGURATIONS
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
};

const createConnection = () => {
  return new google.auth.OAuth2(
    googleConfig.clientID,
    googleConfig.clientSecret,
    googleConfig.redirectUri,
  );
};

const defaultScope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

const getConnectionUrl = (auth) => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope,
  });
};

const getGoogleAuthUrl = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
};

module.exports = { createConnection, getGoogleAuthUrl };
