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
      console.log("Respuesta suscripción:", resp.status, data);

      if (!resp.ok) {
        const msg = data.message || data.error || "No se pudo completar la suscripción";
        if (window.Swal) {
          await Swal.fire("Error", msg, "error");
        } else {
          alert(`Error al suscribirte: ${msg}`);
        }
        return;
      }

      const okMsg = "Te hemos suscrito y se envió tu cupón a tu email.";
      if (window.Swal) {
        await Swal.fire("¡Listo!", okMsg, "success");
      } else {
        alert(okMsg);
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
      } else {
        alert("No se pudo conectar con el servidor para suscribirte.");
      }
    }
  });
});
