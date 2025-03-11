const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const { signToken } = require('../utils/jwt');
const { createPasswordResetToken } = require('../utils/passwordResetToken');
const sendEmail = require('../utils/email');

// REGISTER / SIGN UP SERVICE
exports.signUpAuthService = async ({
  name_surname,
  email,
  password,
  passwordConfirmation,
}) => {
  const existingUser = await prisma.users.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new AppError('Invalid email.', 401);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  password = hashedPassword;
  delete passwordConfirmation;
  const newUser = await prisma.users.create({
    data: {
      name_surname,
      email,
      password,
    },
  });
  const token = signToken(newUser.id);

  return { newUser, token };
};

// LOGIN SERVICE
exports.loginAuthService = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password.', 400);
  }

  const user = await prisma.users.findUnique({
    where: { email: email },
    omit: {
      id: true,
      createdAt: true,
      passwordChangedAt: true,
      userRole: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  delete user.password;

  const token = signToken(user.id);
  return { user, token };
};

// CHANGED PASSWORD AFTER SERVICE
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

// FORGOT PASSWORD SERVICE (NOT RESET, FORGOT, IT TAKES EMAIL)
exports.forgotPasswordAuthService = async (email) => {
  const user = await prisma.users.findUnique({
    where: { email: email },
  });
  if (!user) {
    throw new AppError('Invalid email.', 404);
  }

  const { resetToken, hashedToken } = await createPasswordResetToken();

  const updateUser = await prisma.users.update({
    where: { email: user.email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    },
  });

  const resetURL = `http://localhost:3000/api/v1/auth/resetPassword/${resetToken}`;

  await sendEmail({
    email: updateUser.email,
    subject: 'Password reset.',
    message: `Password reset link: ${resetURL}`,
  });

  return resetURL;
};

// RESET PASSWORD BASED UPON USER TOKEN
exports.resetPasswordAuthService = async (
  resetToken,
  newPassword,
  newPasswordConfirmation,
) => {
  // 1) Get user based on the token
  // 2) If token has not expired, and there is user, set the new password
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  const user = await prisma.users.findFirst({
    where: {
      passwordResetExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid token or user does not exist.', 400);
  }

  const isTokenValid = await bcrypt.compare(
    resetToken,
    user.passwordResetToken,
  );

  if (!isTokenValid) {
    throw new AppError('Invalid or expired token.', 400);
  }

  if (newPassword !== newPasswordConfirmation) {
    throw new AppError('Passwords doesnt match.', 400);
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

  const token = signToken(user.id);

  return { updatedUser, token };
};
