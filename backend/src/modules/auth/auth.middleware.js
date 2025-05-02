const prisma = require('../../config/db');
const jwt = require('../../utils/jwt');
const handleAsync = require('../../utils/handleAsync');
const AppError = require('../../utils/appError');
const authService = require('../auth/auth.service');

exports.protect = handleAsync(async (req, res, next) => {
  // 1) Getting token and check of it's exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.'),
      401,
    );
  }

  // 2) Verification Token
  const decoded = await jwt.protectVerifyToken(token);

  // 3) Check if user still exists
  const currentUser = await prisma.users.findUnique({
    where: { id: decoded.id },
  });
  if (!currentUser) {
    return next(new AppError('User or token is invalid.', 401));
  }

  if (
    !currentUser.userActive ||
    (currentUser.lastLogoutAt &&
      new Date(currentUser.lastLogoutAt > new Date(decoded.iat * 1000)))
  ) {
    return next(
      new AppError('Account is inactive or logged out. Login again.', 403),
    );
  }

  if (decoded.provider === 'local') {
    const hasChanged = await authService.changedPasswordAfterAuthService(
      decoded.id,
      decoded.iat,
    );

    if (hasChanged) {
      return next('User recently changed password. Log in again.', 401);
    }
  }

  req.user = currentUser;
  next();
});
