const fs = require('fs');
const path = require('path');
const { company } = require('../data/company');

const SG_API_KEY = process.env.SENDGRID_API_KEY;
const SG_FROM = process.env.SENDGRID_FROM;
const SG_FROM_NAME = process.env.SENDGRID_FROM_NAME || company.name;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://botellonesmxpsw-one.vercel.app';

// Ruta local a la imagen del cupón que se adjuntará en el correo de suscripción
// Asegúrate de colocar el archivo en back/assets/cupon-botellones10.png
const CUPON_IMAGE_PATH = path.join(__dirname, '..', 'assets', 'cupon-botellones10.png');

async function sendWithSendGrid({ to, subject, html, attachments = [] }) {
  if (!SG_API_KEY || !SG_FROM) {
    console.warn('SendGrid no configurado (SENDGRID_API_KEY / SENDGRID_FROM); cuidado.');
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

  if (attachments.length) {
    body.attachments = attachments.map(a => ({
      content: a.content, 
      filename: a.filename,
      type: a.type || 'application/octet-stream',
      disposition: 'attachment',
    }));
  }

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

async function enviarCorreoSuscripcionHTTP(email) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <img src="https://proyectopswbotellonesmx.onrender.com/img/logo-email.png"
           alt="${company.name}"
           style="max-width:150px; margin-bottom:10px;" />
      <h2>${company.name}</h2>
      <p><em>"${company.slogan}"</em></p>
      <p>Gracias por suscribirte. Te enviamos tu cupón en la imagen adjunta.
         Úsalo en tu próxima compra:</p>
      <p><strong>CUPÓN: BOTELLONES10</strong></p>
    </div>
  `;

  let attachments = [];
  try {
    // Leer la imagen del cupón como base64 para adjuntarla en el correo
    const cuponB64 = fs.readFileSync(CUPON_IMAGE_PATH).toString('base64');
    attachments.push({
      content: cuponB64,
      filename: 'cupon-botellones10.png',
      type: 'image/png',
    });
  } catch (err) {
    console.error('No se pudo leer la imagen del cupón para adjuntar:', err.message);
  }

  await sendWithSendGrid({
    to: email,
    subject: '¡Gracias por suscribirte!',
    html,
    attachments,
  });
}

async function enviarCorreoContactoHTTP({ nombre, email, mensaje }) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
    <div style="text-align:center; margin-bottom:10px;">
      <img src="https://proyectopswbotellonesmx.onrender.com/img/logo-email.png"
           alt="${company.name}"
           style="max-width:150px; margin-bottom:10px;" />
      <h2>${company.name}</h2>
      <p><em>"${company.slogan}"</em></p>
      <p>Hola <strong>${nombre}</strong>, hemos recibido tu mensaje:</p>
      <blockquote>${mensaje}</blockquote>
      <p>En breve te atenderemos.</p>
    </div>
  `;

  await sendWithSendGrid({
    to: email,
    subject: 'En breve te atenderemos',
    html,
  });
}

async function enviarCorreoCompraHTTP({
  nombre,
  email,
  items = [],
  total,
  subtotal,
  tax,
  ship,
  discount,
  cupon,
  fecha,
  metodoPago,
}) {
  const filas = items
    .map(
      (it, idx) =>
        `<tr><td>${idx + 1}</td><td>${it.nombre || it.producto || ''}</td><td>${it.cantidad || 1}</td><td>$${
          it.precio_unitario || it.precio || 0
        }</td><td>$${it.subtotal || (it.cantidad || 1) * (it.precio_unitario || it.precio || 0)}</td></tr>`
    )
    .join('');

  const fechaObj = fecha ? new Date(fecha) : new Date();
  const fechaTexto = fechaObj.toLocaleDateString('es-MX');
  const horaTexto = fechaObj.toLocaleTimeString('es-MX');

  const subNum = Number(subtotal ?? 0);
  const taxNum = Number(tax ?? 0);
  const shipNum = Number(ship ?? 0);
  const discountNum = Number(discount ?? 0);
  const totalNum = Number(total ?? subNum + taxNum + shipNum - discountNum);
  const cuponTexto = (cupon || '').toString().trim();

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <div style="text-align:center; margin-bottom:10px;">
        <img src="https://proyectopswbotellonesmx.onrender.com/img/logo-email.png"
             alt="${company.name}"
             style="max-width:150px; margin-bottom:10px;" />
        <h2>${company.name} - Nota de compra</h2>
        <p><em>"${company.slogan}"</em></p>
      </div>

      <p><strong>Fecha:</strong> ${fechaTexto}</p>
      <p><strong>Hora:</strong> ${horaTexto}</p>
      <p><strong>Cliente:</strong> ${nombre}</p>
      ${metodoPago ? `<p><strong>Método de pago:</strong> ${metodoPago}</p>` : ''}

      <h3>Detalle de compra</h3>
      <table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width:100%;">
        <thead>
          <tr><th>#</th><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>

      <h3 style="margin-top:10px;">Resumen de cobro</h3>
      <p><strong>Subtotal:</strong> $${subNum.toFixed(2)}</p>
      <p><strong>Impuestos:</strong> $${taxNum.toFixed(2)}</p>
      <p><strong>Gastos de envío:</strong> $${shipNum.toFixed(2)}</p>
      ${cuponTexto ? `<p><strong>Cupón aplicado:</strong> ${cuponTexto} (descuento $${discountNum.toFixed(2)})</p>` : ''}
      <p><strong>Total general:</strong> $${totalNum.toFixed(2)}</p>
    </div>
  `;

  await sendWithSendGrid({
    to: email,
    subject: 'Tu nota de compra',
    html,
  });
}

async function enviarCorreoRecuperacionHTTP({ email, token }) {
  const link = `${FRONTEND_URL}/restablecer.html?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>${company.name} - Recuperación de contraseña</h2>
      <p><em>"${company.slogan}"</em></p>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a este correo.</p>
      <p>Para completar el proceso, puedes usar el siguiente <strong>código de recuperación</strong> (válido por 1 hora):</p>
      <p style="font-size: 1.2rem;"><strong>${token}</strong></p>
      <p>O bien, haz clic en el siguiente enlace para ir directamente a la pantalla de restablecer contraseña:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si tú no solicitaste este cambio, puedes ignorar este mensaje.</p>
    </div>
  `;

  await sendWithSendGrid({
    to: email,
    subject: 'Recuperación de contraseña',
    html,
  });
}

module.exports = {
  sendWithSendGrid,
  enviarCorreoSuscripcionHTTP,
  enviarCorreoContactoHTTP,
  enviarCorreoCompraHTTP,
  enviarCorreoRecuperacionHTTP,
};
