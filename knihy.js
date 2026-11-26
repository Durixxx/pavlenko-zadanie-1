// Cez Live Server (iný port) posielame požiadavky na Node server na porte 3000.
const API = location.port === "3000" ? "" : "http://localhost:3000";

const formular = document.querySelector("#formular");
const zoznamKnih = document.querySelector("#zoznam-knih");
const sprava = document.querySelector("#sprava");
const chyba = document.querySelector("#chyba");

function pridajBunku(riadok, hodnota) {
    const bunka = document.createElement("td");
    bunka.textContent = hodnota ?? "";
    riadok.append(bunka);
}

async function textChyby(odpoved) {
    const text = await odpoved.text();
    return text || `Chyba servera (${odpoved.status})`;
}

// Pri rýchlom písaní do vyhľadávania beží naraz viac požiadaviek –
// vykreslíme iba odpoveď na tú poslednú.
let poslednaPoziadavka = 0;

async function nacitajKnihy() {
    const cisloPoziadavky = ++poslednaPoziadavka;
    chyba.textContent = "";

    // Cvičenie 10: hľadaný text a zoradenie posielame serveru v URL (?hladat=&zoradit=&smer=)
    const hladat = document.getElementById("hladatInput").value;
    const zoradit = document.getElementById("zoraditSelect").value;
    const smer = document.getElementById("smerSelect").value;
    const params = new URLSearchParams({ hladat, zoradit, smer });

    try {
        const odpoved = await fetch(`${API}/api/knihy?` + params.toString());
        if (!odpoved.ok) throw new Error(await textChyby(odpoved));

        const knihy = await odpoved.json();
        if (cisloPoziadavky !== poslednaPoziadavka) return;
        if (!Array.isArray(knihy)) {
            throw new Error("Server vrátil neočakávaný formát údajov.");
        }

        zoznamKnih.replaceChildren();

        if (knihy.length === 0) {
            const riadok = document.createElement("tr");
            const bunka = document.createElement("td");
            bunka.colSpan = 6;
            bunka.textContent = hladat.trim()
                ? "Hľadanému výrazu nezodpovedá žiadna kniha."
                : "V databáze zatiaľ nie sú žiadne knihy.";
            riadok.append(bunka);
            zoznamKnih.append(riadok);
            return;
        }

        for (const kniha of knihy) {
            const riadok = document.createElement("tr");
            pridajBunku(riadok, kniha.id);
            pridajBunku(riadok, kniha.nazov);
            pridajBunku(riadok, kniha.autor);
            pridajBunku(riadok, kniha.rok);
            pridajBunku(riadok, Number(kniha.cena).toFixed(2));

            const akcia = document.createElement("td");
            akcia.className = "book-actions";

            const tlacidloUpravit = document.createElement("button");
            tlacidloUpravit.type = "button";
            tlacidloUpravit.textContent = "Upraviť";
            tlacidloUpravit.addEventListener("click", () => upravitKnihu(kniha, riadok));

            const tlacidloZmenit = document.createElement("button");
            tlacidloZmenit.type = "button";
            tlacidloZmenit.textContent = "Zmeniť cenu";
            tlacidloZmenit.addEventListener("click", () => zmenitCenu(kniha));

            const tlacidloVymazat = document.createElement("button");
            tlacidloVymazat.type = "button";
            tlacidloVymazat.textContent = "Vymazať";
            tlacidloVymazat.addEventListener("click", () => vymazKnihu(kniha));

            akcia.append(tlacidloUpravit, tlacidloZmenit, tlacidloVymazat);
            riadok.append(akcia);
            zoznamKnih.append(riadok);
        }
    } catch (error) {
        if (cisloPoziadavky !== poslednaPoziadavka) return;
        chyba.textContent = `Knihy sa nepodarilo načítať: ${error.message}`;
        zoznamKnih.replaceChildren();
        const riadok = document.createElement("tr");
        const bunka = document.createElement("td");
        bunka.colSpan = 6;
        bunka.textContent = "Skontrolujte, či je spustený server a databáza.";
        riadok.append(bunka);
        zoznamKnih.append(riadok);
    }
}

function vytvorPole(typ, hodnota, popis, maxlength) {
    const pole = document.createElement("input");
    pole.type = typ;
    pole.value = hodnota;
    pole.setAttribute("aria-label", popis);
    if (maxlength) pole.maxLength = maxlength;
    if (typ === "number") {
        pole.step = "1";
        pole.min = "0";
        pole.max = "65535";
    }
    return pole;
}

