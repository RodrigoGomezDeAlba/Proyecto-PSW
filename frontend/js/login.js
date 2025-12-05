// Login con CAPTCHA consumiendo el backend desplegado

document.addEventListener("DOMContentLoaded", () => {
  if (typeof cargarCaptcha === "function") {
    cargarCaptcha();
  }

  const form = document.getElementById("form-login");
  if (!form) return;

  const btnRefresh = document.getElementById("btn-refresh-captcha");
  if (btnRefresh && typeof cargarCaptcha === "function") {
    btnRefresh.addEventListener("click", (e) => {
      e.preventDefault();
      cargarCaptcha();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const captcha = document.getElementById("captcha-input").value.trim();

    if (!email || !password || !captcha) {
      return Swal.fire("Campos incompletos", "Ingresa email, contraseña y captcha.", "warning");
    }

    try {
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contrasena: password, captcha })
      });

      const data = await resp.json();

      if (!resp.ok) {
        if (typeof cargarCaptcha === "function") {
          cargarCaptcha();
        }
        const msg = data.message || data.msg || data.error || "Credenciales o captcha incorrectos";
        return Swal.fire("Error", msg, "error");
      }

      if (typeof guardarToken === "function") {
        guardarToken(data.token);
      } else {
        localStorage.setItem("token", data.token);
      }

      if (data.usuario) {
        // Guardamos el usuario completo como JSON para usarlo en el header
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        if (data.usuario.email) {
          localStorage.setItem("userEmail", data.usuario.email);
        }
      }

      Swal.fire("Bienvenido", data.usuario?.nombre || "", "success").then(() => {
        window.location.href = "index.html";
      });
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  });
});
