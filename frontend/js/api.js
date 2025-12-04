// frontend/js/api.js

// URL del backend (ajusta si usas Render o localhost)
export const API_URL = "http://localhost:3000";
// o: export const API_URL = "https://proyectopswbotellonesmx.onrender.com";

// ⚠️ Solo para pruebas: pega aquí el token JWT de un ADMIN
// que obtuviste haciendo login en Postman.
export const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJnZWtvLnNlcmlncmFmaWFAZ21haWwuY29tIiwicm9sIjoiYWRtaW4iLCJpYXQiOjE3NjQ4NDIxMDQsImV4cCI6MTc2NDg0NTcwNH0.SrBkOJwruQgzCsvBzlML7hpSmprQzhB_NUeKZeeAJnQ";

// Esta función es la que ya tenías, ahora exportada también
export async function probarConexion() {
  const elementoResultado = document.getElementById('resultado-test');

  elementoResultado.innerHTML = "Intentando conectar con el servidor...";
  elementoResultado.style.color = "blue";

  try {
    const respuesta = await fetch(`${API_URL}/api/test-db`);

    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status}`);
    }
    const datos = await respuesta.json();

    elementoResultado.innerHTML = `
      <h3>Conexión Exitosa</h3>
      <p>Mensaje del Server: ${datos.mensaje}</p>
      <p>Fecha del Server: ${datos.fecha}</p>
    `;
    elementoResultado.style.color = "green";
    console.log("Datos recibidos:", datos);
  } catch (error) {
    console.error("Error al conectar:", error);
    elementoResultado.innerHTML = `
      <h3>Error de Conexión</h3>
      <p>No se pudo conectar con el Backend.</p>
      <p><em>Detalle: ${error.message}</em></p>
      <small>Verifica que la URL en api.js sea correcta y que el backend esté corriendo.</small>
    `;
    elementoResultado.style.color = "red";
  }
}
