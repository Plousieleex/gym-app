const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const jwt = require('../utils/jwt');
const crypto = require('crypto');
const resetTokens = require('../utils/resetTokens');
const sendEmail = require('../utils/email');
const twilio = require('twilio');

// SIGN UP USERS SERVICE
exports.signUpUsersAuthService = async ({
  name_surname,
  phone_number,
  email,
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
    throw new AppError('Passwords do not match', 401);
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
        password,
        activationToken: hashedFinalRandomCode,
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail({
      email: newUser.email,
      subject: 'Activation Code.',
      message: `Your activation code: ${activationSixDigitToken}`,
    });

    return { newUser };
  } catch (err) {
    await prisma.users.deleteMany({ where: { email: email } });

    throw new AppError('User creation failed. Try again later.', 500);
  }
};

// LOGIN AUTH SERVICE
// LOGIN WITH EMAIL
exports.loginAuthWithEmailService = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide an email or password.', 400);
  }

  let user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (!user.isActivated) {
    throw new AppError('Please activate your account.', 400);
  }

  if (!user.userActive) {
    user = await prisma.users.update({
      where: { id: user.id },
      data: {
        userActive: true,
        deletedAt: null,
        lastLogoutAt: null,
      },
    });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  delete user.password;

  const token = jwt.signTokenLocal(user.id, user.userRole);

  return { user, token };
};

// LOGIN AUTH SERVICE
// LOGIN WITH PHONE NUMBER
exports.loginAuthWithPhoneNumberService = async (phone_number, password) => {
  if (!phone_number || !password) {
    throw new AppError('Please provide a phone number.', 400);
  }

  let user = await prisma.users.findUnique({
    where: { phone_number: phone_number },
  });

  if (!user.isActivated) {
    throw new AppError('Please activate your account.', 401);
  }

  if (!user.userActive) {
    user = await prisma.users.update({
      where: { id: user.id },
      data: {
        userActive: true,
        deletedAt: null,
        lastLogoutAt: null,
      },
    });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid phone number or password.', 401);
  }

  delete user.password;

  const token = jwt.signTokenLocal(user.id, user.userRole);

  return { user, token };
};

