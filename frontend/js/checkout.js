import { API_URL, obtenerToken, apiGetCart } from "./api.js";



document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("form-checkout");
  if(!form) return;

  if (typeof actualizarResumen === "function") {
    actualizarResumen();
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const formData = new FormData(form);
    const envio = Object.fromEntries(formData.entries());
    if (rawItems.length === 0) {
     Swal.fire('Carrito vacío','Agrega productos antes de comprar','info');
     return;
   }
   const items = rawItems.map(it => ({
     id: it.producto_id,
     nombre: it.nombre,
     precio: it.precio_unitario,
     cantidad: it.cantidad,
     subtotal: it.subtotal
   }));
    const subtotal = items.reduce((s,i)=> s + i.subtotal,0);
    const tax = subtotal * 0.16;
    const ship = subtotal > 1000 ? 0 : 50;
    const total = subtotal + tax + ship;

    const order = {
      fecha: new Date().toISOString(),
      cliente: envio.nombre,
      correo: envio.email || null,
      direccion: envio.direccion + ", " + envio.ciudad + " CP:" + envio.cp,
      pais: envio.pais,
      items, subtotal, tax, ship, total
    };

    const notaHTML = generarNotaHTML(order);
    const w = window.open("", "_blank");
    w.document.write(notaHTML);
    w.document.close();
    w.focus();
    setTimeout(()=> w.print(), 700);

    try {
      const token = obtenerToken();
      if (!token) {
        await Swal.fire('Inicia sesión', 'Debes iniciar sesión para completar la compra', 'info');
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

      Swal.fire('Compra simulada','Nota generada y enviada al servidor (simulado)','success');
      disminuirInventario(items);
      localStorage.removeItem("carrito");
      setTimeout(()=> window.location.href="index.html", 1200);
    } catch (err) {
      Swal.fire('Sin backend','Pedido creado localmente (demo).','info');
      disminuirInventario(items);
      localStorage.removeItem("carrito");
      setTimeout(()=> window.location.href="index.html", 1200);
    }
  });
});

function generarNotaHTML(order){
  const rows = order.items.map(it=> `<tr><td>${it.nombre}</td><td>${it.cantidad}</td><td>$${it.precio.toFixed(2)}</td><td>$${it.subtotal.toFixed(2)}</td></tr>`).join("");
  return `
  <html>
  <head><title>Nota de compra</title>
  <style>
  body{font-family:Arial;padding:20px} table{width:100%;border-collapse:collapse}
  td,th{border:1px solid #ddd;padding:8px}
  </style>
  </head>
  <body>
    <h1>BotellonesMX - Nota de compra</h1>
    <p>Fecha: ${new Date(order.fecha).toLocaleString()}</p>
    <p>Cliente: ${order.cliente}</p>
    <p>Dirección: ${order.direccion}</p>
    <table>
      <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
    <p>Impuestos: $${order.tax.toFixed(2)}</p>
    <p>Envío: $${order.ship.toFixed(2)}</p>
    <h3>Total: $${order.total.toFixed(2)}</h3>
    <p>Gracias por su compra.</p>
  </body></html>
  `;
}

function disminuirInventario(items){
  const productos = JSON.parse(localStorage.getItem("productos") || "[]");
  items.forEach(it=>{
    const idx = productos.findIndex(p=>p.id===it.id);
    if(idx>=0){
      productos[idx].stock = Math.max(0, productos[idx].stock - it.cantidad);
    }
  });
  localStorage.setItem("productos", JSON.stringify(productos));
}