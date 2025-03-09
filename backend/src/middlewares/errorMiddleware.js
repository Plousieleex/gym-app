const { Prisma } = require('@prisma/client');
const AppError = require('../utils/appError');

const handlePrismaClientValidationErrorDB = () => {
  const message = `Invalid input.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = err.message || 'Duplicate value error.';
  return new AppError(message, 400);
};

const handleRecordNotFoundError = (err) => {
  const message = err.meta.cause || 'Record not found.';
  return new AppError(message, 404);
};

const handlePrismaClientInitializationError = (err) => {
  const message = 'Something gone bad.';
  return new AppError(message, 500);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign({}, err);
    if (error.name === 'PrismaClientValidationError')
      error = handlePrismaClientValidationErrorDB();
    if (error.code === 'P2002') error = handleDuplicateFieldsDB(error);
    if (error.code === 'P2025') error = handleRecordNotFoundError(error);
    if (error.name === 'PrismaClientInitializationError')
      error = handlePrismaClientInitializationError(error);
    sendErrorProd(error, res);
  }
};
