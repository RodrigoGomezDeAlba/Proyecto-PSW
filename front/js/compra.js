// front/js/compra.js
import { postJSON } from './api.js';

const form = document.getElementById('buyForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombre: form.nombre.value,
    email: form.email.value,
    items: [
      { nombre: 'Curso Node.js', cantidad: 1, precio: 500 },
      { nombre: 'Certificado', cantidad: 1, precio: 200 }
    ],
    total: 700
  };

  const res = await postJSON('/purchase', data);
  alert(res.message || 'Compra registrada, revisa tu correo');
});
