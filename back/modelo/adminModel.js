const pool = require("../db/conexion");

async function resumenVentas() {
  const [rows] = await pool.query(
    `SELECT
            COUNT(*)            AS numero_ordenes,
            IFNULL(SUM(total), 0) AS total_ventas,
            MIN(creada_en)      AS primera_venta,
            MAX(creada_en)      AS ultima_venta
            FROM ordenes
            WHERE estado = 'creada'`
  );
  return rows[0];
}

async function ventasPorCategoria() {
  const [rows] = await pool.query(
    `SELECT
            p.categoria,
            SUM(oi.subtotal) AS total_ventas,
            SUM(oi.cantidad) AS total_unidades
            FROM orden_items oi
            JOIN productos p ON p.id = oi.producto_id
            JOIN ordenes o ON o.id = oi.orden_id
            WHERE o.estado = 'creada'
            GROUP BY p.categoria
            ORDER BY total_ventas DESC;`
  );
  return rows;
}

async function inventarioPorCategoria() {
  const [rows] = await pool.query(
    `SELECT
        categoria,
        SUM(inventario) AS inventario_total,
        COUNT(*)        AS productos_activos
        FROM productos
        GROUP BY categoria
        ORDER BY categoria;`
  );
  return rows;
}

module.exports = {
  resumenVentas,
  ventasPorCategoria,
  inventarioPorCategoria,
};
