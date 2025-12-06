let productoEditandoId = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar que el usuario esté autenticado y sea administrador
  const tieneHelpersAuth = typeof obtenerToken === "function";
  const token = tieneHelpersAuth ? obtenerToken() : null;

  let usuario = null;
  try {
    const raw = localStorage.getItem("usuario");
    usuario = raw ? JSON.parse(raw) : null;
  } catch {
    usuario = null;
  }

  if (!token || !usuario || usuario.rol !== "admin") {
    if (window.Swal) {
      await Swal.fire(
        "Acceso restringido",
        "Esta sección es solo para administradores. Inicia sesión con una cuenta de administrador.",
        "warning"
      );
    }
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("form-producto");
  const lista = document.getElementById("lista-productos");
  if (!lista || !form) return;

  await renderProductosDesdeAPI();
  await actualizarResumenVentasReales();

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const datos = {
      nombre: fd.get("nombre"),
      precio: parseFloat(fd.get("precio") || 0),
      inventario: parseInt(fd.get("inventario") || 0, 10),
      categoria: fd.get("categoria"),
      oferta: fd.get("oferta") === "on",
    };

    try {
      if (productoEditandoId) {
        await apiActualizarProducto(productoEditandoId, datos);
        await Swal.fire("Listo", "Producto actualizado", "success");
        productoEditandoId = null;
      } else {
        await apiCrearProducto(datos);
        await Swal.fire("Listo", "Producto agregado", "success");
      }
      form.reset();
      await renderProductosDesdeAPI();
    } catch (err) {
      console.error("Error guardando producto:", err);
      await Swal.fire("Error", err.message || "No se pudo guardar el producto", "error");
    }
  });

  async function renderProductosDesdeAPI() {
    lista.innerHTML = "<p class='muted'>Cargando productos...</p>";
    try {
      const productos = await apiObtenerProductosAdmin();
      if (!productos.length) {
        lista.innerHTML = "<p>No hay productos registrados.</p>";
        return;
      }
      lista.innerHTML = "";
      productos.forEach(p => {
        const el = document.createElement("div");
        el.className = "card";
        const stock = Number(p.inventario || p.stock || 0);
        const oferta = !!p.oferta;
        el.innerHTML = `<h4>${p.nombre} ${stock===0?'<small style=\"color:red\">(Sin stock)</small>':''}</h4>
          <p>Precio: $${Number(p.precio).toFixed(2)}</p>
          <p>Categoría: ${p.categoria}</p>
          <p>Inventario: ${stock}</p>
          <p>${oferta ? '<span class="tag-oferta">En oferta</span>' : ''}</p>
          <button class="btn editar" data-id="${p.id}">Editar</button>
          <button class="btn eliminar" data-id="${p.id}">Eliminar</button>`;
        lista.appendChild(el);
      });

      lista.querySelectorAll(".eliminar").forEach(b =>
        b.addEventListener("click", async e => {
          const id = parseInt(e.target.dataset.id, 10);
          const resp = await Swal.fire({
            title: "Eliminar",
            text: "¿Seguro que deseas eliminar este producto?",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
          });
          if (resp.isConfirmed) {
            try {
              await apiEliminarProducto(id);
              await renderProductosDesdeAPI();
              await actualizarResumenVentasReales();
            } catch (err) {
              console.error("Error eliminando producto:", err);
              await Swal.fire("Error", err.message || "No se pudo eliminar el producto", "error");
            }
          }
        })
      );

      lista.querySelectorAll(".editar").forEach(b =>
        b.addEventListener("click", e => {
          const id = parseInt(e.target.dataset.id, 10);
          const p = Array.from(lista.children)
            .map(card => card)
            .find(card => card.querySelector(".editar").dataset.id === String(id));
          if (!p) return;
          // Para rellenar el formulario usamos los datos del DOM o mejor volvemos a llamar a productos desde la API
          (async () => {
            const productos = await apiObtenerProductosAdmin();
            const prod = productos.find(x => x.id === id);
            if (!prod) return;

            productoEditandoId = id;
            document.querySelector('[name="nombre"]').value = prod.nombre;
            document.querySelector('[name="precio"]').value = prod.precio;
            document.querySelector('[name="inventario"]').value = prod.inventario;
            document.querySelector('[name="categoria"]').value = prod.categoria;
            document.querySelector('[name="oferta"]').checked = !!prod.oferta;

            await Swal.fire(
              'Editando',
              'Modifica los datos y da clic en "Guardar producto" para actualizar.',
              'info'
            );
          })();
        })
      );
    } catch (err) {
      console.error("Error obteniendo productos admin:", err);
      lista.innerHTML = "<p>Error al cargar productos.</p>";
    }
  }
});

// --- Helpers para llamar a las APIs de admin/productos ---

async function apiObtenerProductosAdmin() {
  // Usa la misma /api/products pero el admin.html sólo se muestra si eres admin
  return apiFetch("/api/products", { method: "GET" });
}

async function apiCrearProducto(datos) {
  return apiFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

async function apiActualizarProducto(id, datos) {
  return apiFetch(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

async function apiEliminarProducto(id) {
  return apiFetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
}

async function actualizarResumenVentasReales() {
  try {
    const resumen = await apiFetch("/api/admin/resumen-ventas", { method: "GET" });
    const totalEl = document.getElementById("ventas-total");
    if (totalEl && resumen && typeof resumen.total_ventas !== "undefined") {
      totalEl.textContent = Number(resumen.total_ventas || 0).toFixed(2);
    }

    const canvas = document.getElementById("grafica-ventas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ventasCat = await apiFetch("/api/admin/ventas-por-categoria", { method: "GET" });
    if (!Array.isArray(ventasCat) || !ventasCat.length) {
      ctx.fillText("No hay datos de ventas", 10, 20);
      return;
    }

    const categorias = ventasCat.map(v => v.categoria);
    const valores = ventasCat.map(v => Number(v.total_ventas));
    const max = Math.max(...valores, 1);

    const barWidth = Math.max(20, (canvas.width - 60) / valores.length - 10);

    valores.forEach((valor, i) => {
      const barH = (valor / max) * (canvas.height - 40);
      const x = 40 + i * (barWidth + 10);
      const y = canvas.height - barH - 20;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(x, y, barWidth, barH);
      ctx.fillStyle = '#000';
      ctx.fillText(categorias[i], x, canvas.height - 5);
      ctx.fillText(`$${valor.toFixed(0)}`, x, y - 6);
    });
  } catch (err) {
    console.error("Error actualizando resumen de ventas:", err);
  }
}
