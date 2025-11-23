const btn = document.getElementById("accesibilidad-btn");
const panel = document.getElementById("panel-accesibilidad");

btn.addEventListener("click", () => {
    panel.classList.toggle("oculto");
});

window.addEventListener("load", () => {
    const prefs = JSON.parse(localStorage.getItem("accesibilidad"));
    if (!prefs) return;

    if (prefs.tema === "oscuro")
        document.body.classList.add("tema-oscuro");

    if (prefs.texto === "grande")
        document.body.classList.add("texto-grande");

    if (prefs.texto === "xgrande")
        document.body.classList.add("texto-xgrande");
});

function guardarPreferencias() {
    const data = {
        tema: document.body.classList.contains("tema-oscuro") ? "oscuro" : "claro",
        texto: document.body.classList.contains("texto-xgrande")
            ? "xgrande"
            : document.body.classList.contains("texto-grande")
            ? "grande"
            : "normal"
    };
    localStorage.setItem("accesibilidad", JSON.stringify(data));
}

document.getElementById("tema-toggle").addEventListener("click", () => {
    document.body.classList.toggle("tema-oscuro");
    guardarPreferencias();
});

document.getElementById("texto-aumentar").addEventListener("click", () => {
    document.body.classList.remove("texto-grande", "texto-xgrande");
    document.body.classList.add("texto-grande");
    guardarPreferencias();
});

document.getElementById("texto-reducir").addEventListener("click", () => {
    document.body.classList.remove("texto-grande", "texto-xgrande");
    guardarPreferencias();
});