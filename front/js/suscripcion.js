// front/js/suscripcion.js
import { postJSON } from './api.js';

const form = document.getElementById('susForm');
const feedback = document.getElementById('susFeedback');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = { email: form.email.value };

  feedback.textContent = 'Enviando...';

  try {
    const res = await postJSON('/subscribe', data);
    feedback.textContent = res.message || 'Revisa tu correo para el cupón';
  } catch (err) {
    console.error(err);
    feedback.textContent = 'Ocurrió un error al enviar el correo 😢';
  }
});