// SEND SIX DIGIT CODE FOR LOGIN
// USES EMAIL SERVICE TO SEND TOKEN
exports.sendSixDigitTokenToEmailService = async (email) => {
  if (!email) {
    throw new AppError('Please provide an email.', 400);
  }

  let user = await prisma.users.findUnique({
    where: { email: email },
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
    user = await prisma.users.update({
      where: { id: user },
      data: {
        loginSixDigitToken: hashedFinalRandomCode,
        loginSixDigitTokenExpires: new Date(
          Date.now() + 5 * 60 * 1000,
        ).toISOString(),
      },
    });

    await sendEmail({
      email: user.email,
      subject: 'Login Code',
      message: `${loginCode}`,
    });
  } catch (err) {
    throw new AppError('Cant send the code. Please try again later.', 500);
  }
};
/*
const supabase = require('../utils/supabase');
const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const jwt = require('../utils/jwt');
const crypto = require('crypto');
const resetTokens = require('../utils/resetTokens');
const sendEmail = require('../utils/email');

// SIGN UP USERS SERVICE (EMAIL OR SMS VALIDATION NEEDED)
exports.signUpUsersAuthService = async ({
  name_surname,
  email,
  password,
  passwordConfirm,
}) => {
  const existingUser = await prisma.users.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new AppError('User already exists.', 401);
  }

  if (!(password === passwordConfirm)) {
    throw new AppError('Passwords do not match.', 401);
  }

  password = await bcrypt.hash(password, 12);
  delete passwordConfirm;

  try {
    const { activationToken, activationTokenHashed } =
      await resetTokens.createActivationToken();

    const newUser = await prisma.users.create({
      data: {
        name_surname,
        email,
        password,
        activationToken: activationTokenHashed,
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const activationLink = `${process.env.APPLICATION_URL}/api/v1/users/activate/${activationToken}`;

    await sendEmail({
      email: newUser.email,
      subject: 'Activation Link.',
      message: `Please click to activate your account: ${activationLink}`,
    });

    return { newUser };
  } catch (error) {
    await prisma.users.deleteMany({ where: email });

    throw new AppError('User creation failed. Try again.', 500);
  }
};

// LOGIN AUTH SERVICE
exports.loginAuthService = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide an email or password.', 400);
  }

  let user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (!user.isActivated) {
    throw new AppError('Please activate your account.', 400);
  }

  if (!user.userActive) {
    user = await prisma.users.update({
      where: { id: user.id },
      data: {
        userActive: true,
        deletedAt: null,
        lastLogoutAt: null,
      },
    });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  delete user.password;

  const token = jwt.signTokenLocal(user.id, user.userRole);

  return { user, token };
};

exports.activateAccountAuthService = async (activationToken) => {
  const activationHashedToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');

  const user = await prisma.users.findFirst({
    where: {
      activationToken: activationHashedToken,
    },
  });

  if (!user || user.activationTokenExpires < new Date()) {
    throw new AppError('Token is invalid or has expired. Please resend.', 400);
  }

  const updatedUser = await prisma.users.update({
    where: { id: user.id },
    data: {
      isActived: true,
      userActive: true,
      activationToken: null,
      activationTokenExpires: null,
    },
  });

  const token = jwt.signTokenLocal(updatedUser.id, updatedUser.userRole);

  return { updatedUser, token };
};

exports.resendActivationTokenAuthService = async (email) => {
  const user = await prisma.users.findUnique({
    where: {
      email: email,
      isActivated: false,
      activationTokenExpires: { gte: Date.now() },
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!user.isActivated || user.activationTokenExpires > new Date()) {
    throw new AppError('Token is not expired or user activated.', 400);
  }

  const { activationToken, activationTokenHashed } =
    await resetTokens.createActivationToken();

  const activationLink = `${process.env.APPLICATION_URL}/api/v1/users/activate/${activationToken}`;

  try {
    await prisma.users.update({
      where: { id: user.id },
      data: {
        activationToken: activationTokenHashed,
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail({
      email: user.email,
      subject: 'Activation Link Resend.',
      message: `Please click to activate your account: ${activationLink}`,
    });
  } catch (error) {
    throw new AppError('Please, resend again.', 500);
  }
};

/!*
const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const jwt = require('../utils/jwt');
const crypto = require('crypto');
const passwordResetToken = require('../utils/passwordResetToken');
const sendEmail = require('../utils/email');
const { token } = require('morgan');

// SIGN UP USERS SERVICE
exports.signUpUsersAuthService = async ({
  name_surname,
  email,
  password,
  passwordConfirm,
}) => {
  const existingUser = await prisma.users.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new AppError('User already exists', 401);
  }

  if (!(password === passwordConfirm)) {
    throw new AppError('Passwords do not match', 401);
  }

  password = await bcrypt.hash(password, 12);
  delete passwordConfirm;

  try {
    const { activationToken, activationHashedToken } =
      await passwordResetToken.createActivationToken();

    console.log('activationToken', activationToken);
    console.log('activationHashedToken', activationHashedToken);

    const newUser = await prisma.users.create({
      data: {
        name_surname,
        email,
        password,
        activationToken: activationHashedToken,
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const activationLink = `${process.env.APPLICATION_URL}/api/v1/users/activate/${activationToken}`;

    await sendEmail({
      email: newUser.email,
      subject: 'Activate Your Account!',
      message: `Please click to activate your account: ${activationLink}`,
    });

    return { newUser };
  } catch (error) {
    await prisma.users.deleteMany({ where: { email } });

    throw new AppError('User creation failed.', 500);
  }
};

// LOGIN AUTH SERVICE
exports.loginAuthService = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide an email or password', 400);
  }

  let user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (!user.isActivated) {
    throw new AppError('Please activate your account', 401);
  }

  if (!user.userActive) {
    user = await prisma.users.update({
      where: { id: user.id },
      data: {
        userActive: true,
        deletedAt: null,
        lastLogoutAt: null,
      },
    });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  delete user.password;

  const token = jwt.signTokenLocal(user.id, user.userRole);

  return { user, token };
};

// FORGOT PASSWORD SERVICE (TAKES EMAIL, THIS IS NOT A RESET OR CHANGE)
exports.forgotPasswordAuthService = async (email) => {
  const user = await prisma.users.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AppError('Invalid email.', 404);
  }

  const { resetToken, hashedToken } =
    await passwordResetToken.createPasswordResetToken();
  const updatedUser = await prisma.users.update({
    where: { email: email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    },
  });

  const resetURL = `${process.env.APPLICATION_URL}/api/v1/auth/resetPassword/${resetToken}`;

  await sendEmail({
    email: updatedUser.email,
    subject: 'Password Reset',
    message: `Password reset link: ${resetURL}`,
  });
};

// RESET PASSWORD AUTH SERVICE
exports.resetPasswordAuthService = async (
  resetToken,
  newPassword,
  newPasswordConfirm,
) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await prisma.users.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gte: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired.', 401);
  }

  if (newPassword !== newPasswordConfirm) {
    throw new AppError("Passwords doesn't match", 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const updatedUser = await prisma.users.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date(),
    },
  });

  const token = jwt.signTokenLocal(user.id, user.userRole);

  return { updatedUser, token };
};

// UPDATED USER PASSWORD (CLIENT VERSION) (ONLY FOR LOGGED IN USERS)
exports.updatePasswordAuthService = async (
  userID,
  currentPassword,
  newPassword,
  newPasswordConfirm,
) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError('Invalid user or password.', 400);
  }

  if (newPassword !== newPasswordConfirm) {
    throw new AppError('Passwords do not match', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.users.update({
    where: { id: userID },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  const token = jwt.signTokenLocal(updatedUser.id, updatedUser.userRole);

  return { updatedUser, token };
};

exports.changedPasswordAfterAuthService = async (userID, JWTTimeStamp) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
    select: { passwordChangedAt: true },
  });

  if (!user || !user.passwordChangedAt) return false;

  const changedTimeStamp = parseInt(
    user.passwordChangedAt.getTime() / 1000,
    10,
  );

  return JWTTimeStamp < changedTimeStamp;
};
*!/
*/
