const { company } = require('../data/company');

const SG_API_KEY = process.env.SENDGRID_API_KEY;
const SG_FROM = process.env.SENDGRID_FROM;
const SG_FROM_NAME = process.env.SENDGRID_FROM_NAME || company.name;

async function sendWithSendGrid({ to, subject, html, attachments = [] }) {
  if (!SG_API_KEY || !SG_FROM) {
    console.warn('SendGrid no configurado (SENDGRID_API_KEY / SENDGRID_FROM); se omite envío real.');
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
      content: a.content, // base64 string
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
      <h2>${company.name}</h2>
      <p><em>"${company.slogan}"</em></p>
      <p>Gracias por suscribirte. Aquí tienes tu cupón de compra (menciónalo en tu próxima compra):</p>
      <p><strong>CUPÓN: BOTELLONES10</strong></p>
    </div>
  `;

  await sendWithSendGrid({
    to: email,
    subject: '¡Gracias por suscribirte!',
    html,
  });
}

async function enviarCorreoContactoHTTP({ nombre, email, mensaje }) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
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

async function enviarCorreoCompraHTTP({ nombre, email, items = [], total }) {
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
    </div>
  `;

  await sendWithSendGrid({
    to: email,
    subject: 'Tu nota de compra',
    html,
  });
}

module.exports = {
  sendWithSendGrid,
  enviarCorreoSuscripcionHTTP,
  enviarCorreoContactoHTTP,
  enviarCorreoCompraHTTP,
};