require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2'); 

const authRoutes = require('./routes/auth.routes'); 
const carritoRoutes = require('./routes/carrito.routes');
const productosRoutes = require('./routes/productos.routes'); 
const ordenesRoutes = require('./routes/ordenes.routes');
const suscripcionRoutes = require('./routes/suscripcion.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', carritoRoutes);
app.use('/api', productosRoutes);
app.use('/api', ordenesRoutes);
app.use('/api', suscripcionRoutes); 
app.use('/api', adminRoutes);

// Conexion a la base
const db = mysql.createConnection(process.env.DATABASE_URL || '');

db.connect((err) => {
    if (err) {
        console.error("Error grave conectando a la BD:", err.message);
    } else {
        console.log("Conexion exitosa a la Base de Datos MySQL");
    }
});

// Prueba base
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS resultado', (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'error', mensaje: 'Error en BD', detalle: err.message });
        }
        res.json({ status: 'success', mensaje: '¡Conexión DB Exitosa!', calculo: results[0].resultado });
    });
});

app.get('/', (req, res) => {
  res.json({ message: 'API ProyectoFinal funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});