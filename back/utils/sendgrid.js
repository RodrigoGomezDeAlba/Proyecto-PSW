const { company } = require('../data/company');
const { buildPurchasePdf } = require('./pdf');

const SG_API_KEY = process.env.SENDGRID_API_KEY;
const SG_FROM = process.env.SENDGRID_FROM;
const SG_FROM_NAME = process.env.SENDGRID_FROM_NAME || company.name;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://botellonesmxpsw-one.vercel.app';

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
  const logoUrl = `${FRONTEND_URL}/img/logo.png`;
  const html = `
    <div style="font-family: Arial, sans-serif; text-align:center;">
      <img src="${logoUrl}" alt="${company.name}" style="max-width:120px; margin-bottom:8px;" />
      <h2>${company.name}</h2>
      <p><em>"${company.slogan}"</em></p>
      <p>Gracias por suscribirte. Aquí tienes tu cupón de compra (úsalo en tu próxima compra):</p>
      <p style="font-size:1.3rem;"><strong>CUPÓN: BOTELLONES10</strong></p>
    </div>
  `;

  await sendWithSendGrid({
    to: email,
    subject: '¡Gracias por suscribirte!',
    html,
  });
}

async function enviarCorreoContactoHTTP({ nombre, email, mensaje }) {
  const logoUrl = `${FRONTEND_URL}/img/logo.png`;
  const html = `
    <div style="font-family: Arial, sans-serif; text-align:left;">
      <div style="text-align:center; margin-bottom:8px;">
        <img src="${logoUrl}" alt="${company.name}" style="max-width:120px;" />
      </div>
      <h2>${company.name}</h2>
      <p><em>"${company.slogan}"</em></p>
      <p>Hola <strong>${nombre}</strong>, hemos recibido tu mensaje:</p>
      <blockquote>${mensaje}</blockquote>
      <p>En breve serás atendido.</p>
    </div>
  `;

  await sendWithSendGrid({
    to: email,
    subject: 'En breve te atenderemos',
    html,
  });
}

async function enviarCorreoCompraHTTP({ nombre, email, items = [], total }) {
  const logoUrl = `${FRONTEND_URL}/img/logo.png`;
  const filas = items
    .map(
      (it, idx) =>
        `<tr><td>${idx + 1}</td><td>${it.nombre || it.producto || ''}</td><td>${it.cantidad || 1}</td><td>$${
          it.precio_unitario || it.precio || 0
        }</td><td>$${it.subtotal || (it.cantidad || 1) * (it.precio_unitario || it.precio || 0)}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <div style="text-align:center; margin-bottom:8px;">
        <img src="${logoUrl}" alt="${company.name}" style="max-width:120px;" />
      </div>
      <h2>${company.name} - Nota de compra</h2>
      <p><em>"${company.slogan}"</em></p>
      <p>Cliente: <strong>${nombre}</strong></p>
      <table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width:100%;">
        <thead>
          <tr><th>#</th><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <p style="margin-top:10px;">Total pagado: <strong>$${Number(total || 0).toFixed(2)}</strong></p>
      <p style="margin-top:4px; font-size:0.9rem; color:#6b7280;">Se adjunta una copia en PDF como nota de compra.</p>
    </div>
  `;

  // Generar PDF usando pdfkit y adjuntarlo como base64
  let attachments = [];
  try {
    const pdfBuffer = await buildPurchasePdf({ nombre, email, items, total: Number(total || 0).toFixed(2) });
    attachments.push({
      content: pdfBuffer.toString('base64'),
      filename: 'nota-compra.pdf',
      type: 'application/pdf',
      disposition: 'attachment',
    });
  } catch (err) {
    console.error('Error generando PDF de nota de compra:', err);
  }

  await sendWithSendGrid({
    to: email,
    subject: 'Tu nota de compra',
    html,
    attachments,
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
