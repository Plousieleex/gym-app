const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../../utils/appError');
const jwt = require('../../utils/jwt');
const crypto = require('crypto');
const resetTokens = require('../../utils/resetTokens');
const sendEmail = require('../../utils/email');

/* 
  Takes 5 arguments.
  name_surname = User name and surname
  phone_number = User phone_number 
  email = User email
  password = User password
  passwordConfirmation = User password confirmation

  returns user, if credentials are OK
  Throws when user exists in database
  Throws when password is not equal to password confirmation
  
*/
exports.signUpAuthService = async ({
  name_surname,
  phone_number,
  email,
  username,
  password,
  passwordConfirmation,
}) => {
  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [{ email }, { phone_number }],
    },
  });

  if (existingUser) {
    throw new AppError(
      'User already exists with this email or phone number.',
      401,
    );
  }

  if (!(password === passwordConfirmation)) {
    throw new AppError('Passwords do not match.', 401);
  }

  password = await bcrypt.hash(password, 12);
  delete passwordConfirmation;

  const { finalRandomCode, hashedFinalRandomCode } =
    await resetTokens.createSixDigitToken();

  const activationSixDigitToken = `Activation Code ${finalRandomCode}`;

  try {
    const newUser = await prisma.users.create({
      data: {
        name_surname,
        email,
        phone_number,
        username,
        password,
        activationToken: hashedFinalRandomCode,
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail({
      email: newUser.email,
      subject: 'Activation Code',
      message: `${activationSixDigitToken}`,
    });

    return { newUser };
  } catch (e) {
    await prisma.users.deleteMany({ where: { email } });

    throw new AppError('User creation failed. Try again later.', 500);
  }
};

exports.loginWithEmailAuthService = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide an email or password.', 400);
  }

  const userRecord = await prisma.users.findUnique({
    where: { email },
  });

  if (!userRecord || !(await bcrypt.compare(password, userRecord.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!userRecord.isActivated) {
    throw new AppError('Please activate your account.', 400);
  }

  let userToReturn = userRecord;
  if (!userRecord.userActive) {
    try {
      userToReturn = await prisma.users.update({
        where: { id: userRecord.id },
        data: {
          userActive: true,
          deletedAt: null,
          lastLogoutAt: null,
        },
      });
    } catch (e) {
      throw new AppError(
        'Error occured when trying to activate user. Try again later.',
        500,
      );
    }
  }

  const token = jwt.signTokenLocal(userToReturn.id, userToReturn.userRole);

  return { user: userToReturn, token };
};

exports.loginWithPhoneNumberAuthService = async (phone_number, password) => {
  if (!phone_number || !password) {
    throw new AppError('Please provide a phone number and password.', 400);
  }

  const userRecord = await prisma.users.findUnique({
    where: { phone_number },
  });

  if (!userRecord || !(await bcrypt.compare(password, userRecord.password))) {
    throw new AppError('Invalid phone number or password.', 401);
  }

  if (!userRecord.isActivated) {
    throw new AppError('Please activate your account to login.', 401);
  }

  let userToReturn = userRecord;
  if (!userRecord.userActive) {
    try {
      userToReturn = await prisma.users.update({
        where: { id: userRecord.id },
        data: {
          userActive: true,
          deletedAt: null,
          lastLogoutAt: null,
        },
      });
    } catch (e) {
      throw new AppError(
        'Error occured when trying to activate user. Try again later.',
        500,
      );
    }
  }

  const token = jwt.signTokenLocal(userToReturn.id, userToReturn.userRole);

  return { user: userToReturn, token };
};

exports.sendSixDigitTokenToEmail = async (email) => {
  if (!email) {
    throw new AppError('Please provide an email.', 400);
  }

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('No user found with this email.', 401);
  }

  if (!user.isActivated) {
    throw new AppError('Please activate your account to login.', 400);
  }

  const { finalRandomCode, hashedFinalRandomCode } =
    await resetTokens.createSixDigitToken();

  const loginCode = `Your login code is here: ${finalRandomCode}`;

  try {
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        loginSixDigitToken: hashedFinalRandomCode,
        loginSixDigitTokenExpires: new Date(
          Date.now() + 5 * 60 * 1000,
        ).toISOString(),
      },
    });

    await sendEmail({
      email: updatedUser.email,
      subject: 'Login Code',
      message: `${loginCode}`,
    });
  } catch (e) {
    throw new AppError(
      'Cant send the code right now. Please try again later.',
      500,
    );
  }
};

exports.checkSixDigitTokenForLoginService = async (sixDigitToken) => {
  if (!sixDigitToken) {
    throw new AppError('Please provide your code.', 400);
  }

  const hashedSixDigitToken = crypto
    .createHash('sha256')
    .update(sixDigitToken)
    .digest('hex');

  const userRecord = await prisma.users.findFirst({
    where: {
      loginSixDigitToken: hashedSixDigitToken,
      loginSixDigitTokenExpires: { gte: new Date() },
    },
  });

  if (!userRecord) {
    throw new AppError('Code is invalid or expired.', 401);
  }

  if (!userRecord.isActivated) {
    throw new AppError('Please activate your account.', 401);
  }

  let userToReturn = userRecord;
  if (!userRecord.userActive) {
    try {
      userToReturn = await prisma.users.update({
        where: { id: userRecord.id },
        data: {
          userActive: true,
          deletedAt: null,
          lastLogoutAt: null,
        },
      });
    } catch (e) {
      throw new AppError(
        'Error occured when trying to activate user. Try again later.',
        500,
      );
    }
  }

  const token = jwt.signTokenLocal(userToReturn.id, userToReturn.userRole);

  return { user: userToReturn, token };
};

exports.changedPasswordAfterAuthService = async (id, iat) => {
  const user = prisma.users.findUnique({
    where: { id },
    select: { passwordChangedAt: true },
  });

  if (!user?.passwordChangedAt) return false;

  const changedTimeStamp = Math.floor(user.passwordChangedAt.getTime() / 1000);

  return iat < changedTimeStamp;
};
