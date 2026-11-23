// Cez Live Server (iný port) posielame požiadavky na Node server na porte 3000.
const API = location.port === "3000" ? "" : "http://localhost:3000";

const form = document.getElementById("registraciaForm");
const spravaEl = document.getElementById("sprava");
const zoznam = document.getElementById("zoznamPouzivatelov");

function zobrazSpravu(text, uspech) {
    spravaEl.textContent = text;
    spravaEl.className = uspech ? "msg-ok" : "msg-err";
}

function riadokSTextom(text) {
    const riadok = document.createElement("tr");
    const bunka = document.createElement("td");
    bunka.colSpan = 4;
    bunka.textContent = text;
    riadok.appendChild(bunka);
    return riadok;
}

async function nacitajPouzivatelov() {
    try {
        const odpoved = await fetch(`${API}/api/pouzivatelia`);
        if (!odpoved.ok) throw new Error(await odpoved.text());
        const pouzivatelia = await odpoved.json();

        zoznam.replaceChildren();
        if (pouzivatelia.length === 0) {
            zoznam.appendChild(riadokSTextom("Zatiaľ nie je zaregistrovaný žiadny používateľ."));
            return;
        }

        pouzivatelia.forEach(pouzivatel => {
            const riadok = document.createElement("tr");

            [pouzivatel.id, pouzivatel.meno, pouzivatel.email].forEach(hodnota => {
                const bunka = document.createElement("td");
                bunka.textContent = hodnota;
                riadok.appendChild(bunka);
            });

            const akciaBunka = document.createElement("td");
            const vymazBtn = document.createElement("button");
            vymazBtn.type = "button";
            vymazBtn.textContent = "Vymazať";
            vymazBtn.onclick = async () => {
                if (!window.confirm(`Naozaj chcete vymazať používateľa ${pouzivatel.meno}?`)) return;
                const odpoved = await fetch(`${API}/api/pouzivatelia/${encodeURIComponent(pouzivatel.id)}`, {
                    method: "DELETE"
                });
                zobrazSpravu(await odpoved.text() || `Chyba servera (${odpoved.status})`, odpoved.ok);
                nacitajPouzivatelov();
            };

            akciaBunka.appendChild(vymazBtn);
            riadok.appendChild(akciaBunka);
            zoznam.appendChild(riadok);
        });
    } catch (error) {
        zoznam.replaceChildren(riadokSTextom("Skontrolujte, či je spustený server a databáza."));
        zobrazSpravu(`Používateľov sa nepodarilo načítať: ${error.message}`, false);
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const novyPouzivatel = {
        meno: document.getElementById("meno").value,
        email: document.getElementById("email").value,
        heslo: document.getElementById("heslo").value
    };

    try {
        const odpoved = await fetch(`${API}/api/pouzivatelia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novyPouzivatel)
        });

        const text = await odpoved.text();
        zobrazSpravu(text || `Chyba servera (${odpoved.status})`, odpoved.ok);

        if (odpoved.ok) {
            form.reset();
            nacitajPouzivatelov();
        }
    } catch (error) {
        zobrazSpravu(`Registrácia zlyhala: ${error.message}`, false);
    }
});

nacitajPouzivatelov();
