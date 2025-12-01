// front/js/api.js
const API_BASE = 'http://localhost:3000/api';

export async function postJSON(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
