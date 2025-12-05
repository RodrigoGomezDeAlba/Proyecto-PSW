// Usa los helpers globales de api.js para consumir el backend

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1) Cargar productos del backend
    const productos = await apiFetch("/api/products");
    // productos viene con campos: id, nombre, descripcion, categoria, precio, inventario, imagen_url, oferta
    const adaptados = productos.map(p => ({
      ...p,
      stock: p.inventario,
      oferta: !!p.oferta,
    }));
    localStorage.setItem("productos", JSON.stringify(adaptados));
  } catch (err) {
    console.error("Error cargando productos desde el backend", err);
  }

  actualizarBadge();
  actualizarUsuarioHeader();
  cargarDestacados();
  poblarFiltroCategorias();
  initCatalogoPage();
  initWishlistPage();
});

function obtenerProductosLS(){
  return JSON.parse(localStorage.getItem("productos") || "[]");
}

// ---- Header: mostrar nombre de usuario y logout ----

function actualizarUsuarioHeader(){
  const nav = document.querySelector(".menu");
  if (!nav) return;

  const linkLogin = nav.querySelector('a[href="login.html"]');
  const usuario = localStorage.getItem("usuario");

  if (!linkLogin) return;

  if (usuario) {
    linkLogin.textContent = `Hola, ${usuario}`;
    linkLogin.href = "#";
    linkLogin.addEventListener("click", async (e) => {
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
      if (typeof cerrarSesion === "function") {
        cerrarSesion();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "login.html";
      }
    }, { once: true });
  } else {
    linkLogin.textContent = "Login";
    linkLogin.href = "login.html";
  }
}

async function actualizarBadge(){
  try {
    // para que lo tome del backend
    const items = await apiGetCart();  // cada item tiene 'cantidad'
    const count = items.reduce((s, it) => s + (it.cantidad || 0), 0);

    document
      .querySelectorAll("#badge-count, #badge-count-2")
      .forEach(el => el.textContent = count);
  } catch (err) {
    console.error("Error cargando carrito para badge:", err);
    // Si hay error  mostramos 0
    document
      .querySelectorAll("#badge-count, #badge-count-2")
      .forEach(el => el.textContent = "0");
  }
}

function cargarDestacados(){
  const productos = obtenerProductosLS();
  const cont = document.getElementById("destacados");
  if (!cont) return;
  cont.innerHTML = "";
  productos.slice(0,4).forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    const etiquetaOferta = p.oferta ? '<span class="tag-oferta">En oferta</span>' : '';
    card.innerHTML = `<h4>${p.nombre} ${p.stock===0?'<span style="color:red">(Sin stock)</span>':''} ${etiquetaOferta}</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <button class="btn agregar" data-id="${p.id}" ${p.stock===0?"disabled":""}>Agregar</button>
      <button class="btn wishlist-btn" data-id="${p.id}" title="Agregar a wishlist">❤</button>`;
    cont.appendChild(card);
  });
  cont.querySelectorAll(".agregar").forEach(b=> b.addEventListener("click", e=>{
    const id = parseInt(e.target.dataset.id);
    agregarAlCarrito(id,1);
  }));
  cont.querySelectorAll(".wishlist-btn").forEach(b=> b.addEventListener("click", e=>{
    const id = parseInt(e.target.dataset.id);
    agregarAWishlist(id);
  }));
}

function poblarFiltroCategorias(){
  const productos = obtenerProductosLS();
  const cats = Array.from(new Set(productos.map(p=>p.categoria)));
  const sel = document.getElementById("filtro-categoria");
  if (!sel) return;
  sel.innerHTML = `<option value="todos">Todos</option>`;
  cats.forEach(c=> sel.innerHTML += `<option value="${c}">${c}</option>`);
}

function initCatalogoPage(){
  const cont = document.getElementById("catalogo");
  if (!cont) return;

  const btnFiltro = document.getElementById("aplicar-filtro");
  if (btnFiltro) {
    btnFiltro.addEventListener("click", (e)=>{
      e.preventDefault();
      renderCatalogo();
    });
  }

  renderCatalogo();
}

