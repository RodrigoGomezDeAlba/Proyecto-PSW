require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const carritoRoutes = require('./routes/carrito.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas del backend
app.use('/api/auth', authRoutes);
app.use('/api', productosRoutes);
app.use('/api', carritoRoutes);

// Endpoint sencillo para comprobar que el back está vivo
app.get('/', (req, res) => {
  res.json({ message: 'API ProyectoFinal funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});