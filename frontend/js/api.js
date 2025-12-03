const API_URL = "https://proyectopswbotellonesmx.onrender.com"; 

async function probarConexion() {
    const elementoResultado = document.getElementById('resultado-test');
    
    // Aqui le dice al usuario que onda
    elementoResultado.innerHTML = "Intentando conectar con el servidor...";
    elementoResultado.style.color = "blue";

    try {
        // Hacemos la peticion de prueba que creamos en el back
        const respuesta = await fetch(`${API_URL}/api/test`);

        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        const datos = await respuesta.json();

        // Aqui se hace la manipulacion del dom
        elementoResultado.innerHTML = `
            <h3>Conexión Exitosa</h3>
            <p><>Mensaje del Server: ${datos.mensaje}</p>
            <p><>Fecha del Server: ${datos.fecha}</p>
        `;
        elementoResultado.style.color = "green";
        console.log("Datos recibidos:", datos);

    } catch (error) {
        console.error("Error al conectar:", error);
        elementoResultado.innerHTML = `
            <h3>Error de Conexion</h3>
            <p>No se pudo conectar con el Backend.</p>
            <p><em>Detalle: ${error.message}</em></p>
            <small>Verifica que la URL en api.js sea correcta y que Render este "Live".</small>
        `;
        elementoResultado.style.color = "red";
    }
}
