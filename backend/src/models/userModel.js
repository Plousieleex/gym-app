const prisma = require('../config/db');

// CREATING USER
exports.createUser = async userData => {
  return await prisma.user.create({
    data: userData,
  });
};
