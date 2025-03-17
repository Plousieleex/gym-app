const { PrismaClient } = require('@prisma/client');
const prisma = global.prisma || new PrismaClient();
global.prisma = prisma;

const { google } = require('googleapis');
const { createConnection } = require('../config/oauth');
const { encrypt, decrypt } = require('../utils/encryption');

const oauthService = {
  async getGoogleTokenFromCode(code) {
    const auth = createConnection();
    const { tokens } = await auth.getToken(code);
    return tokens;
  },

  async getGoogleInfo(tokens) {
    const auth = createConnection();
    auth.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();
    return data;
  },

  async findOrCreateUser(userInfo, tokens, provider = 'google') {
    let user = await prisma.users.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.users.create({
        data: {
          email: userInfo.email,
          name_surname:
            userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
          userActive: true,
          provider,
        },
      });
    }

    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null;

    const existingOAuthUser = await prisma.user_oauth_providers.findFirst({
      where: {
        usersId: user.id,
        provider,
      },
    });

    if (existingOAuthUser) {
      await prisma.user_oauth_providers.update({
        where: { id: existingOAuthUser.id },
        data: {
          provider_id: userInfo.id,
          access_token_iv: encryptedAccessToken.iv,
          access_token_content: encryptedAccessToken.content,
          refresh_token_iv: encryptedRefreshToken?.iv || null,
          refresh_token_content: encryptedRefreshToken?.content || null,
          token_expires: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.user_oauth_providers.create({
        data: {
          usersId: user.id,
          provider,
          provider_id: userInfo.id,
          access_token_iv: encryptedAccessToken.iv,
          access_token_content: encryptedAccessToken.content,
          refresh_token_iv: encryptedRefreshToken?.iv || null,
          refresh_token_content: encryptedRefreshToken?.content || null,
          token_expires: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
        },
      });
    }

    return user;
  },
};

module.exports = oauthService;
