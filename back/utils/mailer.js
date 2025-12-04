// back/utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require('path');
const { buildPurchasePdf } = require('./pdf'); // <-- util para generar el PDF

// 🔹 Ruta del logo (AJÚSTALA si tu logo está en otro lado)
const logoPath = path.join(__dirname, '../assets/logo.png');

// Transporter general
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Verificación opcional
transporter.verify(err => {
  if (err) {
    console.error('Error con el mailer:', err);
  } else {
    console.log('Mailer listo para enviar correos');
  }
});

// --------- función base (la que ya usabas) ----------
async function sendMail({ to, subject, html, attachments = [] }) {
  return transporter.sendMail({
    from: `"Mi Empresa" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    attachments
  });
}

// --------- funciones específicas ----------

// 1) Correo para formulario de CONTACTO
async function enviarCorreoContacto({ nombre, email, mensaje }) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <img src="cid:logoEmpresa" alt="Logo" 
           style="max-width: 150px; display:block; margin-bottom:10px;" />
      <h2>Mi Empresa</h2>
      <p><em>"Cada familia tiene una historia... aquí comienza la tuya"</em></p>
      <p>Hola <strong>${nombre}</strong>, hemos recibido tu mensaje:</p>
      <blockquote>${mensaje}</blockquote>
      <p>En breve te atenderemos.</p>
    </div>
  `;

  const attachments = [
    {
      filename: 'logo.png',
      path: logoPath,
      cid: 'logoEmpresa' // debe coincidir con cid:logoEmpresa del <img>
    }
  ];

  return sendMail({
    to: email,
    subject: 'En breve te atenderemos',
    html,
    attachments
  });
}

// 2) Correo para SUSCRIPCIÓN (con cupón como imagen adjunta)
async function enviarCorreoSuscripcion({ email, cuponPath }) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <img src="cid:logoEmpresa" alt="Logo" 
           style="max-width: 150px; display:block; margin-bottom:10px;" />
      <h2>¡Gracias por suscribirte!</h2>
      <p>Te damos la bienvenida a <strong>Mi Empresa</strong>.</p>
      <p>Como agradecimiento, te enviamos tu cupón de compra en la imagen adjunta.</p>
      <p><em>"Cada familia tiene una historia... aquí comienza la tuya"</em></p>
    </div>
  `;

  const attachments = [
    {
      filename: 'logo.png',
      path: logoPath,
      cid: 'logoEmpresa'
    }
  ];

  if (cuponPath) {
    attachments.push({
      filename: 'cupon.png',
      path: cuponPath
    });
  }

  return sendMail({
    to: email,
    subject: 'Gracias por suscribirte – aquí está tu cupón',
    html,
    attachments
  });
}

// 3) Correo para COMPRA (nota en PDF adjunta + logo)
async function enviarCorreoCompra(datosCompra) {
  // datosCompra: { nombre, email, items: [], total }
  const pdfBuffer = await buildPurchasePdf(datosCompra);

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <img src="cid:logoEmpresa" alt="Logo" 
           style="max-width: 150px; display:block; margin-bottom:10px;" />
      <h2>Gracias por tu compra, ${datosCompra.nombre}</h2>
      <p>Adjuntamos tu nota de compra en formato PDF.</p>
      <p>Guárdala como comprobante.</p>
      <p>Total pagado: <strong>$${Number(datosCompra.total).toFixed(2)}</strong></p>
      <p><em>"Cada familia tiene una historia... aquí comienza la tuya"</em></p>
    </div>
  `;

  const attachments = [
    {
      filename: 'nota-compra.pdf',
      content: pdfBuffer
    },
    {
      filename: 'logo.png',
      path: logoPath,
      cid: 'logoEmpresa'
    }
  ];

  return sendMail({
    to: datosCompra.email,
    subject: 'Tu nota de compra',
    html,
    attachments
  });
}

// ---- exportaciones ----
sendMail.enviarCorreoContacto = enviarCorreoContacto;
sendMail.enviarCorreoSuscripcion = enviarCorreoSuscripcion;
sendMail.enviarCorreoCompra = enviarCorreoCompra;

module.exports = sendMail;
