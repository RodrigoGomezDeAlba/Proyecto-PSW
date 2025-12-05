document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductosDesdeBackend();
  await actualizarBadge();
  actualizarUsuarioHeader();
  cargarDestacados();
  poblarFiltroCategorias();
  initCatalogoPage();
  initWishlistPage();
});

async function cargarProductosDesdeBackend() {
  try {
    const productos = await apiFetch("/api/products");
    window.PRODUCTOS = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      precio: Number(p.precio),
      stock: p.inventario,
      imagen_url: p.imagen_url,
      oferta: !!p.oferta,
    }));
  } catch (err) {
    console.error("Error cargando productos desde el backend:", err);
    window.PRODUCTOS = window.PRODUCTOS || [];
  }
}

function obtenerProductos() {
  return window.PRODUCTOS || [];
}

async function actualizarBadge() {
  try {
    const items = await apiGetCart();            // cada item tiene 'cantidad'
    const count = items.reduce((s, it) => s + (it.cantidad || 0), 0);
    document
      .querySelectorAll("#badge-count, #badge-count-2")
      .forEach(el => (el.textContent = count));
  } catch (err) {
    console.error("Error cargando carrito para badge:", err);
    document
      .querySelectorAll("#badge-count, #badge-count-2")
      .forEach(el => (el.textContent = "0"));
  }
}

function actualizarUsuarioHeader() {
  const nav = document.querySelector(".menu");
  if (!nav) return;

  const linkLogin = nav.querySelector('a[href="login.html"]');
  if (!linkLogin) return;

  const token = obtenerToken();
  if (!token) {
    linkLogin.textContent = "Login";
    linkLogin.href = "login.html";
    return;
  }

  linkLogin.textContent = "Cerrar sesión";
  linkLogin.href = "#";
  linkLogin.addEventListener(
    "click",
    async e => {
      e.preventDefault();
      if (window.Swal) {
        const res = await Swal.fire({
          title: "Cerrar sesión",
          text: "¿Deseas cerrar tu sesión?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, salir",
          cancelButtonText: "Cancelar",
        });
        if (!res.isConfirmed) return;
      }
      cerrarSesion();
    },
    { once: true }
  );
}

function cargarDestacados() {
  const productos = obtenerProductos();
  const cont = document.getElementById("destacados");
  if (!cont) return;

  cont.innerHTML = "";
  productos.slice(0, 4).forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    const enWishlist = isInWishlist(p.id);

    card.innerHTML = `
      <img class="product-img" src="${p.imagen_url || 'img/botella-placeholder.png'}" alt="${p.nombre}">
      <h4>${p.nombre} ${
      p.stock === 0 ? '<span style="color:red">(Sin stock)</span>' : ""
    }</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <div class="card-actions">
        <button class="btn agregar" data-id="${p.id}" ${
      p.stock === 0 ? "disabled" : ""
    }>Agregar</button>
        <button class="btn-wish ${
          enWishlist ? "active" : ""
        }" data-id="${p.id}" aria-label="Lista de deseos">
          ${enWishlist ? "♥" : "♡"}
        </button>
      </div>
    `;
    cont.appendChild(card);
  });

  cont.querySelectorAll(".agregar").forEach(b =>
    b.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id, 10);
      agregarAlCarrito(id, 1);
    })
  );

  cont.querySelectorAll(".btn-wish").forEach(b =>
    b.addEventListener("click", e => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      toggleWishlist(id);
      const active = isInWishlist(id);
      e.currentTarget.classList.toggle("active", active);
      e.currentTarget.textContent = active ? "♥" : "♡";
    })
  );
}

function poblarFiltroCategorias() {
  const productos = obtenerProductos();
  const cats = Array.from(new Set(productos.map(p => p.categoria)));
  const sel = document.getElementById("filtro-categoria");
  if (!sel) return;
  sel.innerHTML = `<option value="todos">Todos</option>`;
  cats.forEach(c => (sel.innerHTML += `<option value="${c}">${c}</option>`));
}

function initCatalogoPage() {
  const cont = document.getElementById("catalogo");
  if (!cont) return;

  const btnFiltro = document.getElementById("aplicar-filtro");
  if (btnFiltro) {
    btnFiltro.addEventListener("click", e => {
      e.preventDefault();
      renderCatalogo();
    });
  }

  renderCatalogo();
}

