# Proyecto Final – Botellones MX

Aplicación web para la venta de botellones de agua.  
Incluye:

- **Frontend** estático (HTML, CSS y JavaScript vanilla).
- **Backend** en Node.js + Express.
- **Base de datos** MySQL en **Aiven**.
- Autenticación con **JWT**, carrito de compras, órdenes, suscripción, contacto y panel de administrador.

---

## 1. Tecnologías principales

### Backend (`back/`)

- Node.js + Express
- MySQL (`mysql2/promise`) – servicio en Aiven
- JWT (`jsonwebtoken`)
- Bcrypt (`bcryptjs`) para contraseñas
- CORS
- PDFKit (generación de PDF de compra)
- SendGrid (envío de correos vía HTTP)

### Frontend (`frontend/`)

- HTML5 + CSS3
- JavaScript (DOM nativo, `fetch`, `async/await`)
- SweetAlert2 (alertas)

---

## 2. Estructura del proyecto

```text
ProyectoFinal/
  back/
    controllers/
    data/
    db/
    middleware/
    modelo/
    routes/
    utils/
    server.js
    package.json
  frontend/
    *.html
    css/
    js/
    img/
```

### Backend

- `back/server.js`  
  - Configura Express, CORS, JSON body parser y monta todas las rutas `/api/...`.
  - Endpoint `/api/test-db` para probar la conexión con MySQL.
- `back/db/conexion.js`  
  - Crea el pool de conexión MySQL usando variables de entorno (Aiven).
- `back/middleware/auth.middleware.js`  
  - Verifica JWT desde el header `Authorization: Bearer <token>`.
  - Carga el usuario en `req.user`.
  - `requireAdmin` protege rutas solo para administradores.
- `back/controllers/*.js`  
  - `auth.controller.js`: registro, login, captcha, logout, recuperación y restablecimiento de contraseña.
  - `productos.controller.js`: categorías, productos y CRUD de productos para admin.
  - `carrito.controller.js`: carrito de compras vinculado al usuario autenticado.
  - `ordenes.controller.js`: creación de órdenes desde el carrito, listados y detalle.
  - `suscripcion.controller.js`: suscripción al boletín y formulario de contacto.
  - `admin.controller.js`: resumen de ventas, ventas por categoría e inventario por categoría.
- `back/routes/*.routes.js`  
  - Definen endpoints como:
    - `/api/auth/*`
    - `/api/categories`, `/api/products`, `/api/products/:id`
    - `/api/cart`, `/api/cart/items`
    - `/api/orders`
    - `/api/suscribirse`, `/api/contacto`
    - `/api/admin/*`
- `back/modelo/*.js`  
  - Acceso a tablas de usuarios (`users`), productos, carrito, órdenes, suscripciones, contactos y datos para panel de admin.
- `back/utils/sendgrid.js` y `back/utils/pdf.js`  
  - Integración con SendGrid y generación de PDFs para facturas o comprobantes.

### Frontend

- HTML: `frontend/index.html`, `productos.html`, `carrito.html`, `checkout.html`, `login.html`, `registro.html`, `admin.html`, `admin-grafica.html`, `contacto.html`, etc.
- CSS: `frontend/css/*.css` (estilos generales, login, productos, admin, etc.).
- JS:
  - `frontend/js/api.js`  
    - Define `API_URL` (por defecto: `https://proyectopswbotellonesmx.onrender.com`).  
    - Helpers `apiFetch`, `guardarToken`, `obtenerToken`, `cerrarSesion`, funciones del carrito.
    - Maneja el token JWT en `localStorage` y agrega el header `Authorization`.
  - `frontend/js/autenticacion.js`  
    - Registro, login, recuperación y restablecimiento de contraseña usando `fetch` y `API_URL`.
  - `frontend/js/carrito.js`  
    - Carga y renderiza el carrito, actualiza cantidades y totales en el DOM.
  - `frontend/js/checkout.js`, `productos.js`, `suscripcion.js`, `contacto.js`, `admin.js`, `admin-grafica.js`, etc.  
    - Lógica de cada página (filtros, suscripción, contacto, gráficos de admin, etc.).

---

## 3. Requisitos previos

- Node.js 18 o superior
- NPM
- Cuenta en:
  - **Aiven** (servicio MySQL)
  - **Render** (backend)
  - **Vercel** (frontend)
- (Opcional pero recomendado) MySQL Workbench u otro cliente para administrar la BD.

---

## 4. Configuración de la base de datos en Aiven

1. Crear un servicio de **MySQL** en Aiven.
2. Crear la base de datos y las tablas necesarias (por ejemplo: `users`, `productos`, `carritos`, `carrito_items`, `ordenes`, `orden_detalles`, `suscripciones`, `contactos`, etc.) con el script SQL del proyecto.
3. Obtener los datos de conexión que Aiven proporciona:
   - Host
   - Puerto
   - Usuario
   - Contraseña
   - Nombre de la base de datos

El backend leerá estos datos desde variables de entorno.

---

## 5. Variables de entorno del backend

Crear un archivo `.env` dentro de la carpeta `back/` con contenido similar:

