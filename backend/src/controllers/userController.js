const { registerUser } = require('../services/userService');

exports.registerUserController = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
