const express = require('express');
const morgan = require('morgan');
// Routers

const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middlewares
app.use(express.json());

// Routes (NOT ROUTERS)
app.use('/api/v1/users', userRouter);

module.exports = app;