```env
# Puerto del servidor Express
PORT=3000

# Base de datos (Aiven)
DB_HOST=<host-de-aiven>
DB_PORT=<puerto-de-aiven>
DB_USER=<usuario>
DB_PASSWORD=<password>
DB_NAME=<nombre_bd>

# JWT
JWT_SECRET=<un-secreto-largo-y-seguro>

# Configuración de SendGrid
SENDGRID_API_KEY=<api-key-opcional>
SENDGRID_FROM_EMAIL=<correo-remitente>
FRONTEND_BASE_URL=<url-frontend-en-vercel>
```

> **Nota:** Este archivo **no** debe subirse al repositorio.

---

## 6. Instalación y ejecución del backend en local

```bash
cd back
npm install
npm run dev    # desarrollo con nodemon
# o
npm start      # modo producción
```

Por defecto el backend quedará en:  
`http://localhost:3000`

Rutas útiles para probar:

- `GET http://localhost:3000/api/test-db` → prueba de conexión a la BD.
- `GET http://localhost:3000/` → mensaje simple de salud de la API.

---

## 7. Ejecución del frontend en local

El frontend es completamente estático, se puede abrir con cualquier servidor estático.

### 7.1 Ajustar URL del backend

En `frontend/js/api.js` asegúrate de tener en desarrollo:

```js
const API_URL = "http://localhost:3000";
```

Para producción (deploy):

```js
const API_URL = "https://proyectopswbotellonesmx.onrender.com";
```

### 7.2 Opción 1: Live Server (VS Code)

1. Abrir la carpeta `frontend/` en VS Code.
2. Abrir `index.html`.
3. Ejecutar **Open with Live Server**.
4. Acceder a la URL que indique la extensión (por ejemplo `http://127.0.0.1:5500/frontend/index.html`).

### 7.3 Opción 2: Servidor estático con NPM

Desde la raíz del proyecto:

```bash
npx serve frontend
# o
npx http-server frontend
```

Luego abrir en el navegador:  
`http://localhost:<puerto>/index.html`

---

## 8. Deploy del backend en Render

1. Crear un **Web Service** en Render conectado al repositorio del proyecto.
2. Configurar:
   - **Root Directory**: `back`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Runtime: Node.js
3. En la sección **Environment** de Render, agregar las variables de entorno:
   - `PORT` (Render suele manejarla automáticamente).
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
   - `JWT_SECRET`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `FRONTEND_BASE_URL`.
4. Guardar y desplegar.
5. Render generará una URL como:

   ```text
   https://proyectopswbotellonesmx.onrender.com
   ```

6. Probar `GET https://proyectopswbotellonesmx.onrender.com/api/test-db` para confirmar que la API está levantada y conectada a Aiven.

---

## 9. Deploy del frontend en Vercel

1. Crear un nuevo proyecto en **Vercel** conectado al mismo repositorio.
2. Configurar:
   - **Root Directory / Output Directory**: `frontend`
   - No es necesario un comando de build (es sitio estático).
3. Antes de hacer deploy, en `frontend/js/api.js` configurar:

   ```js
   const API_URL = "https://proyectopswbotellonesmx.onrender.com";
   ```

4. Hacer deploy desde Vercel.
5. Vercel generará una URL del tipo:

   ```text
   https://<nombre-frontend>.vercel.app
   ```

6. Desde esa URL, todo el frontend consumirá las APIs del backend en Render.

---

## 10. Flujo principal de la aplicación

1. El usuario se **registra** y **inicia sesión** (`/api/auth/register`, `/api/auth/login`).
2. El backend genera un **JWT** y lo envía al frontend.
3. El frontend guarda el token en `localStorage` usando `guardarToken` (`frontend/js/api.js`).
4. Todas las peticiones protegidas (carrito, órdenes, admin) se realizan con `apiFetch`, que añade el header `Authorization: Bearer <token>`.
5. El middleware `authMiddleware` verifica el token y carga el usuario en `req.user`.
6. `requireAdmin` comprueba `req.user.rol === 'admin'` para los endpoints del panel administrador.
7. El carrito y las órdenes se guardan en la base de datos MySQL de Aiven.
8. En algunos flujos (compra, suscripción, contacto, recuperación de contraseña) se envían correos con SendGrid.

---

## 11. Scripts de NPM

En `back/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.15.3",
    "nodemon": "^3.1.10",
    "pdfkit": "^0.17.2"
  }
}
```

- `npm start` → servidor backend en producción.
- `npm run dev` → servidor backend en desarrollo (con recarga automática).
- `npm test` → placeholder (no hay pruebas automatizadas configuradas).

---

Para poder entrar como administrador a la pagina:

Correo:
-raspunsell0905@gmail.com
Contraseña:
rafa123

Datos del .env para poder ejecutar el proyecto localmente

DB_HOST=basedatosbotellonespsw-luisangelbaltazarglz-2ff5.g.aivencloud.com
DB_NAME=defaultdb
DB_PASSWORD=AVNS_VtCOPU-w5YBwdEJcf3x
DB_PORT=24000
DB_USER=avnadmin
SENDGRID_API_KEY=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
SENDGRID_FROM=sh240825@gmail.com
SENDGRID_FROM_NAME=Botellones

Agregar esto en un archivo .env en la carpeta back



