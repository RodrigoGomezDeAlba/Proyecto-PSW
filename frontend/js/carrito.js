// carrito.js
function obtenerCarrito(){ return JSON.parse(localStorage.getItem("carrito") || "[]"); }
function guardarCarrito(c){ localStorage.setItem("carrito", JSON.stringify(c)); actualizarBadge(); }

function agregarAlCarrito(productId, qty=1){
  const prod = obtenerProductos().find(p=>p.id===productId);
  if(!prod){ Swal.fire('Error','Producto no existe','error'); return; }
  const carrito = obtenerCarrito();
  const item = carrito.find(i=>i.id===productId);
  if(item){
    item.qty += qty;
  } else {
    carrito.push({ id: productId, qty });
  }
  guardarCarrito(carrito);
  Swal.fire('Listo','Producto agregado al carrito','success');
  actualizarBadge();
}

function eliminarDelCarrito(productId){
  let carrito = obtenerCarrito();
  carrito = carrito.filter(i=> i.id !== productId);
  guardarCarrito(carrito);
}

function actualizarCantidad(productId, qty){
  const carrito = obtenerCarrito();
  const item = carrito.find(i=>i.id===productId);
  if(item){
    item.qty = qty;
    if(item.qty<=0) eliminarDelCarrito(productId);
    guardarCarrito(carrito);
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  const cont = document.getElementById("carrito-list");
  if (!cont) return;
  renderCarrito();
});

function renderCarrito(){
  const cont = document.getElementById("carrito-list");
  if(!cont) return;
  const carrito = obtenerCarrito();
  const prods = obtenerProductos();
  if(carrito.length===0){ cont.innerHTML = "<p>Tu carrito está vacío</p>"; actualizarResumen(); return; }
  cont.innerHTML = "";
  carrito.forEach(item=>{
    const p = prods.find(x=> x.id===item.id);
    const el = document.createElement("div"); el.className="card";
    el.innerHTML = `<h4>${p.nombre}</h4>
      <p>Precio: $${p.precio.toFixed(2)}</p>
      <p>Cantidad: <input type="number" value="${item.qty}" min="1" data-id="${p.id}" class="qty-input" /></p>
      <p>Subtotal: $${(p.precio*item.qty).toFixed(2)}</p>
      <button class="btn eliminar" data-id="${p.id}">Eliminar</button>`;
    cont.appendChild(el);
  });

  cont.querySelectorAll(".eliminar").forEach(b=> b.addEventListener("click", e=>{
    eliminarDelCarrito(parseInt(e.target.dataset.id));
    renderCarrito();
  }));
  cont.querySelectorAll(".qty-input").forEach(inp=>{
    inp.addEventListener("change", e=>{
      const id = parseInt(e.target.dataset.id);
      const val = parseInt(e.target.value) || 1;
      actualizarCantidad(id,val);
      renderCarrito();
    });
  });

  actualizarResumen();
}

function actualizarResumen(){
  const carrito = obtenerCarrito();
  const prods = obtenerProductos();
  const subtotal = carrito.reduce((s,it)=>{
    const p = prods.find(x=>x.id===it.id);
    return s + (p? p.precio * it.qty : 0);
  },0);
  const tax = subtotal * 0.16;
  const ship = subtotal > 1000 ? 0 : 50; // ejemplo
  const total = subtotal + tax + ship;
  document.getElementById("sub") && (document.getElementById("sub").textContent = subtotal.toFixed(2));
  document.getElementById("tax") && (document.getElementById("tax").textContent = tax.toFixed(2));
  document.getElementById("ship") && (document.getElementById("ship").textContent = ship.toFixed(2));
  document.getElementById("total") && (document.getElementById("total").textContent = total.toFixed(2));
  document.querySelectorAll("#badge-count, #badge-count-2").forEach(el=>{
    const count = carrito.reduce((s,i)=> s + i.qty,0);
    el.textContent = count;
  });
}