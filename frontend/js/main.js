// Usa los helpers globales de api.js para consumir el backend

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductosDesdeBackend();
  await actualizarBadge();
  actualizarUsuarioHeader();
  cargarDestacados();
  poblarFiltroCategorias();
  initCatalogoPage();
  initWishlistPage();
});

// Carga todos los productos desde el backend y los guarda en window.PRODUCTOS
async function cargarProductosDesdeBackend() {
  try {
    const productos = await apiFetch("/api/products");
    // Adaptar al formato que usa el frontend
    window.PRODUCTOS = productos.map(p => ({
      ...p,
      stock: p.inventario,
      oferta: !!p.oferta,
    }));
    console.log("Productos cargados desde backend:", window.PRODUCTOS);
  } catch (err) {
    console.error("Error cargando productos desde el backend", err);
    window.PRODUCTOS = [];
  }
}

function obtenerProductos() {
  return window.PRODUCTOS || [];
}

async function actualizarBadge() {
  try {
    const items = await apiGetCart(); // cada item tiene 'cantidad'
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

function obtenerUsuarioActual() {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function actualizarUsuarioHeader() {
  const nav = document.querySelector(".menu");
  if (!nav) return;

  const linkLogin = nav.querySelector('a[href="login.html"], a[href="login.html#"]');

  // Limpiar posibles elementos previos para evitar duplicados
  const existenteUsuario = nav.querySelector(".usuario-header");
  if (existenteUsuario) existenteUsuario.remove();
  const existenteLogout = nav.querySelector(".logout-link");
  if (existenteLogout) existenteLogout.remove();

  const token = typeof obtenerToken === "function" ? obtenerToken() : null;

  if (!token) {
    if (linkLogin) {
      linkLogin.style.display = "";
      linkLogin.textContent = "Login";
      linkLogin.href = "login.html";
    }
    return;
  }

  const usuario = obtenerUsuarioActual();
  const nombre = usuario && usuario.nombre ? usuario.nombre : "Usuario";

  // Ocultar el enlace de login
  if (linkLogin) {
    linkLogin.style.display = "none";
  }

  const spanUsuario = document.createElement("span");
  spanUsuario.className = "usuario-header";
  spanUsuario.textContent = nombre;

  const logoutLink = document.createElement("a");
  logoutLink.href = "#";
  logoutLink.textContent = "Cerrar sesión";
  logoutLink.className = "logout-link";

  logoutLink.addEventListener(
    "click",
    async e => {
      e.preventDefault();
      let confirmar = true;
      if (window.Swal) {
        const res = await Swal.fire({
          title: "Cerrar sesión",
          text: "¿Deseas cerrar tu sesión?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, salir",
          cancelButtonText: "Cancelar",
        });
        confirmar = res.isConfirmed;
      }
      if (!confirmar) return;

      if (typeof cerrarSesion === "function") {
        cerrarSesion();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }

      window.location.href = "index.html";
    },
    { once: true }
  );

  nav.appendChild(spanUsuario);
  nav.appendChild(logoutLink);
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

  const filtrados = productos.filter(p => {
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

  filtrados.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";

    const imgSrc = p.imagen_url && p.imagen_url.trim() !== "" 
      ? p.imagen_url 
      : "img/logo.png";

    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.nombre}" class="card-img" />
      <h4>${p.nombre} ${p.stock===0?'<span style="color:red">(Sin stock)</span>':''}</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <p>Stock: ${p.stock}</p>
      <button class="btn agregar" data-id="${p.id}" ${p.stock===0?"disabled":""}>Agregar</button>
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
  const token = typeof obtenerToken === "function" ? obtenerToken() : null;
  if (!token) {
    if (window.Swal) {
      await Swal.fire(
        "Inicia sesi�n",
        "Debes iniciar sesi�n para usar la lista de deseos.",
        "info"
      );
    } else {
      alert("Debes iniciar sesi�n para usar la lista de deseos.");
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
      "<p>Los productos de tu lista ya no est�n disponibles.</p>";
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
        <button class="btn-wish active" data-id="${p.id}" aria-label="Quitar de lista de deseos">?</button>
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
