import { API_URL } from "./api.js";

const imgCaptcha = document.getElementById("captcha-img");

async function cargarCaptcha() {
    imgCaptcha.src = `${API_URL}/api/auth/captcha?${Date.now()}`;
}
cargarCaptcha();

document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const captcha = document.getElementById("captcha-input").value;

    try {
        const resp = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password, captcha })
        });

        const data = await resp.json();

        if (data.bloqueado) {
            return Swal.fire("Cuenta bloqueada", "Espera 5 minutos", "error");
        }

        if (!resp.ok) {
            cargarCaptcha(); 
            return Swal.fire("Error", data.msg || "Credenciales incorrectas", "error");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", data.usuario.nombre);

        Swal.fire("Bienvenido", data.usuario.nombre, "success")
            .then(() => window.location.href = "index.html");

    } catch (err) {
        Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
});