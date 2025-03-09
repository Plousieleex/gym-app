const dotenv = require('dotenv');

/* process.on('uncaughtException', () => {
  process.exit(1);
}); */

dotenv.config({ path: './.env' });
const app = require('./src/app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  // DELETE THIS CONSOLE.LOG ON PRODUCTION
  console.log(`Listening on ${port}`);
});

process.on('unhandledRejection', (err) => {
  server.close(() => {
    process.exit(1);
  });
});