function renderCatalogo(){
  const cont = document.getElementById("catalogo");
  if (!cont) return;

  const productos = obtenerProductosLS();

  const selCat = document.getElementById("filtro-categoria");
  const inputMin = document.getElementById("precio-min");
  const inputMax = document.getElementById("precio-max");
  const chkOferta = document.getElementById("solo-oferta");

  const categoria = selCat ? selCat.value : "todos";
  const min = inputMin && inputMin.value !== "" ? parseFloat(inputMin.value) : null;
  const max = inputMax && inputMax.value !== "" ? parseFloat(inputMax.value) : null;
  const soloOferta = chkOferta ? chkOferta.checked : false;

  let filtrados = productos.filter(p=>{
    if (categoria !== "todos" && p.categoria !== categoria) return false;
    if (min !== null && p.precio < min) return false;
    if (max !== null && p.precio > max) return false;
    if (soloOferta && !p.oferta) return false;
    return true;
  });

  cont.innerHTML = "";

  if (!filtrados.length){
    cont.innerHTML = "<p>No se encontraron productos con esos filtros.</p>";
    return;
  }

  filtrados.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    const etiquetaOferta = p.oferta ? '<span class="tag-oferta">En oferta</span>' : '';
    card.innerHTML = `<h4>${p.nombre} ${p.stock===0?'<span style="color:red">(Sin stock)</span>':''} ${etiquetaOferta}</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <p>Stock: ${p.stock}</p>
      <button class="btn agre  cont.querySelectorAll(".agregar").forEach(b=> b.addEventListener("click", e=>{
    const id = parseInt(e.target.dataset.id);
    agregarAlCarrito(id,1);
  }));
}

// ---- Wishlist (lista de deseos por usuario) ----

function getUsuarioEmail() {
  return localStorage.getItem("userEmail") || null;
}

function getWishlist() {
  const email = getUsuarioEmail();
  if (!email) return [];
  const raw = localStorage.getItem(`wishlist_${email}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function saveWishlist(lista) {
  const email = getUsuarioEmail();
  if (!email) return;
  localStorage.setItem(`wishlist_${email}`, JSON.stringify(lista));
}

async function agregarAWishlist(productId) {
  const token = typeof obtenerToken === "function" ? obtenerToken() : localStorage.getItem("token");
  if (!token) {
    if (window.Swal) {
      await Swal.fire("Inicia sesión", "Debes iniciar sesión para usar la wishlist", "info");
    }
    window.location.href = "login.html";
    return;
  }

  const productos = obtenerProductosLS();
  const prod = productos.find(p => p.id === productId);
  if (!prod) return;

  const lista = getWishlist();
  if (!lista.some(p => p.id === prod.id)) {
    lista.push({
      id: prod.id,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      categoria: prod.categoria,
      stock: prod.stock,
      oferta: !!prod.oferta,
    });
    saveWishlist(lista);
  }

  if (window.Swal) {
    await Swal.fire("Wishlist", "Producto agregado a tu lista de deseos", "success");
  }
}

function renderWishlist() {
  const cont = document.getElementById("wishlist-list");
  if (!cont) return;

  const lista = getWishlist();
  cont.innerHTML = "";

  if (!lista.length) {
    cont.innerHTML = "<p>No tienes productos en tu lista de deseos.</p>";
    return;
  }

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    const etiquetaOferta = p.oferta ? '<span class="tag-oferta">En oferta</span>' : '';
    card.innerHTML = `
      <h4>${p.nombre} ${p.stock===0?'<span style="color:red">(Sin stock)</span>':''} ${etiquetaOferta}</h4>
      <p>${p.descripcion || ''}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <button class="btn agregar" data-id="${p.id}" ${p.stock===0?"disabled":""}>Agregar al carrito</button>
    `;
    cont.appendChild(card);
  });

  cont.querySelectorAll(".agregar").forEach(b => b.addEventListener("click", e => {
    const id = parseInt(e.target.dataset.id);
    agregarAlCarrito(id, 1);
  }));
}

function initWishlistPage() {
  const cont = document.getElementById("wishlist-list");
  if (!cont) return;
  renderWishlist();
}

// Exponer por si se quiere usar desde otros scripts
window.agregarAWishlist = agregarAWishlist;
`;
    cont.appendChild(card);
  });

  cont.querySelectorAll(".agregar").forEach(b=> b.addEventListener("click", e=>{
    const id = parseInt(e.target.dataset.id);
    agregarAlCarrito(id,1);
  }));

  cont.querySelectorAll(".wishlist-btn").forEach(b=> b.addEventListener("click", e=>{
    const id = parseInt(e.target.dataset.id);
    agregarAWishlist(id);
  }));
}
