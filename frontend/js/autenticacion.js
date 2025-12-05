import { API_URL, guardarToken } from './api.js';
import { cargarCaptcha } from './captcha.js';

export async function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("correo").value;
  const password1 = document.getElementById("password1").value;
  const password2 = document.getElementById("password2").value;

  if (password1 !== password2) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const datos = {
    nombre,
    email,
    contrasena: password1      
  };

  const resp = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });

  const data = await resp.json();

  if (!resp.ok) {
    alert(data.message || data.error || "Error en el registro");
    return;
  }

  alert("Registro exitoso");
  window.location.href = "login.html";
}

export async function iniciarSesion(event) {
    event.preventDefault();

    const datos = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        captcha: document.getElementById("captcha").value
    };

    const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datos)
    });

    const data = await resp.json();

    if (!resp.ok) {
        alert(data.error || "Credenciales incorrectas");
        cargarCaptcha(); 
        return;
    }

    guardarToken(data.token);

    alert("Bienvenido");
    window.location.href = "index.html";
}

export async function enviarRecuperacion(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;

    const resp = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email })
    });

    const data = await resp.json();

    if (!resp.ok) {
        alert(data.error || "Error");
        return;
    }

    alert("Se envió un correo con instrucciones");
}

document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", registrarUsuario);
  }

  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", iniciarSesion);
  }
});