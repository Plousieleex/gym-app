const Joi = require('joi');
const AppError = require('../utils/appError');

const userSchema = Joi.object({
  name_surname: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .regex(/(?=.*[a-z])/)
    .regex(/(?=.*[A-Z])/)
    .regex(/(?=.*\d)/)
    .regex(/(?=.*[?!@#$%^&*])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters.',
      'string.pattern.base':
        'Password must contain one capital letter, one number and one special character.',
    }),
});

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return next(new AppError('Invalid credits.', 400));
  }
  next();
};

module.exports = validateUser;
