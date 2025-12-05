async function obtenerCarrito() {
  return apiGetCart();
}

async function agregarAlCarrito(productId, qty = 1) {
  const token = obtenerToken();
  if (!token) {
    await Swal.fire("Inicia sesión", "Debes iniciar sesión para agregar productos al carrito", "info");
    window.location.href = "login.html";
    return;
  }

  try {
    await apiAddCartItem(productId, qty);
    await Swal.fire("Listo", "Producto agregado al carrito", "success");
    await renderCarrito(); // recarga desde el backend
  } catch (err) {
    await Swal.fire("Error", err.message || "No se pudo agregar al carrito", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
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
  const baseImg = window.API_URL || "";

  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "card";

    let imgSrc = "img/logo.png";
    if (item.imagen_url) {
      if (item.imagen_url.startsWith("/")) {
        imgSrc = `${baseImg}${item.imagen_url}`;
      } else {
        imgSrc = `${baseImg}/img/productos/${item.imagen_url}`;
      }
    }

    el.innerHTML = `
      <img src="${imgSrc}" alt="${item.nombre}" class="card-img" />
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

  const subEl = document.getElementById("sub");
  const taxEl = document.getElementById("tax");
  const shipEl = document.getElementById("ship");
  const totalEl = document.getElementById("total");

  if (subEl) subEl.textContent = subtotal.toFixed(2);
  if (taxEl) taxEl.textContent = tax.toFixed(2);
  if (shipEl) shipEl.textContent = ship.toFixed(2);
  if (totalEl) totalEl.textContent = total.toFixed(2);

  const count = items.reduce((s, it) => s + it.cantidad, 0);
  document.querySelectorAll("#badge-count, #badge-count-2").forEach(el => {
    el.textContent = count;
  });
}

// Exponer algunas funciones si se necesitan en otros scripts
window.agregarAlCarrito = agregarAlCarrito;
window.actualizarResumenDesdeItems = actualizarResumenDesdeItems;
window.renderCarrito = renderCarrito;
