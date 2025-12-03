
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
        mensaje: "Backend conectado exitosamente",
        fecha: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});