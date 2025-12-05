// Helper global para consumir el backend desde cualquier página del frontend
// Se expone todo en window para evitar problemas con ES modules en los <script>

const API_URL = "https://proyectopswbotellonesmx.onrender.com";

function guardarToken(token) {
  localStorage.setItem("token", token);
}

function obtenerToken() {
  return localStorage.getItem("token");
}

function cerrarSesion() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

async function apiFetch(path, options = {}) {
  const token = obtenerToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  const resp = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    const msg = data.message || data.msg || data.error || `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return resp.json();
}

// --- Carrito API ---

async function apiGetCart() {
  return apiFetch("/api/cart", { method: "GET" });
}

async function apiAddCartItem(productoId, cantidad = 1) {
  return apiFetch("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ producto_id: productoId, cantidad })
  });
}

async function apiUpdateCartItem(itemId, cantidad) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ cantidad })
  });
}

async function apiDeleteCartItem(itemId) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: "DELETE"
  });
}

async function apiClearCart() {
  return apiFetch("/api/cart", {
    method: "DELETE"
  });
}

// Exponer helpers en window para que otros scripts los usen
window.API_URL = API_URL;
window.guardarToken = guardarToken;
window.obtenerToken = obtenerToken;
window.cerrarSesion = cerrarSesion;
window.apiFetch = apiFetch;
window.apiGetCart = apiGetCart;
window.apiAddCartItem = apiAddCartItem;
window.apiUpdateCartItem = apiUpdateCartItem;
window.apiDeleteCartItem = apiDeleteCartItem;
window.apiClearCart = apiClearCart;
