// Autenticación usando el backend y los helpers globales de api.js

async function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("correo").value;
  const password1 = document.getElementById("password1").value;
  const password2 = document.getElementById("password2").value;

  if (password1 !== password2) {
    if (window.Swal) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
    } else {
      alert("Las contraseñas no coinciden");
    }
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
    const msg = data.message || data.error || "Error en el registro";
    if (window.Swal) {
      Swal.fire("Error", msg, "error");
    } else {
      alert(msg);
    }
    return;
  }

  if (window.Swal) {
    await Swal.fire("Registro exitoso", "Ahora puedes iniciar sesión", "success");
  } else {
    alert("Registro exitoso");
  }
  window.location.href = "login.html";
}

async function iniciarSesion(event) {
    event.preventDefault();

    const datos = {
        email: document.getElementById("email").value,
        contrasena: document.getElementById("password").value
    };

    const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datos)
    });

    const data = await resp.json();

    if (!resp.ok) {
        const msg = data.error || "Credenciales incorrectas";
        if (window.Swal) {
          Swal.fire("Error", msg, "error");
        } else {
          alert(msg);
        }
        return;
    }

    guardarToken(data.token);

    if (window.Swal) {
      await Swal.fire("Bienvenido", "Has iniciado sesión correctamente", "success");
    } else {
      alert("Bienvenido");
    }
    window.location.href = "index.html";
}

async function enviarRecuperacion(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;

    const resp = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email })
    });

    const data = await resp.json();

    if (!resp.ok) {
        const msg = data.error || "Error";
        if (window.Swal) {
          Swal.fire("Error", msg, "error");
        } else {
          alert(msg);
        }
        return;
    }

    if (window.Swal) {
      await Swal.fire(
        "Recuperación enviada",
        "Se envió un correo con instrucciones para restablecer tu contraseña",
        "success"
      );
    } else {
      alert("Se envió un correo con instrucciones");
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", registrarUsuario);
  }

  const formRecuperar = document.getElementById("form-recuperar");
  if (formRecuperar) {
    formRecuperar.addEventListener("submit", enviarRecuperacion);
  }
});

// Exponer funciones si se quieren usar desde otros scripts
window.registrarUsuario = registrarUsuario;
window.iniciarSesion = iniciarSesion;
window.enviarRecuperacion = enviarRecuperacion;
