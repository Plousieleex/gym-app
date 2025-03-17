const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorMiddleware = require('./middlewares/errorMiddleware');
// Routers

const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const oauthRouter = require('./routes/oauthRoutes');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  }),
);

// Routes (NOT ROUTERS)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/oauth', oauthRouter);

// UNHANDLED ROUTE HANDLER
app.all('*', (req, res, next) => {
  next(new AppError('PAGE NOT FOUND.', 404));
});

app.use(errorMiddleware);

module.exports = app;
