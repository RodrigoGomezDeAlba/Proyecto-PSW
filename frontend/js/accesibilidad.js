const ACCESS_KEY = "accesibilidad_v2";

const btn = document.getElementById("accesibilidad-btn");
const panel = document.getElementById("panel-accesibilidad");
const temaToggle = document.getElementById("tema-toggle");
const btnAumentar = document.getElementById("texto-aumentar");
const btnReducir = document.getElementById("texto-reducir");

btn.addEventListener("click", () => panel.classList.toggle("oculto"));

function aplicarPreferencias(prefs) {
  if (!prefs) return;
  if (prefs.tema === "oscuro") {
    document.body.classList.add("tema-oscuro");
  } else {
    document.body.classList.remove("tema-oscuro");
  }

  const escala = prefs.escala || 1;
  document.documentElement.style.setProperty('--font-scale', escala);
}

function leerPrefs() {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function guardarPrefs(prefs) {
  localStorage.setItem(ACCESS_KEY, JSON.stringify(prefs));
  aplicarPreferencias(prefs);
}

window.addEventListener("DOMContentLoaded", () => {
  const prefs = leerPrefs();
  if (prefs) aplicarPreferencias(prefs);
});

temaToggle.addEventListener("click", () => {
  const activo = document.body.classList.toggle("tema-oscuro");
  const prefs = leerPrefs() || { tema: "claro", escala: 1 };
  prefs.tema = activo ? "oscuro" : "claro";
  guardarPrefs(prefs);
});

const escalas = [0.9, 1, 1.1, 1.25, 1.4];
function escalaActual() {
  const prefs = leerPrefs();
  return (prefs && prefs.escala) ? prefs.escala : 1;
}

function aumentarEscala() {
  const actual = escalaActual();
  let idx = escalas.indexOf(actual);
  if (idx === -1) idx = 1;
  if (idx < escalas.length - 1) idx++;
  const nueva = escalas[idx];
  const prefs = leerPrefs() || { tema: (document.body.classList.contains("tema-oscuro") ? "oscuro" : "claro"), escala: 1 };
  prefs.escala = nueva;
  guardarPrefs(prefs);
}

function reducirEscala() {
  const actual = escalaActual();
  let idx = escalas.indexOf(actual);
  if (idx === -1) idx = 1;
  if (idx > 0) idx--;
  const nueva = escalas[idx];
  const prefs = leerPrefs() || { tema: (document.body.classList.contains("tema-oscuro") ? "oscuro" : "claro"), escala: 1 };
  prefs.escala = nueva;
  guardarPrefs(prefs);
}

btnAumentar.addEventListener("click", aumentarEscala);
btnReducir.addEventListener("click", reducirEscala);