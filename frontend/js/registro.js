import { API_URL } from "./api.js";

document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass1 = document.getElementById('pass1').value;
    const pass2 = document.getElementById('pass2').value;

    if (pass1 !== pass2) {
        return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    try {
        const resp = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ nombre, email, password: pass1 })
        });

        const data = await resp.json();

        if (!resp.ok) {
            return Swal.fire("Error", data.msg || "Error al registrar", "error");
        }

        Swal.fire("Registro exitoso", "Ahora puedes iniciar sesión", "success")
            .then(() => window.location.href = "login.html");

    } catch (err) {
        Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
});