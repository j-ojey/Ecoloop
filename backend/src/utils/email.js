import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: config.emailUser,
    pass: config.emailPass
  }
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: config.emailUser,
    to: email,
    subject: 'EcoLoop Password Reset',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your EcoLoop account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best,<br>The EcoLoop Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};