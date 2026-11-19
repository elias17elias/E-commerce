import nodemailer from 'nodemailer';
import env from '../config/env.js';

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
    },
});

export const sendPasswordResetEmail = async (email, token) => {
    const resetLink =
        `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset',
        text: `Reset your password using this link: ${resetLink}`,
    });
};