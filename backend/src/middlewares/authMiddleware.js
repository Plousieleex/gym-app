const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');
const AppError = require('../utils/appError');
const handleAsync = require('../utils/handleAsync');
const { changedPasswordAfterAuthService } = require('../services/authService');

// CHECK USER LOG IN
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
    return next(
      new AppError('You are not logged in. Log in to get access.', 401),
    );
  }
  // 2) Validate token
  const decoded = await verifyToken(token);
  // 3) Check if user still exists
  const currentUser = await prisma.users.findUnique({
    where: { id: decoded.id },
  });
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }
  // 3.5) Check if user is active or inactive or logout
  if (
    !currentUser.userActive ||
    (currentUser.lastLogoutAt &&
      new Date(currentUser.lastLogoutAt > new Date(decoded.iat * 1000)))
  ) {
    return next(
      new AppError(
        'Account is inactive, dont have permission. Please login to activate.',
        403,
      ),
    );
  }
  // 4) Check if user changed password after the token was issued
  const hasChanged = await changedPasswordAfterAuthService(
    decoded.id,
    decoded.iat,
  );
  if (hasChanged) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// CHECK ADMIN ROLE
/* exports.checkAdmin = async (userID) => {
  const user = await prisma.users.findUnique({
    where: { id: userID },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
};
 */

// CHECK USER ROLE
exports.checkUserRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }

    next();
  };
};
