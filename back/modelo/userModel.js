const pool = require('../db/conexion');

// Buscar usuario por email
async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, contrasena, rol FROM users WHERE email = ?',
    [email],
  );
  return rows[0]; // puede ser undefined si no existe
}

// Ver si ya existe un usuario con ese email (para registro)
async function existsByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email],
  );
  return rows.length > 0;
}

// Crear usuario nuevo
async function createUser(nombre, email, hashContrasena, rol = 'usuario') {
  const [result] = await pool.query(
    'INSERT INTO users (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hashContrasena, rol],
  );
  return {
    id: result.insertId,
    nombre,
    email,
    rol,
  };
}

// Buscar usuario por id (para /me y middleware)
async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol FROM users WHERE id = ?',
    [id],
  );
  return rows[0];
}

// Actualizar la contraseña de un usuario
async function updatePassword(id, hashContrasena) {
  await pool.query(
    'UPDATE users SET contrasena = ? WHERE id = ?',
    [hashContrasena, id],
  );
}

module.exports = {
  findByEmail,
  existsByEmail,
  createUser,
  findById,
  updatePassword,
};
