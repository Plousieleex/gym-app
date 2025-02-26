const bcrypt = require('bcrypt');
const { createUser } = require('../models/userModel');

exports.registerUser = async userData => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;

  const newUser = await createUser(userData);

  return newUser;
};
