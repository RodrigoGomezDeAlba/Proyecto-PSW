export async function cargarCaptcha() {
    const img = document.getElementById("img-captcha");

    try {
        img.src = `${API_URL}/api/captcha?rand=${Math.random()}`;
    } catch (err) {
        console.error("Error cargando captcha", err);
    }
}