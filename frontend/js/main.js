// Usa los helpers globales de api.js para consumir el backend

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1) Cargar productos del backend
    const productos = await apiFetch("/api/products");
    // productos viene con campos: id, nombre, descripcion, categoria, precio, inventario, imagen_url
    const adaptados = productos.map(p => ({
      ...p,
      stock: p.inventario
    }));
    localStorage.setItem("productos", JSON.stringify(adaptados));
  } catch (err) {
    console.error("Error cargando productos desde el backend", err);
  }

  actualizarBadge();
  cargarDestacados();
  poblarFiltroCategorias();
  initCatalogoPage();
});

function obtenerProductosLS(){
  return JSON.parse(localStorage.getItem("productos") || "[]");
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
    card.innerHTML = `<h4>${p.nombre} ${p.stock===0?'<span style="color:red">(Sin stock)</span>':''}</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <button class="btn agregar" data-id="${p.id}" ${p.stock===0?"disabled":""}>Agregar</button>`;
    cont.appendChild(card);
  });
  cont.querySelectorAll(".agregar").forEach(b=> b.addEventListener("click", e=>{
    const id = parseInt(e.target.dataset.id);
    agregarAlCarrito(id,1);
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
    card.innerHTML = `<h4>${p.nombre} ${p.stock===0?'<span style="color:red">(Sin stock)</span>':''}</h4>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio.toFixed(2)}</strong></p>
      <p>Stock: ${p.stock}</p>
      <button class="btn agregar" data-id="${p.id}" ${p.stock===0?"disabled":""}>Agregar</button>`;
    cont.appendChild(card);
  });

  cont.querySelectorAll(".agregar").forEach(b=> b.addEventListener("click", e=>{
    const id = parseInt(e.target.dataset.id);
    agregarAlCarrito(id,1);
  }));
}