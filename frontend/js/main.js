document.addEventListener("DOMContentLoaded", ()=>{
  if (!localStorage.getItem("productos-demo")) {
    const demo = [
      {id:1,nombre:"Producto A1",descripcion:"Desc A1",precio:120,stock:10,categoria:"Cat1",oferta:false},
      {id:2,nombre:"Producto A2",descripcion:"Desc A2",precio:220,stock:0,categoria:"Cat1",oferta:true},
      {id:3,nombre:"Producto B1",descripcion:"Desc B1",precio:80,stock:5,categoria:"Cat2",oferta:false},
      {id:4,nombre:"Producto B2",descripcion:"Desc B2",precio:95,stock:7,categoria:"Cat2",oferta:true},
      {id:5,nombre:"Producto C1",descripcion:"Desc C1",precio:150,stock:3,categoria:"Cat3",oferta:false},
      {id:6,nombre:"Producto C2",descripcion:"Desc C2",precio:60,stock:20,categoria:"Cat3",oferta:true},
      {id:7,nombre:"Producto A3",descripcion:"Desc",precio:70,stock:12,categoria:"Cat1",oferta:false},
      {id:8,nombre:"Producto B3",descripcion:"Desc",precio:55,stock:9,categoria:"Cat2",oferta:false}
    ];
    localStorage.setItem("productos-demo", JSON.stringify(demo));
    localStorage.setItem("productos", JSON.stringify(demo));
  }

  actualizarBadge();
  cargarDestacados();
  poblarFiltroCategorias();
  initCatalogoPage();
});

function obtenerProductosLS(){
  return JSON.parse(localStorage.getItem("productos") || "[]");
}

function actualizarBadge(){
  const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  const count = carrito.reduce((s,i)=> s + i.qty,0);
  document.querySelectorAll("#badge-count, #badge-count-2").forEach(el=> el.textContent = count);
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