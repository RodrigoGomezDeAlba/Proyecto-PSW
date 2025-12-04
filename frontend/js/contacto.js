// js/contacto.js

const API_URL = 'http://localhost:3000/api/contacto';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const msgEl = document.getElementById('contactMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // evita recargar la página

    // Obtener datos del formulario
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    // data = { nombre: '...', email: '...', mensaje: '...' }

    // Limpiar mensajes
    msgEl.textContent = '';
    msgEl.style.color = '';

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const json = await resp.json();

      if (!resp.ok) {
        // Error desde el backend
        msgEl.textContent = json.message || 'Ocurrió un error al enviar tu mensaje.';
        msgEl.style.color = 'red';
        return;
      }

      // Éxito
      msgEl.textContent = json.message || 'Mensaje enviado correctamente. Revisa tu correo.';
      msgEl.style.color = 'green';

      // Opcional: limpiar formulario
      form.reset();

    } catch (err) {
      console.error('Error en fetch /api/contacto:', err);
      msgEl.textContent = 'Error de conexión con el servidor.';
      msgEl.style.color = 'red';
    }
  });
});
