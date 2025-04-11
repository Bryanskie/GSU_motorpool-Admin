const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text, html) => {
  await transporter.sendMail({
    from: `"Bryan Tagaan" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};

module.exports = { sendEmail };
