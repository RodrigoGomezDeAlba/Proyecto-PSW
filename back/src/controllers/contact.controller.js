// back/src/controllers/contact.controller.js
import path from 'path';
import { fileURLToPath } from 'url';

import { sendMail } from '../utils/mailer.js';
import { buildPurchasePdf } from '../utils/pdf.js';
import { company } from '../data/company.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, '..', 'assets');

// 1) Formulario de contacto: "En breve te atenderemos"
export async function sendContactMail(req, res) {
  try {
    const { nombre, email, mensaje } = req.body;

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

    res.json({ message: 'Correo de contacto enviado' });
  } catch (err) {
    console.error('Error en sendContactMail:', err);
    res.status(500).json({ error: 'No se pudo enviar el correo de contacto' });
  }
}

// 2) Suscripción: logo + lema + cupón (imagen)
export async function sendSubscriptionMail(req, res) {
  try {
    const { email } = req.body; // 👈 correo que viene del front
    console.log('Enviando correo de suscripción a:', email);

    const info = await sendMail({
      to: email, // 👈 IMPORTANTE: al correo del usuario, NO a MAIL_USER
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
          filename: 'cupon.png',                      // 👈 nombre REAL del archivo
          path: path.join(assetsPath, 'cupon.png'),   // 👈 back/src/assets/cupon.png
          cid: 'cupon_img'
        }
      ]
    });

    console.log('Resultado suscripción:', info);

    res.json({ message: 'Correo de suscripción enviado' });
  } catch (err) {
    console.error('Error en sendSubscriptionMail:', err);
    res.status(500).json({ error: 'No se pudo enviar el correo de suscripción' });
  }
}


// 3) Compra: PDF con nota de compra
export async function sendPurchaseMail(req, res) {
  try {
    const { nombre, email, items, total } = req.body;

    const datosCompra = { nombre, email, items, total };
    const pdfBuffer = await buildPurchasePdf(datosCompra);

    await sendMail({
      to: email,
      subject: 'Tu nota de compra',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <img src="cid:logo_empresa" alt="Logo" style="height: 60px;"><br>
          <h2>${company.name}</h2>
          <p>Gracias por tu compra, ${nombre}.</p>
          <p>Adjuntamos tu nota de compra en PDF.</p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(assetsPath, 'logo.png'),
          cid: 'logo_empresa'
        },
        {
          filename: 'nota_compra.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    res.json({ message: 'Correo de compra enviado' });
  } catch (err) {
    console.error('Error en sendPurchaseMail:', err);
    res.status(500).json({ error: 'No se pudo enviar el correo de compra' });
  }
}
