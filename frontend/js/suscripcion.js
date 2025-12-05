document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-suscripcion");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email-suscripcion");
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      if (window.Swal) {
        await Swal.fire("Correo requerido", "Ingresa un correo electrónico válido", "warning");
      }
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/suscribirse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const msg = data.message || data.error || "No se pudo completar la suscripción";
        if (window.Swal) {
          await Swal.fire("Error", msg, "error");
        }
        return;
      }

      if (window.Swal) {
        await Swal.fire(
          "¡Listo!",
          "Te hemos suscrito y enviamos tu cupón a tu correo electrónico.",
          "success"
        );
      }
      form.reset();
    } catch (err) {
      console.error("Error en suscripción:", err);
      if (window.Swal) {
        await Swal.fire(
          "Error",
          "No se pudo conectar con el servidor para suscribirte.",
          "error"
        );
      }
    }
  });
});