function renderCatalogo() {
  const cont = document.getElementById("catalogo");
  if (!cont) return;

  const productos = obtenerProductos();

  const selCat = document.getElementById("filtro-categoria");
  const inputMin = document.getElementById("precio-min");
  const inputMax = document.getElementById("precio-max");
  const chkOferta = document.getElementById("solo-oferta");

  const categoria = selCat ? selCat.value : "todos";
  const min =
    inputMin && inputMin.value !== "" ? parseFloat(inputMin.value) : null;
  const max =
    inputMax && inputMax.value !== "" ? parseFloat(inputMax.value) : null;
  const soloOferta = chkOferta ? chkOferta.checked : false;

  let filtrados = productos.filter(p => {
    if (categoria !== "todos" && p.categoria !== categoria) return false;
    if (min !== null && p.precio < min) return false;
    if (max !== null && p.precio > max) return false;
    if (soloOferta && !p.oferta) return false;
    return true;
  });

  cont.innerHTML = "";

  if (!filtrados.length) {
    cont.innerHTML = "<p>No se encontraron productos con esos filtros.</p>";
    return;
  }

  filtrados.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    const enWishlist = isInWishlist(p.id);
    const etiquetaOferta = p.oferta
      ? '<span class="tag-oferta">En oferta</span>'
      : "";

    card.innerHTML = `
      <img class="product-img" src="${p.imagen_url || 'img/botella-placeholder.png'}" alt="${p.nombre}">
      <h4>${p.nombre} ${
      p.stock === 0 ? '<span style="color:red">(Sin stock)</span>' : ""
    } ${etiquetaOferta}</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <p>Stock: ${p.stock}</p>
      <div class="card-actions">
        <button class="btn agregar" data-id="${p.id}" ${
      p.stock === 0 ? "disabled" : ""
    }>Agregar</button>
        <button class="btn-wish ${
          enWishlist ? "active" : ""
        }" data-id="${p.id}" aria-label="Lista de deseos">
          ${enWishlist ? "♥" : "♡"}
        </button>
      </div>
    `;
    cont.appendChild(card);
  });

  cont.querySelectorAll(".agregar").forEach(b =>
    b.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id, 10);
      agregarAlCarrito(id, 1);
    })
  );

  cont.querySelectorAll(".btn-wish").forEach(b =>
    b.addEventListener("click", e => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      toggleWishlist(id);
      const active = isInWishlist(id);
      e.currentTarget.classList.toggle("active", active);
      e.currentTarget.textContent = active ? "♥" : "♡";
    })
  );
}

function getUsuarioEmail() {
  return localStorage.getItem("userEmail") || null;
}

function getWishlistKey() {
  const email = getUsuarioEmail() || "anonimo";
  return `wishlist_${email}`;
}

function getWishlist() {
  const raw = localStorage.getItem(getWishlistKey());
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function saveWishlist(listaIds) {
  localStorage.setItem(getWishlistKey(), JSON.stringify(listaIds));
}

function isInWishlist(id) {
  const lista = getWishlist();
  return lista.includes(id);
}

async function toggleWishlist(id) {
  const token = obtenerToken();
  if (!token) {
    if (window.Swal) {
      await Swal.fire(
        "Inicia sesión",
        "Debes iniciar sesión para usar la lista de deseos.",
        "info"
      );
    } else {
      alert("Debes iniciar sesión para usar la lista de deseos.");
    }
    window.location.href = "login.html";
    return;
  }

  const lista = getWishlist();
  const idx = lista.indexOf(id);
  if (idx >= 0) {
    lista.splice(idx, 1);
  } else {
    lista.push(id);
  }
  saveWishlist(lista);
}

function initWishlistPage() {
  const cont = document.getElementById("wishlist-list");
  if (!cont) return;
  renderWishlist(cont);
}

function renderWishlist(cont) {
  const productos = obtenerProductos();
  const ids = getWishlist();

  cont.innerHTML = "";

  if (!ids.length) {
    cont.innerHTML = "<p>No tienes productos en tu lista de deseos.</p>";
    return;
  }

  const deseados = productos.filter(p => ids.includes(p.id));
  if (!deseados.length) {
    cont.innerHTML =
      "<p>Los productos de tu lista ya no están disponibles.</p>";
    return;
  }

  deseados.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    const etiquetaOferta = p.oferta
      ? '<span class="tag-oferta">En oferta</span>'
      : "";

    card.innerHTML = `
      <img class="product-img" src="${p.imagen_url || 'img/botella-placeholder.png'}" alt="${p.nombre}">
      <h4>${p.nombre} ${
      p.stock === 0 ? '<span style="color:red">(Sin stock)</span>' : ""
    } ${etiquetaOferta}</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <p>Stock: ${p.stock}</p>
      <div class="card-actions">
        <button class="btn agregar" data-id="${p.id}" ${
      p.stock === 0 ? "disabled" : ""
    }>Agregar al carrito</button>
        <button class="btn-wish active" data-id="${p.id}" aria-label="Quitar de lista de deseos">♥</button>
      </div>
    `;
    cont.appendChild(card);
  });

  cont.querySelectorAll(".agregar").forEach(b =>
    b.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id, 10);
      agregarAlCarrito(id, 1);
    })
  );

  cont.querySelectorAll(".btn-wish").forEach(b =>
    b.addEventListener("click", e => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      toggleWishlist(id);
      e.currentTarget.closest(".card").remove();
      if (!getWishlist().length) {
        cont.innerHTML = "<p>No tienes productos en tu lista de deseos.</p>";
      }
    })
  );
}

window.cargarDestacados = cargarDestacados;
window.renderCatalogo = renderCatalogo;
window.toggleWishlist = toggleWishlist;