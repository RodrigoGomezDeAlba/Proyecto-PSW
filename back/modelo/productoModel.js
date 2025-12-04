const pool = require('../db/conexion');

// Obtener lista de categorías distintas
async function obtenerCategorias() {
  const [rows] = await pool.query(
    'SELECT DISTINCT categoria FROM productos ORDER BY categoria',
  );
  return rows.map((row) => row.categoria);
}

// Obtener lista de productos con filtros opcionales
async function obtenerProductos({ categoria, precioMin, precioMax }) {
  const condiciones = [];
  const params = [];

  // Solo productos con inventario > 0 por defecto (disponibles)
  condiciones.push('inventario > 0');

  if (categoria) {
    condiciones.push('categoria = ?');
    params.push(categoria);
  }

  if (precioMin != null) {
    condiciones.push('precio >= ?');
    params.push(precioMin);
  }

  if (precioMax != null) {
    condiciones.push('precio <= ?');
    params.push(precioMax);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion, categoria, precio, inventario, imagen_url
     FROM productos
     ${where}
     ORDER BY nombre`,
    params,
  );

  return rows;
}

// Obtener detalle de un producto por id
async function obtenerProductoPorId(id) {
  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion, categoria, precio, inventario, imagen_url
     FROM productos
     WHERE id = ?`,
    [id],
  );
  return rows[0];
}

// Crear nuevo producto (para admin)
async function crearProducto({ nombre, descripcion, categoria, precio, inventario, imagen_url }) {
  const [result] = await pool.query(
    `INSERT INTO productos (nombre, descripcion, categoria, precio, inventario, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion || null, categoria, precio, inventario, imagen_url || null],
  );

  return {
    id: result.insertId,
    nombre,
    descripcion,
    categoria,
    precio,
    inventario,
    imagen_url,
  };
}

// Actualizar producto existente (para admin)
async function actualizarProducto(id, campos) {
  const permitidos = ['nombre', 'descripcion', 'categoria', 'precio', 'inventario', 'imagen_url'];
  const sets = [];
  const params = [];

  for (const key of permitidos) {
    if (Object.prototype.hasOwnProperty.call(campos, key)) {
      sets.push(`${key} = ?`);
      params.push(campos[key]);
    }
  }

  if (!sets.length) {
    return false; // nada que actualizar
  }

  params.push(id);

  await pool.query(
    `UPDATE productos
     SET ${sets.join(', ')}
     WHERE id = ?`,
    params,
  );

  return true;
}

// Eliminar producto (para admin)
async function eliminarProducto(id) {
  await pool.query('DELETE FROM productos WHERE id = ?', [id]);
}

module.exports = {
  obtenerCategorias,
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
