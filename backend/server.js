const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  // DELETE THIS CONSOLE.LOG ON PRODUCTION
  console.log(`Listening on ${port}`);
});
