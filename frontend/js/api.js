export const API_URL = "http://localhost:3000";

export function guardarToken(token) {
    localStorage.setItem("token", token);
}

export function obtenerToken() {
    return localStorage.getItem("token");
}

export function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}