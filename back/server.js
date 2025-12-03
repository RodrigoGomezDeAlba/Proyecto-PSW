require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Conexion a la base de datos
const db = mysql.createConnection(process.env.DATABASE_URL || '');

// Verificamos la conexion
db.connect((err) => {
    if (err) {
        console.error("Error conectando a la BD:", err.message);
    } else {
        console.log("Conexion exitosa a la Base de Datos MySQL");
    }
});

// Funciones temporales para ver si funciona la base
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS resultado', (err, results) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error', 
                mensaje: 'No se pudo consultar la BD', 
                detalle: err.message 
            });
        }
        res.json({ 
            status: 'success', 
            mensaje: 'Backend y Base de Datos conectados', 
            calculo: results[0].resultado 
        });
    });
});

// Prueba del backend tambien
app.get('/api/test', (req, res) => {
    res.json({
        mensaje: "Backend conectado exitosamente",
        fecha: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API ProyectoFinal funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});