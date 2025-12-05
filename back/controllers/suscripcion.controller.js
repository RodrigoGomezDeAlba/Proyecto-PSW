// back/controllers/suscripcion.controller.js
const path = require('path');
const SuscripcionModel = require('../modelo/suscripcionContacto');
const sendMail = require('../utils/mailer');
const { company } = require('../data/company');

const assetsPath = path.join(__dirname, '..', 'assets');

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

    // 📧 Correo de gracias por suscribirse + cupón
    await sendMail({
      to: email,
      subject: '¡Gracias por suscribirte!',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <img src="cid:logo_empresa" alt="Logo" style="height: 60px;"><br>
          <h2>${company.name}</h2>
          <p><em>"${company.slogan}"</em></p>
          <p>Gracias por suscribirte. Aquí tienes tu cupón de compra:</p>
          <img src="cid:cupon_img" alt="Cupón" style="max-width: 100%; height: auto;">
        </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(assetsPath, 'logo.png'),
          cid: 'logo_empresa'
        },
        {
          filename: 'cupon.png',
          path: path.join(assetsPath, 'cupon.png'),
          cid: 'cupon_img'
        }
      ]
    });

    return res
      .status(201)
      .json({ message: 'Suscripción registrada y correo enviado', id: nuevaSuscripcionId });
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

    // 📧 Correo de respuesta automática
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

    return res
      .status(201)
      .json({ message: 'Mensaje enviado y correo de confirmación enviado', id: nuevoContactoId });
  } catch (err) {
    console.error('Error en contacto:', err);
    return res.status(500).json({ message: 'Error al crear contacto' });
  }
}

module.exports = {
  suscribirse,
  contacto
};
