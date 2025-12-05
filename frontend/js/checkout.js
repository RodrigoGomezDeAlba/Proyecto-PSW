import { API_URL, obtenerToken } from "./api.js";


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-checkout");
  if (!form) return;

  if (typeof actualizarResumen === "function") {
    actualizarResumen();
  }

  // Manejo de cambio de método de pago
  const radiosPago = document.querySelectorAll("input[name='pago']");
  radiosPago.forEach(r =>
    r.addEventListener("change", actualizarVistaPago)
  );
  actualizarVistaPago();

  if (typeof rawItems !== "undefined" && Array.isArray(rawItems)) {
    actualizarResumenCheckout(rawItems, document.getElementById("pais")?.value || "MX");
  }

  const selectPais = document.getElementById("pais");
  if (selectPais) {
    selectPais.addEventListener("change", () => {
      if (typeof rawItems !== "undefined" && Array.isArray(rawItems)) {
        actualizarResumenCheckout(rawItems, selectPais.value);
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (typeof rawItems === "undefined" || !Array.isArray(rawItems) || rawItems.length === 0) {
      await Swal.fire("Carrito vacío", "Agrega productos antes de comprar", "info");
      return;
    }

    const formData = new FormData(form);
    const envio = Object.fromEntries(formData.entries());

    // Validaciones básicas de envío
    if (!envio.nombre || !envio.direccion || !envio.ciudad || !envio.cp || !envio.telefono || !envio.email) {
      await Swal.fire("Datos incompletos", "Por favor llena todos los datos de envío (incluyendo teléfono y correo).", "warning");
      return;
    }

    // Validacion por metodo de pago
    if (!validarDatosPago(envio)) {
      return;
    }


    const items = rawItems.map(it => ({
      id: it.producto_id,
      nombre: it.nombre,
      precio: it.precio_unitario,
      cantidad: it.cantidad,
      subtotal: it.subtotal
    }));

    const { subtotal, tax, ship, total } = calcularTotales(items, envio.pais);

    // Construir objeto de orden que se envia al backend
    const order = {
      fecha: new Date().toISOString(),
      cliente: envio.nombre,
      correo: envio.email || null,
      telefono: envio.telefono || null,
      direccion: `${envio.direccion}, ${envio.ciudad} CP:${envio.cp}`,
      pais: envio.pais,
      metodoPago: envio.pago,
      items,
      subtotal,
      tax,
      ship,
      total
    };

    // Nota de compra local 
    const notaHTML = generarNotaHTML(order);
    const w = window.open("", "_blank");
    w.document.write(notaHTML);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 700);

    try {
      const token = obtenerToken();
      if (!token) {
        await Swal.fire("Inicia sesión", "Debes iniciar sesión para completar la compra", "info");
        window.location.href = "login.html";
        return;
      }

      await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(order)
      });

      await Swal.fire(
        "Compra finalizada",
        "Nota generada y enviada al servidor (simulado). Revisa tu correo cuando el backend esté configurado.",
        "success"
      );

      disminuirInventario(items);
      localStorage.removeItem("carrito");
      setTimeout(() => window.location.href = "index.html", 1200);
    } catch (err) {
      console.error("Error al enviar la orden:", err);
      await Swal.fire("Sin backend", "Pedido creado localmente (demo).", "info");
      disminuirInventario(items);
      localStorage.removeItem("carrito");
      setTimeout(() => window.location.href = "index.html", 1200);
    }
  });
});

function actualizarVistaPago() {
  const metodo = document.querySelector("input[name='pago']:checked")?.value || "tarjeta";

  const divTarjeta = document.getElementById("pago-tarjeta");
  const divTrans = document.getElementById("pago-transferencia");
  const divOxxo = document.getElementById("pago-oxxo");

  if (divTarjeta && divTrans && divOxxo) {
    divTarjeta.classList.add("oculto");
    divTrans.classList.add("oculto");
    divOxxo.classList.add("oculto");

    if (metodo === "tarjeta") divTarjeta.classList.remove("oculto");
    if (metodo === "transferencia") divTrans.classList.remove("oculto");
    if (metodo === "oxxo") divOxxo.classList.remove("oculto");
  }
}

