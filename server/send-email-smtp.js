import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export default async function sendResetEmailHandler(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password',
    text: 'Click the link to reset your password: https://yourapp.com/reset-password'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Reset email sent successfully' });
  } catch (error) {
    console.error('邮件发送失败:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
}