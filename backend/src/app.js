const express = require('express');
const morgan = require('morgan');
// Routers

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middlewares
app.use(express.json());

// Routes (NOT ROUTERS)

module.exports = app;
