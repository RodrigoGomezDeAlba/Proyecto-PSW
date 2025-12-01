import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',     // <-- OJO, esto es para Gmail
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transporter.verify((err) => {
  if (err) {
    console.error('Error con el mailer:', err);
  } else {
    console.log('Mailer listo para enviar correos');
  }
});

export function sendMail({ to, subject, html, attachments = [] }) {
  return transporter.sendMail({
    from: `"Mi Empresa" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    attachments
  });
}
