// back/controllers/suscripcion.controller.js
const path = require('path');
const SuscripcionModel = require('../modelo/suscripcionContacto');
const { company } = require('../data/company');
const {
  enviarCorreoSuscripcionHTTP,
  enviarCorreoContactoHTTP,
} = require('../utils/sendgrid');

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

    // 📧 Correo de gracias por suscribirse (vía SendGrid HTTP; si falla, no rompemos la API)
    try {
      await enviarCorreoSuscripcionHTTP(email);
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

    // 📧 Correo de respuesta automática (vía SendGrid HTTP; no debe romper la API si falla)
    try {
      await enviarCorreoContactoHTTP({ nombre, email, mensaje });
    } catch (mailErr) {
      console.error('⚠️ Error enviando correo de contacto (SendGrid):', mailErr);
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
