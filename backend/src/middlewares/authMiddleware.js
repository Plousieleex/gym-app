const jwt = require('../utils/jwt');
const prisma = require('../config/db');
const AppError = require('../utils/appError');
const handleAsync = require('../utils/handleAsync');
const authService = require('../services/authService');

exports.authProtectMiddleware = handleAsync(async (req, res, next) => {
  // 1) Getting token and check if it's exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in.', 401));
  }

  // 2) Validate Token
  const decodedToken = await jwt.verifyToken(token);

  // 3) Check if user still exists
  const currentUser = await prisma.users.findUnique({
    where: { id: decodedToken.id },
  });

  if (!currentUser) {
    return next(new AppError('This user is not exist.', 401));
  }

  // 4) Check user is inactive or logout
  if (
    !currentUser.userActive ||
    (currentUser.lastLogoutAt &&
      new Date(currentUser.lastLogoutAt > new Date(decodedToken.iat * 1000)))
  ) {
    return next(
      new AppError('Account is inactive or logged out. Login again.', 403),
    );
  }

  // 5) Check if user changed password (local users)
  if (decodedToken.provider === 'local') {
    const hasChanged = await authService.changedPasswordAfterAuthService(
      decodedToken.id,
      decodedToken.iat,
    );

    if (hasChanged) {
      return next('User recently changed password. Log in again.', 401);
    }
  }

  req.user = currentUser;
  next();
});
