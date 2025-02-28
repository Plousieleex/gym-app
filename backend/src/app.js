const express = require('express');
const morgan = require('morgan');
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
  res.status(404).json({
    status: 'fail',
    message: '404 PAGE NOT FOUND.',
  });
});

module.exports = app;
