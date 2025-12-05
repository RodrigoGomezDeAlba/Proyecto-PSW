const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require('path');
const { buildPurchasePdf } = require('./pdf'); 
const { company } = require('../data/company');

// Ruta del logo 
const logoPath = path.join(__dirname, '../assets/logo.png');

// ------------------------------------------------------------
// SMTP opcional (solo se usa si hay configuración MAIL_*)
// ------------------------------------------------------------
const hasSmtpConfig =
  process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS;

let transporter = null;

if (hasSmtpConfig) {
  const host = process.env.MAIL_HOST || 'smtp.gmail.com';
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Verificación opcional (solo si SMTP está configurado)
  transporter.verify(err => {
    if (err) {
      console.error('Error con el mailer:', err, '\nHost:', host, 'Port:', port);
    } else {
      console.log('Mailer listo para enviar correos en', host + ':' + port);
    }
  });
} else {
  console.warn(
    'SMTP no configurado (MAIL_HOST/MAIL_USER/MAIL_PASS); se simulará el envío de correos.'
  );
}

//función base 
async function sendMail({ to, subject, html, attachments = [] }) {
  if (!transporter) {
    // En producción (Render) esto evita timeouts cuando SMTP está bloqueado
    console.log(
      'Simulación de envío de correo:',
      JSON.stringify({ to, subject }, null, 2)
    );
    return;
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM || `"${company.name}" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
}
    attachments,
  });
}

// Correo para formulario de CONTACTO
async function enviarCorreoContacto({ nombre, email, mensaje }) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <img src="cid:logoEmpresa" alt="Logo" 
           style="max-width: 150px; display:block; margin-bottom:10px;" />
      <h2>${company.name}</h2>
      <p><em>"${company.slogan}"</em></p>
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

// Correo para SUSCRIPCIÓN (con cupón como imagen adjunta)
async function enviarCorreoSuscripcion({ email, cuponPath }) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <img src="cid:logoEmpresa" alt="Logo" 
           style="max-width: 150px; display:block; margin-bottom:10px;" />
      <h2>¡Gracias por suscribirte!</h2>
      <p>Te damos la bienvenida a <strong>${company.name}</strong>.</p>
      <p>Como agradecimiento, te enviamos tu cupón de compra en la imagen adjunta.</p>
      <p><em>"${company.slogan}"</em></p>
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
      <p><em>"${company.slogan}"</em></p>
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
