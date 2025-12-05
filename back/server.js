require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');


const pool = require('./db/conexion');

const authRoutes = require('./routes/auth.routes'); 
const carritoRoutes = require('./routes/carrito.routes');
const productosRoutes = require('./routes/productos.routes'); 
const ordenesRoutes = require('./routes/ordenes.routes');
const suscripcionRoutes = require('./routes/suscripcion.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/img', express.static(path.join(__dirname, 'public/img')));

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', carritoRoutes);
app.use('/api', productosRoutes);
app.use('/api', ordenesRoutes);
app.use('/api', suscripcionRoutes); 
app.use('/api', adminRoutes);


app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    res.json({
      status: 'success',
      mensaje: '¡Conexión DB Exitosa!',
      calculo: rows[0].resultado,
    });
  } catch (err) {
    console.error('Error en /api/test-db:', err);
    res.status(500).json({
      status: 'error',
      mensaje: 'Error en BD',
      detalle: err.message,
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'API ProyectoFinal funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
