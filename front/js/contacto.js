// front/js/contacto.js
import { postJSON } from './api.js';

const form = document.getElementById('contactForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombre: form.nombre.value,
    email: form.email.value,
    mensaje: form.mensaje.value
  };

  const res = await postJSON('/contact', data);
  alert(res.message || 'Mensaje enviado');
});