// Prepne riadok do režimu úprav: názov, autor a rok sa zmenia na vstupné polia.
function upravitKnihu(kniha, riadok) {
    chyba.textContent = "";
    const bunky = riadok.children;
    const poleNazov = vytvorPole("text", kniha.nazov, "Názov knihy", 120);
    const poleAutor = vytvorPole("text", kniha.autor, "Autor", 150);
    const poleRok = vytvorPole("number", kniha.rok, "Rok vydania");

    bunky[1].replaceChildren(poleNazov);
    bunky[2].replaceChildren(poleAutor);
    bunky[3].replaceChildren(poleRok);

    const ulozit = document.createElement("button");
    ulozit.type = "button";
    ulozit.textContent = "Uložiť";

    const zrusit = document.createElement("button");
    zrusit.type = "button";
    zrusit.textContent = "Zrušiť";
    zrusit.addEventListener("click", nacitajKnihy);

    ulozit.addEventListener("click", async () => {
        const upravena = {
            nazov: poleNazov.value.trim(),
            autor: poleAutor.value.trim(),
            rok: Number(poleRok.value)
        };
        if (!upravena.nazov || !upravena.autor || !Number.isInteger(upravena.rok)
            || upravena.rok < 0 || upravena.rok > 65535) {
            chyba.textContent = "Vyplňte správne názov, autora a rok.";
            return;
        }

        chyba.textContent = "";
        ulozit.disabled = true;
        try {
            const odpoved = await fetch(`${API}/api/knihy/${encodeURIComponent(kniha.id)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(upravena)
            });
            if (!odpoved.ok) throw new Error(await textChyby(odpoved));
            sprava.textContent = "Kniha bola upravená.";
            await nacitajKnihy();
        } catch (error) {
            chyba.textContent = `Knihu sa nepodarilo upraviť: ${error.message}`;
            ulozit.disabled = false;
        }
    });

    for (const pole of [poleNazov, poleAutor, poleRok]) {
        pole.addEventListener("keydown", udalost => {
            if (udalost.key === "Enter") ulozit.click();
            if (udalost.key === "Escape") nacitajKnihy();
        });
    }

    bunky[5].replaceChildren(ulozit, zrusit);
    poleNazov.focus();
}

async function vymazKnihu(kniha) {
    if (!window.confirm(`Naozaj chcete vymazať knihu „${kniha.nazov}“?`)) return;

    chyba.textContent = "";
    try {
        const odpoved = await fetch(`${API}/api/knihy/${encodeURIComponent(kniha.id)}`, {
            method: "DELETE"
        });
        if (!odpoved.ok) throw new Error(await textChyby(odpoved));
        await nacitajKnihy();
    } catch (error) {
        chyba.textContent = `Knihu sa nepodarilo vymazať: ${error.message}`;
    }
}

// Zmena ceny: hodnota z inputu #cena sa pripočíta k aktuálnej cene knihy
// (na serveri: UPDATE knihy SET cena = cena + ? WHERE id = ?).
async function zmenitCenu(kniha) {
    const cena = document.getElementById("cena").value;
    if (cena.trim() === "" || !Number.isFinite(Number(cena))) {
        chyba.textContent = "Do poľa „Cena“ zadajte sumu, o ktorú sa má cena zmeniť (napr. 2 alebo -1.5).";
        document.getElementById("cena").focus();
        return;
    }

    chyba.textContent = "";
    sprava.textContent = "";
    try {
        const odpoved = await fetch(`${API}/api/knihy/${encodeURIComponent(kniha.id)}/cena`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cena: Number(cena) })
        });
        if (!odpoved.ok) throw new Error(await textChyby(odpoved));
        sprava.textContent = `Cena knihy „${kniha.nazov}“ bola zmenená o ${Number(cena).toFixed(2)} €.`;
        await nacitajKnihy();
    } catch (error) {
        chyba.textContent = `Cenu sa nepodarilo zmeniť: ${error.message}`;
    }
}

formular.addEventListener("submit", async udalost => {
    udalost.preventDefault();
    sprava.textContent = "";
    chyba.textContent = "";

    const data = new FormData(formular);
    const kniha = {
        nazov: String(data.get("nazov")).trim(),
        autor: String(data.get("autor")).trim(),
        rok: Number(data.get("rok")),
        cena: Number(data.get("cena"))
    };

    if (!kniha.nazov || !kniha.autor || !Number.isInteger(kniha.rok)
        || kniha.rok < 0 || !Number.isFinite(kniha.cena) || kniha.cena < 0) {
        chyba.textContent = "Vyplňte správne všetky polia.";
        return;
    }

    const odoslat = formular.querySelector('button[type="submit"]');
    odoslat.disabled = true;
    try {
        const odpoved = await fetch(`${API}/api/knihy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kniha)
        });
        if (!odpoved.ok) throw new Error(await textChyby(odpoved));

        formular.reset();
        sprava.textContent = "Kniha bola pridaná.";
        await nacitajKnihy();
    } catch (error) {
        chyba.textContent = `Knihu sa nepodarilo pridať: ${error.message}`;
    } finally {
        odoslat.disabled = false;
    }
});

// Cvičenie 10: reakcia na zmenu filtra alebo zoradenia
document.getElementById("hladatInput").addEventListener("input", nacitajKnihy);
document.getElementById("zoraditSelect").addEventListener("change", nacitajKnihy);
document.getElementById("smerSelect").addEventListener("change", nacitajKnihy);

document.getElementById("resetFilterBtn").addEventListener("click", () => {
    document.getElementById("hladatInput").value = "";
    document.getElementById("zoraditSelect").value = "id";
    document.getElementById("smerSelect").value = "ASC";
    nacitajKnihy();
});

// Bonusová úloha: meno prihláseného používateľa zo sessionStorage
function zobrazPrihlaseneho() {
    const info = document.getElementById("prihlasenyInfo");
    let pouzivatel = null;
    try {
        pouzivatel = JSON.parse(sessionStorage.getItem("prihlasenyPouzivatel"));
    } catch {
        pouzivatel = null;
    }

    if (pouzivatel && pouzivatel.meno) {
        info.textContent = `Prihlásený používateľ: ${pouzivatel.meno} (${pouzivatel.email})`;
    } else {
        info.textContent = "Nie ste prihlásený. ";
        const odkaz = document.createElement("a");
        odkaz.href = "prihlasenie.html";
        odkaz.textContent = "Prihlásiť sa";
        info.append(odkaz);
    }
}

zobrazPrihlaseneho();
nacitajKnihy();