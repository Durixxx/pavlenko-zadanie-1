// Cez Live Server (iný port) posielame požiadavky na Node server na porte 3000.
const API = location.port === "3000" ? "" : "http://localhost:3000";

const prihlasenieForm = document.getElementById("prihlasenieForm");
const vysledokEl = document.getElementById("vysledok");

function zobrazText(text, trieda) {
    const p = document.createElement("p");
    p.className = trieda;
    p.textContent = text;
    vysledokEl.replaceChildren(p);
}

function zobrazStavPrihlasenia() {
    const ulozeny = sessionStorage.getItem("prihlasenyPouzivatel");
    if (!ulozeny) return;

    const pouzivatel = JSON.parse(ulozeny);
    vysledokEl.replaceChildren();

    const info = document.createElement("p");
    info.className = "msg-ok";
    info.textContent = `Prihlásený používateľ: ${pouzivatel.meno} (${pouzivatel.email})`;

    const odhlasitBtn = document.createElement("button");
    odhlasitBtn.type = "button";
    odhlasitBtn.textContent = "Odhlásiť sa";
    odhlasitBtn.onclick = () => {
        sessionStorage.removeItem("prihlasenyPouzivatel");
        zobrazText("Boli ste odhlásený.", "");
    };

    vysledokEl.appendChild(info);
    vysledokEl.appendChild(odhlasitBtn);
}

prihlasenieForm.addEventListener("submit", async event => {
    event.preventDefault();

    const udaje = {
        email: document.getElementById("email").value,
        heslo: document.getElementById("heslo").value
    };

    try {
        const odpoved = await fetch(`${API}/api/prihlasenie`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(udaje)
        });

        const data = await odpoved.json();

        if (!odpoved.ok) {
            // textContent namiesto innerHTML – text zo servera sa nevykoná ako HTML
            zobrazText(data.sprava, "msg-err");
            return;
        }

        sessionStorage.setItem("prihlasenyPouzivatel", JSON.stringify(data.pouzivatel));
        prihlasenieForm.reset();
        zobrazStavPrihlasenia();
    } catch (error) {
        zobrazText(`Prihlásenie zlyhalo: ${error.message}`, "msg-err");
    }
});

zobrazStavPrihlasenia();
