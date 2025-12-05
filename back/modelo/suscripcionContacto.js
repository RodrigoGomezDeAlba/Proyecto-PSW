const pool = require('../db/conexion');

async function crearSuscripcion(email) {
    
    const [result] = await pool.query(
        'INSERT INTO suscripciones (email) VALUES (?)',
        [email],
    );
    return result.insertId;
    
    
}

async function  crearContacto(nombre,email,mensaje) {

    const [result] = await pool.query(
        'INSERT INTO contactos (nombre,email,mensaje) VALUES (?,?,?)',
        [nombre,email,mensaje],
    );
    return result.insertId;
    
}

async function emailExistente(email) {
  const [rows] = await pool.query(
    'SELECT id FROM suscripciones WHERE email = ?',
    [email],
  );
  return rows.length > 0;
}

module.exports = {
    crearSuscripcion,
    crearContacto,
    emailExistente
};