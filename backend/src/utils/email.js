const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(options.email);
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'GYM APP <hello@gymapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log(mailOptions);
  // 3) Actually send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
