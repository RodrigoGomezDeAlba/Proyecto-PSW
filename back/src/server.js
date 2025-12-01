// back/src/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import contactRoutes from './routes/contact.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // si sirves el front desde aquí puedes quitarlo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir front estático
const frontPath = path.join(__dirname, '..', '..', 'front');
app.use(express.static(frontPath));

// Rutas API
app.use('/api', contactRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
