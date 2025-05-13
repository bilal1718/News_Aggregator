const nodemailer = require('nodemailer');

let transporter;

const initTransporter = () => {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email function
exports.sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    initTransporter();
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"News Aggregator" <news@yourdomain.com>',
    to,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
};