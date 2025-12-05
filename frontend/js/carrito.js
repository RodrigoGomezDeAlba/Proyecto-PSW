import { apiGetCart, apiAddCartItem, apiUpdateCartItem, apiDeleteCartItem } from "./api.js";

// carrito.js
async function obtenerCarrito(){ return apiGetCart(); }

import { obtenerToken } from "./api.js"; // si no lo tienes ya aquí

async function agregarAlCarrito(productId, qty = 1) {
  const token = obtenerToken();
  if (!token) {
    await Swal.fire("Inicia sesión", "Debes iniciar sesión para agregar productos al carrito", "info");
    window.location.href = "login.html";
    return;
  }

  try {
    await apiAddCartItem(productId, qty);
    Swal.fire("Listo", "Producto agregado al carrito", "success");
    await renderCarrito(); // recarga desde el backend
  } catch (err) {
    Swal.fire("Error", err.message || "No se pudo agregar al carrito", "error");
  }
}



document.addEventListener("DOMContentLoaded", ()=>{
  const cont = document.getElementById("carrito-list");
  if (!cont) return;
  renderCarrito();
});

async function renderCarrito() {
  const cont = document.getElementById("carrito-list");
  if (!cont) return;

  let items;
  try {
    items = await obtenerCarrito();
  } catch (err) {
    console.error("Error obteniendo carrito:", err);
    cont.innerHTML = "<p>Error al cargar el carrito</p>";
    return;
  }

  if (!items.length) {
    cont.innerHTML = "<p>Tu carrito está vacío</p>";
    actualizarResumenDesdeItems([]);
    return;
  }

  cont.innerHTML = "";
  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h4>${item.nombre}</h4>
      <p>Precio: $${item.precio_unitario.toFixed(2)}</p>
      <p>Cantidad: <input type="number" value="${item.cantidad}" min="1"
            data-item-id="${item.itemId}" class="qty-input" /></p>
      <p>Subtotal: $${item.subtotal.toFixed(2)}</p>
      <button class="btn eliminar" data-item-id="${item.itemId}">Eliminar</button>
    `;
    cont.appendChild(el);
  });

  cont.querySelectorAll(".eliminar").forEach(b =>
    b.addEventListener("click", async e => {
      const itemId = e.target.dataset.itemId;
      await apiDeleteCartItem(itemId);
      await renderCarrito();
    })
  );

  cont.querySelectorAll(".qty-input").forEach(inp => {
    inp.addEventListener("change", async e => {
      const itemId = e.target.dataset.itemId;
      const val = parseInt(e.target.value) || 1;
      await apiUpdateCartItem(itemId, val);
      await renderCarrito();
    });
  });

  actualizarResumenDesdeItems(items);
}


function actualizarResumenDesdeItems(items) {
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const tax = subtotal * 0.16;
  const ship = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + ship;

  document.getElementById("sub") && (document.getElementById("sub").textContent = subtotal.toFixed(2));
  document.getElementById("tax") && (document.getElementById("tax").textContent = tax.toFixed(2));
  document.getElementById("ship") && (document.getElementById("ship").textContent = ship.toFixed(2));
  document.getElementById("total") && (document.getElementById("total").textContent = total.toFixed(2));

  const count = items.reduce((s, it) => s + it.cantidad, 0);
  document.querySelectorAll("#badge-count, #badge-count-2").forEach(el => {
    el.textContent = count;
  });
}