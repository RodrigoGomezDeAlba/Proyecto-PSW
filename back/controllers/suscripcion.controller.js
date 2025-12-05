// back/controllers/suscripcion.controller.js
const path = require('path');
const SuscripcionModel = require('../modelo/suscripcionContacto');
const sendMail = require('../utils/mailer');
const { company } = require('../data/company');

const assetsPath = path.join(__dirname, '..', 'assets');

// Configuración para API HTTP de SendGrid
const SG_API_KEY = process.env.SENDGRID_API_KEY;
const SG_FROM = process.env.SENDGRID_FROM;
const SG_FROM_NAME = process.env.SENDGRID_FROM_NAME || company.name;

// Helper para mandar correo con la API HTTP de SendGrid
async function enviarCorreoSendGrid({ to, subject, html }) {
  if (!SG_API_KEY || !SG_FROM) {
    console.warn('SENDGRID_API_KEY o SENDGRID_FROM no configurados; se omite envío real.');
    return;
  }

  const body = {
    personalizations: [
      {
        to: [{ email: to }],
        subject,
      },
    ],
    from: {
      email: SG_FROM,
      name: SG_FROM_NAME,
    },
    content: [
      {
        type: 'text/html',
        value: html,
      },
    ],
  };

  const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SG_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    console.error('Error SendGrid:', resp.status, text);
    throw new Error(`SendGrid HTTP ${resp.status}`);
  }
}

// SUSCRIPCIÓN: guarda en BD + envía correo con CUPÓN
async function suscribirse(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El email es obligatorio' });
    }

    const existe = await SuscripcionModel.emailExistente(email);
    if (existe) {
      return res.status(409).json({ message: 'El email ya está suscrito' });
    }

    const nuevaSuscripcionId = await SuscripcionModel.crearSuscripcion(email);

    // 📧 Correo de gracias por suscribirse (vía SendGrid HTTP; si falla, no rompemos la API)
    try {
      const html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>${company.name}</h2>
          <p><em>"${company.slogan}"</em></p>
          <p>Gracias por suscribirte. Aquí tienes tu cupón de compra (menciónalo en tu próxima compra):</p>
          <p><strong>CUPÓN: BOTELLONES10</strong></p>
        </div>
      `;

      await enviarCorreoSendGrid({
        to: email,
        subject: '¡Gracias por suscribirte!',
        html,
      });
    } catch (mailErr) {
      console.error('⚠️ Error enviando correo de suscripción (SendGrid):', mailErr);
    }

    return res
      .status(201)
      .json({ message: 'Suscripción registrada (correo enviado si fue posible)', id: nuevaSuscripcionId });
  } catch (err) {
    console.error('Error en suscribirse:', err);
    return res.status(500).json({ message: 'Error al crear suscripción' });
  }
}

// CONTACTO: guarda en BD + envía correo “En breve te atenderemos”
async function contacto(req, res) {
  try {
    const { nombre, email, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res
        .status(400)
        .json({ message: 'Nombre, email y mensaje son obligatorios' });
    }

    const nuevoContactoId = await SuscripcionModel.crearContacto(
      nombre,
      email,
      mensaje
    );

    // 📧 Correo de respuesta automática (no debe romper la API si falla)
    try {
      await sendMail({
        to: email,
        subject: 'En breve te atenderemos',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <img src="cid:logo_empresa" alt="Logo" style="height: 80px;"><br>
            <h2>${company.name}</h2>
            <p><em>"${company.slogan}"</em></p>
            <p>Hola ${nombre},</p>
            <p>Hemos recibido tu mensaje:</p>
            <blockquote>${mensaje}</blockquote>
            <p>En breve te atenderemos.</p>
            <p>Saludos,<br>Equipo de ${company.name}</p>
          </div>
        `,
        attachments: [
          {
            filename: 'logo.png',
            path: path.join(assetsPath, 'logo.png'),
            cid: 'logo_empresa'
          }
        ]
      });
    } catch (mailErr) {
      console.error('⚠️ Error enviando correo de contacto (se continúa sin fallar):', mailErr);
    }

    return res
      .status(201)
      .json({ message: 'Mensaje recibido (correo enviado si fue posible)', id: nuevoContactoId });
  } catch (err) {
    console.error('Error en contacto:', err);
    return res.status(500).json({ message: 'Error al crear contacto' });
  }
}

module.exports = {
  suscribirse,
  contacto
};
