import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
const { Pool } = pg;
import morgan from 'morgan';
import { setErrorMap } from 'zod';

import AppError from './utils/appError.js';
import errorMiddleware from '../middlewares/errorMiddleware.js';

// Routers
import userRouter from './modules/user/user.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import workoutRouter from './modules/workout/workout.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// PostgresSQL Session Store
const PgSessionStore = connectPgSimple(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middlewares
app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  }),
);

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/workouts', workoutRouter);

// Unhandled Route
app.all('*', (req, res, next) => {
  next(new AppError('PAGE NOT FOUND.', 404));
});

// Global Error Middleware
app.use(errorMiddleware);

export default app;
