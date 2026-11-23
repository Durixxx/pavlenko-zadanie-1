// Bonus: samostatný registračný formulár pre nových používateľov.
// Cez Live Server (iný port) posielame požiadavky na Node server na porte 3000.
const API = location.port === "3000" ? "" : "http://localhost:3000";

const registracnyFormular = document.getElementById("registracnyFormular");
const vysledokEl = document.getElementById("vysledok");

function zobrazChyby(chyby) {
    const zoznam = document.createElement("ul");
    zoznam.className = "msg-err";
    chyby.forEach(chyba => {
        const polozka = document.createElement("li");
        polozka.textContent = chyba;
        zoznam.appendChild(polozka);
    });
    vysledokEl.replaceChildren(zoznam);
}

function zobrazText(text, trieda) {
    const p = document.createElement("p");
    p.className = trieda;
    p.textContent = text;
    vysledokEl.replaceChildren(p);
}

// Kontrola na strane klienta – server údaje aj tak overí znova,
// lebo požiadavku sa dá poslať aj mimo formulára.
function overUdaje(udaje, hesloZnova, suhlas) {
    const chyby = [];
    if (!udaje.meno) chyby.push("Zadajte meno a priezvisko.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(udaje.email)) chyby.push("Zadajte platný e-mail.");
    if (udaje.heslo.length < 6) chyby.push("Heslo musí mať aspoň 6 znakov.");
    if (udaje.heslo !== hesloZnova) chyby.push("Heslá sa nezhodujú.");
    if (!suhlas) chyby.push("Musíte súhlasiť so spracovaním osobných údajov.");
    return chyby;
}

registracnyFormular.addEventListener("submit", async event => {
    event.preventDefault();

    const udaje = {
        meno: document.getElementById("meno").value.trim(),
        email: document.getElementById("email").value.trim(),
        heslo: document.getElementById("heslo").value
    };
    const hesloZnova = document.getElementById("hesloZnova").value;
    const suhlas = document.getElementById("suhlas").checked;

    const chyby = overUdaje(udaje, hesloZnova, suhlas);
    if (chyby.length > 0) {
        zobrazChyby(chyby);
        return;
    }

    try {
        // Rovnaký endpoint ako na stránke Používatelia – heslo sa zahashuje na serveri.
        const odpoved = await fetch(`${API}/api/pouzivatelia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(udaje)
        });
        const text = await odpoved.text();

        if (!odpoved.ok) {
            zobrazText(text || `Chyba servera (${odpoved.status})`, "msg-err");
            return;
        }

        registracnyFormular.reset();
        zobrazText(`${text} Teraz sa môžete prihlásiť – presmerovanie o 3 sekundy…`, "msg-ok");
        setTimeout(() => { location.href = "prihlasenie.html"; }, 3000);
    } catch (error) {
        zobrazText(`Registrácia zlyhala: ${error.message}`, "msg-err");
    }
});
