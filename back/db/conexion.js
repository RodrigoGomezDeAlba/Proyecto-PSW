// back/db/conexion.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'basedatosginapsw-luisangelbaltazarglz-2ff5.e.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_BmkOr0U3yoTFfmtWdUM',
  database: process.env.DB_NAME || 'defaultdb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 24000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