function validarDatosPago(envio) {
  const metodo = envio.pago;

  if (metodo === "tarjeta") {
    if (!envio.tarjeta_nombre || !envio.tarjeta_numero || !envio.tarjeta_vencimiento || !envio.tarjeta_cvv) {
      Swal.fire("Datos de tarjeta incompletos", "Llena todos los campos de la tarjeta.", "warning");
      return false;
    }

    const digits = envio.tarjeta_numero.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) {
      Swal.fire("Número de tarjeta inválido", "Verifica el número de tu tarjeta (simulado).", "warning");
      return false;
    }
    if (envio.tarjeta_cvv.length < 3 || envio.tarjeta_cvv.length > 4) {
      Swal.fire("CVV inválido", "Verifica el CVV (3 o 4 dígitos).", "warning");
      return false;
    }
  }

  if (metodo === "transferencia") {
    if (!envio.trans_banco || !envio.trans_cuenta || !envio.trans_titular || !envio.trans_referencia) {
      Swal.fire("Datos de transferencia incompletos", "Llena todos los campos para pago por transferencia.", "warning");
      return false;
    }
  }

  if (metodo === "oxxo") {
    if (!envio.oxxo_nombre || !envio.oxxo_email) {
      Swal.fire("Datos para OXXO incompletos", "Ingresa el nombre del pagador y el correo para el comprobante.", "warning");
      return false;
    }
  }

  return true;
}

function calcularTotales(items, pais = "MX") {
  const subtotal = items.reduce((s, i) => s + (i.subtotal || 0), 0);

  let taxRate;
  let ship;

  if (pais === "US") {
    taxRate = 0.10; 
    ship = subtotal > 1000 ? 0 : 150; 
  } else {
    taxRate = 0.16; 
    ship = subtotal > 1000 ? 0 : 50;
  }

  const tax = subtotal * taxRate;
  const total = subtotal + tax + ship;

  // Actualizar resumen en la vista
  const subEl = document.getElementById("sub");
  const taxEl = document.getElementById("tax");
  const shipEl = document.getElementById("ship");
  const totalEl = document.getElementById("total");

  if (subEl) subEl.textContent = subtotal.toFixed(2);
  if (taxEl) taxEl.textContent = tax.toFixed(2);
  if (shipEl) shipEl.textContent = ship.toFixed(2);
  if (totalEl) totalEl.textContent = total.toFixed(2);

  return { subtotal, tax, ship, total };
}

function actualizarResumenCheckout(items, pais) {
  calcularTotales(items, pais);
}

function generarNotaHTML(order) {
  const rows = order.items
    .map(
      it =>
        `<tr><td>${it.nombre}</td><td>${it.cantidad}</td><td>$${it.precio.toFixed(
          2
        )}</td><td>$${it.subtotal.toFixed(2)}</td></tr>`
    )
    .join("");

  return `
  <html>
  <head>
    <title>Nota de compra</title>
    <style>
      body{font-family:Arial;padding:20px}
      table{width:100%;border-collapse:collapse}
      td,th{border:1px solid #ddd;padding:8px}
    </style>
  </head>
  <body>
    <h1>BotellonesMX - Nota de compra</h1>
    <p>Fecha: ${new Date(order.fecha).toLocaleString()}</p>
    <p>Cliente: ${order.cliente}</p>
    <p>Dirección: ${order.direccion}</p>
    <p>País: ${order.pais}</p>
    <p>Método de pago (simulado): ${order.metodoPago}</p>

    <table>
      <thead>
        <tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
    <p>Impuestos: $${order.tax.toFixed(2)}</p>
    <p>Envío: $${order.ship.toFixed(2)}</p>
    <h3>Total: $${order.total.toFixed(2)}</h3>
    <p>Gracias por su compra.</p>
  </body>
  </html>
  `;
}

function disminuirInventario(items) {
  const productos = JSON.parse(localStorage.getItem("productos") || "[]");
  items.forEach(it => {
    const idx = productos.findIndex(p => p.id === it.id);
    if (idx >= 0) {
      productos[idx].stock = Math.max(0, (productos[idx].stock || 0) - it.cantidad);
    }
  });
  localStorage.setItem("productos", JSON.stringify(productos));
}