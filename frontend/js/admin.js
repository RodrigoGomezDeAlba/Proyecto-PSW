let productoEditandoId = null;

document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("form-producto");
  const lista = document.getElementById("lista-productos");
  if (!lista || !form) return;

  renderProductos();

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const fd = new FormData(form);
    const datos = {
      nombre: fd.get("nombre"),
      precio: parseFloat(fd.get("precio") || 0),
      stock: parseInt(fd.get("inventario") || 0),
      categoria: fd.get("categoria"),
      oferta: fd.get("oferta") === "on"
    };

    if (productoEditandoId) {
      editarProducto(productoEditandoId, datos);
      Swal.fire('Listo','Producto actualizado','success');
      productoEditandoId = null;
    } else {
      agregarProducto(datos);
      Swal.fire('Listo','Producto agregado','success');
    }

    form.reset();
    renderProductos();
    actualizarVentasSimuladas();
  });

  function renderProductos(){
    const prods = obtenerProductos();
    lista.innerHTML = "";
    prods.forEach(p=>{
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `<h4>${p.nombre} ${p.stock===0?'<small style="color:red">(Sin stock)</small>':''}</h4>
        <p>Precio: $${p.precio}</p>
        <p>Categoría: ${p.categoria}</p>
        <p>Inventario: ${p.stock}</p>
        <button class="btn editar" data-id="${p.id}">Editar</button>
        <button class="btn eliminar" data-id="${p.id}">Eliminar</button>`;
      lista.appendChild(el);
    });

    lista.querySelectorAll(".eliminar").forEach(b=> b.addEventListener("click", e=>{
      const id = parseInt(e.target.dataset.id);
      Swal.fire({
        title:'Eliminar',
        text:'¿Seguro que deseas eliminar este producto?',
        showCancelButton:true,
        confirmButtonText:'Sí, eliminar',
        cancelButtonText:'Cancelar'
      }).then(resp=>{
        if(resp.isConfirmed){
          eliminarProducto(id);
          renderProductos();
          actualizarVentasSimuladas();
        }
      });
    }));

    lista.querySelectorAll(".editar").forEach(b=> b.addEventListener("click", e=>{
      const id = parseInt(e.target.dataset.id);
      const p = obtenerProductos().find(x=>x.id===id);
      if(!p) return;
      productoEditandoId = id;

      document.querySelector('[name="nombre"]').value = p.nombre;
      document.querySelector('[name="precio"]').value = p.precio;
      document.querySelector('[name="inventario"]').value = p.stock;
      document.querySelector('[name="categoria"]').value = p.categoria;
      document.querySelector('[name="oferta"]').checked = p.oferta;

      Swal.fire('Editando','Modifica los datos y da clic en "Guardar producto" para actualizar.','info');
    }));
  }

  actualizarVentasSimuladas();
});

function actualizarVentasSimuladas(){
  const productos = obtenerProductos();
  const categorias = Array.from(new Set(productos.map(p=>p.categoria)));
  const ventas = categorias.map(cat=>{
    const total = productos
      .filter(p=>p.categoria===cat)
      .reduce((s,p)=> s + (p.precio*(Math.random()*5)),0);
    return {categoria:cat, total: Math.round(total)};
  });

  const totalVentas = ventas.reduce((s,v)=>s+v.total,0);
  if (document.getElementById("ventas-total")) {
    document.getElementById("ventas-total").textContent = totalVentas;
  }

  const canvas = document.getElementById("grafica-ventas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (ventas.length === 0) return;

  const max = Math.max(...ventas.map(v=>v.total),1);
  ventas.forEach((v,i)=>{
    const barH = (v.total / max) * (canvas.height - 40);
    const x = 40 + i* (canvas.width / ventas.length);
    const y = canvas.height - barH - 20;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x,y,40,barH);
    ctx.fillStyle = '#000';
    ctx.fillText(v.categoria, x, canvas.height - 5);
    ctx.fillText(`$${v.total}`, x, y - 6);
  });
}