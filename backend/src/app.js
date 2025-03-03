const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorMiddleware = require('./middlewares/errorMiddleware');
// Routers

const userRouter = require('./routes/userRoutes');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// Routes (NOT ROUTERS)
app.use('/api/v1/users', userRouter);

// UNHANDLED ROUTE HANDLER
app.all('*', (req, res, next) => {
  next(new AppError('PAGE NOT FOUND.', 404));
});

app.use(errorMiddleware);

module.exports = app;
