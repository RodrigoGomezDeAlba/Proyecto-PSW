export const API_URL = "https://proyectopswbotellonesmx.onrender.com";

export function guardarToken(token) {
    localStorage.setItem("token", token);
}

export function obtenerToken() {
    return localStorage.getItem("token");
}

export function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}


export async function apiFetch(path, options = {}) {
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

export async function apiGetCart() {
  return apiFetch("/api/cart", { method: "GET" });
}

export async function apiAddCartItem(productoId, cantidad = 1) {
  return apiFetch("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ producto_id: productoId, cantidad })
  });
}

export async function apiUpdateCartItem(itemId, cantidad) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ cantidad })
  });
}

export async function apiDeleteCartItem(itemId) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: "DELETE"
  });
}

export async function apiClearCart() {
  return apiFetch("/api/cart", {
    method: "DELETE"
  });
}