/* ============================================================
   app.js – globálny JavaScript
   1) vloženie topbar.html na každú podstránku
    2) scripty z podstránky javasript.html
   ============================================================ */

/* ---------- 1) Topbar ---------- */

// Záložný topbar – použije sa, keď je stránka otvorená priamo zo súboru (file://),
// kde prehliadač zablokuje fetch(). Cez Live Server sa načíta skutočný topbar.html.
const FALLBACK_TOPBAR = `
<nav class="topbar">
    <a class="topbar-brand" href="index.html"><img src="IMG/logo.jpg" alt="Logo" width="32" height="32"><span>WebLab</span></a>
    <ul class="topbar-links">
        <li><a href="index.html">Domov</a></li>
        <li><a href="form.html">Formulár</a></li>
        <li><a href="table.html">Tabuľka</a></li>
        <li><a href="list.html">Zoznamy</a></li>
        <li><a href="javasript.html">JavaScript</a></li>
        <li><a href="katalog.html">Knihy</a></li>
    </ul>
</nav>`;

function insertTopbar(html) {
    const holder = document.getElementById("topbar");
    if (!holder) return;
    holder.innerHTML = html;

    // zvýrazni odkaz aktuálnej stránky
    const current = location.pathname.split("/").pop() || "index.html";
    holder.querySelectorAll(".topbar-links a").forEach(function (a) {
        if (a.getAttribute("href") === current) a.classList.add("active");
    });
}

fetch("topbar.html")
    .then(function (response) {
        if (!response.ok) throw new Error("topbar.html sa nepodarilo načítať");
        return response.text();
    })
    .then(insertTopbar)
    .catch(function () {
        insertTopbar(FALLBACK_TOPBAR);
    });

/* ---------- 2) Scripty z javasript.html ---------- */

document.addEventListener("DOMContentLoaded", function () {

    // a) Pozdrav podľa mena
    const btnGreet = document.getElementById("btnGreet");
    if (btnGreet) {
        btnGreet.addEventListener("click", function () {
            const name = document.getElementById("nameInput").value.trim();
            document.getElementById("greetOutput").textContent =
                name ? "Ahoj, " + name + "! 👋" : "Zadaj najprv svoje meno.";
        });
    }

    // b) Počítadlo
    const counterValue = document.getElementById("counterValue");
    if (counterValue) {
        let count = 0;
        const render = function () { counterValue.textContent = count; };
        document.getElementById("btnPlus").addEventListener("click", function () { count++; render(); });
        document.getElementById("btnMinus").addEventListener("click", function () { count--; render(); });
        document.getElementById("btnReset").addEventListener("click", function () { count = 0; render(); });
    }

    // c) Prepínanie tmavého režimu karty
    const btnTheme = document.getElementById("btnTheme");
    if (btnTheme) {
        btnTheme.addEventListener("click", function () {
            document.getElementById("themeCard").classList.toggle("is-dark");
        });
    }

    // d) Živé hodiny
    const clock = document.getElementById("clock");
    if (clock) {
        const tick = function () { clock.textContent = new Date().toLocaleTimeString("sk-SK"); };
        tick();
        setInterval(tick, 1000);
    }

    // e) Jednoduchá kalkulačka
    const btnCalc = document.getElementById("btnCalc");
    if (btnCalc) {
        btnCalc.addEventListener("click", function () {
            const a = parseFloat(document.getElementById("numA").value);
            const b = parseFloat(document.getElementById("numB").value);
            const op = document.getElementById("operation").value;
            const out = document.getElementById("calcOutput");
            if (isNaN(a) || isNaN(b)) { out.textContent = "Zadaj obe čísla."; return; }
            let result;
            if (op === "+") result = a + b;
            if (op === "-") result = a - b;
            if (op === "*") result = a * b;
            if (op === "/") result = b === 0 ? "delenie nulou nie je možné" : a / b;
            out.textContent = "Výsledok: " + result;
        });
    }

    // f) Ukážková chyba
    const btnError = document.getElementById("btnError");
    if (btnError) {
        btnError.addEventListener("click", function () {
            const output = document.getElementById("errorOutput");
            try {
                throw new Error("Toto je ukážková chyba JavaScriptu.");
            } catch (error) {
                output.textContent = "Chyba: " + error.message;
            }
        });
    }
});