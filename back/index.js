
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

//Aqui conectaremos la BD
const db = mysql.createConnection(process.env.DATABASE_URL || '');

app.get('/api/test', (req, res) => {
    res.json({
        mensaje: "¡Backend conectado exitosamente!",
        fecha: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

app.get('/api/test-db', (req, res) => {
    // Intentamos hacer una consulta simple (1 + 1)
    db.query('SELECT 1 + 1 AS resultado', (err, results) => {
        if (err) {
            // Si hay error, le avisamos al front
            console.error("Error BD:", err);
            return res.status(500).json({ 
                status: 'error', 
                mensaje: 'No se pudo conectar a la BD',
                detalle: err.message 
            });
        }
        
        // Si sale bien, respondemos éxito
        res.json({
            status: 'success',
            mensaje: '¡Conexión a Base de Datos EXITOSA!',
            calculo_prueba: results[0].resultado // Debería ser 2
        });
    });
});