async function cargarCaptcha() {
  const img = document.getElementById("img-captcha");
  if (!img) return;

  try {
    img.src = `${API_URL}/api/auth/captcha?rand=${Math.random()}`;
  } catch (err) {
    console.error("Error cargando captcha", err);
  }
}

window.cargarCaptcha = cargarCaptcha;
