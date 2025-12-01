const pool = require('../db/conexion');

// Buscar usuario por email
async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password, role FROM users WHERE email = ?',
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
async function createUser(name, email, passwordHash, role = 'user') {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role],
  );
  return {
    id: result.insertId,
    name,
    email,
    role,
  };
}

// Buscar usuario por id (para /me y middleware)
async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [id],
  );
  return rows[0];
}

module.exports = {
  findByEmail,
  existsByEmail,
  createUser,
  findById,
};