// Balík dotenv je voliteľný – ak nie je nainštalovaný, server sa spustí
// s predvolenými hodnotami (localhost, root, bez hesla, kniznica_db).
try {
    require("dotenv").config();
} catch {
    console.log("Balík dotenv nie je nainštalovaný – používam predvolené nastavenia.");
}

const express = require("express");
const mysql = require("mysql2/promise");

// Funguje s balíkom bcryptjs aj bcrypt (oba majú rovnaké funkcie hash a compare).
let bcrypt;
try {
    bcrypt = require("bcryptjs");
} catch {
    bcrypt = require("bcrypt");
}

const app = express();
const port = Number(process.env.PORT) || 3000;
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "kniznica_db",
    waitForConnections: true,
    connectionLimit: 10
});

// Povolí volania API aj zo stránok spustených cez Live Server (napr. port 5501).
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        res.set("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

app.use(express.json({ limit: "10kb" }));
app.use(express.static(__dirname));

// Cvičenie 10, úloha 1: vyhľadávanie (?hladat=) a zoraďovanie (?zoradit=&smer=)
app.get("/api/knihy", async (req, res) => {
    const hladat = String(req.query.hladat || "").trim();
    const zoradit = String(req.query.zoradit || "id");
    const smer = req.query.smer === "DESC" ? "DESC" : "ASC";

    // Whitelist povolených stĺpcov pre ORDER BY (ochrana pred SQL Injection) –
    // názov stĺpca nemožno nahradiť otáznikom, preto ho overujeme voči zoznamu.
    const povoleneStlpce = ["id", "nazov", "autor", "rok", "cena"];
    const stlpec = povoleneStlpce.includes(zoradit) ? zoradit : "id";

    let sql = "SELECT id, nazov, autor, rok, cena FROM knihy";
    const parametre = [];

    if (hladat !== "") {
        // Hľadaný text ide cez zástupný znak ?, nie priamo do SQL.
        sql += " WHERE nazov LIKE ? OR autor LIKE ?";
        parametre.push(`%${hladat}%`, `%${hladat}%`);
    }

    sql += ` ORDER BY ${stlpec} ${smer}`;

    try {
        const [knihy] = await db.execute(sql, parametre);
        res.json(knihy);
    } catch (error) {
        console.error("Chyba pri načítaní kníh:", error.message);
        res.status(500).send("Knihy sa nepodarilo načítať z databázy.");
    }
});

app.post("/api/knihy", async (req, res) => {
    const { nazov, autor, rok, cena } = req.body;
    if (typeof nazov !== "string" || !nazov.trim() || nazov.length > 120
        || typeof autor !== "string" || !autor.trim() || autor.length > 150
        || !Number.isInteger(rok) || rok < 0 || rok > 65535
        || !Number.isFinite(cena) || cena < 0 || cena > 99999999.99) {
        return res.status(400).send("Vyplňte správne všetky polia.");
    }

    try {
        await db.execute(
            "INSERT INTO knihy (nazov, autor, rok, cena) VALUES (?, ?, ?, ?)",
            [nazov.trim(), autor.trim(), rok, cena]
        );
        res.status(201).send("Kniha bola pridaná.");
    } catch (error) {
        console.error("Chyba pri pridávaní knihy:", error.message);
        res.status(500).send("Knihu sa nepodarilo uložiť do databázy.");
    }
});

app.delete("/api/knihy/:id", async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM knihy WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.sendStatus(404);
        res.send("Kniha bola vymazaná.");
    } catch (error) {
        console.error("Chyba pri mazaní knihy:", error.message);
        res.status(500).send("Knihu sa nepodarilo vymazať.");
    }
});

// Zmena ceny: k aktuálnej cene sa pripočíta suma z poľa #cena
// (záporná suma cenu zníži, ale cena nesmie klesnúť pod 0).
app.patch("/api/knihy/:id/cena", async (req, res) => {
    const cena = Number(req.body.cena);
    if (!Number.isFinite(cena) || Math.abs(cena) > 99999999.99) {
        return res.status(400).send("Zadajte platnú sumu.");
    }

    try {
        const [result] = await db.execute(
            "UPDATE knihy SET cena = cena + ? WHERE id = ? AND cena + ? >= 0",
            [cena, req.params.id, cena]
        );
        if (result.affectedRows === 0) {
            return res.status(400).send("Kniha neexistuje alebo by cena klesla pod 0.");
        }
        res.send("Cena bola zmenená.");
    } catch (error) {
        console.error("Chyba pri zmene ceny:", error.message);
        res.status(500).send("Cenu sa nepodarilo zmeniť.");
    }
});

app.put("/api/knihy/:id", async (req, res) => {
    const { nazov, autor, rok } = req.body;
    if (typeof nazov !== "string" || !nazov.trim() || nazov.length > 120
        || typeof autor !== "string" || !autor.trim() || autor.length > 150
        || !Number.isInteger(rok) || rok < 0 || rok > 65535) {
        return res.status(400).send("Neplatné údaje.");
    }

    try {
        const [vysledok] = await db.execute(
            "UPDATE knihy SET nazov = ?, autor = ?, rok = ? WHERE id = ?",
            [nazov.trim(), autor.trim(), rok, req.params.id]
        );
        if (!vysledok.affectedRows) return res.sendStatus(404);
        res.send("Kniha bola upravená.");
    } catch (error) {
        console.error("Chyba pri úprave knihy:", error.message);
        res.status(500).send("Chyba SQL.");
    }
});

/* ---------- Cvičenie 10: používatelia a prihlásenie ---------- */

// 2. Registrácia nového používateľa s hashovaním hesla
app.post("/api/pouzivatelia", async (req, res) => {
    const { meno, email, heslo } = req.body;

    if (typeof meno !== "string" || !meno.trim()
        || typeof email !== "string" || !email.trim()
        || typeof heslo !== "string" || !heslo) {
        return res.status(400).send("Vyplňte meno, e-mail aj heslo.");
    }
    if (meno.trim().length > 100 || email.trim().length > 150) {
        return res.status(400).send("Meno alebo e-mail je príliš dlhé.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).send("Zadajte platný e-mail.");
    }
    if (heslo.length < 6) {
        return res.status(400).send("Heslo musí mať aspoň 6 znakov.");
    }
    if (Buffer.byteLength(heslo) > 72) {
        return res.status(400).send("Heslo je príliš dlhé (bcrypt spracuje najviac 72 bajtov).");
    }

    try {
        // bcrypt sám pridá náhodnú soľ (salt); 10 = cost factor (počet kôl)
        const hesloHash = await bcrypt.hash(heslo, 10);
        await db.execute(
            "INSERT INTO pouzivatelia (meno, email, heslo_hash) VALUES (?, ?, ?)",
            [meno.trim(), email.trim(), hesloHash]
        );
        res.status(201).send("Používateľ bol úspešne zaregistrovaný.");
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).send("Používateľ s týmto e-mailom už existuje.");
        }
        console.error("Chyba pri registrácii:", error.message);
        res.status(500).send("Chyba SQL.");
    }
});

// 3. Vymazanie používateľa podľa ID
app.delete("/api/pouzivatelia/:id", async (req, res) => {
    try {
        const [vysledok] = await db.execute(
            "DELETE FROM pouzivatelia WHERE id = ?",
            [req.params.id]
        );
        if (!vysledok.affectedRows) return res.sendStatus(404);
        res.send("Používateľ bol vymazaný.");
    } catch (error) {
        console.error("Chyba pri mazaní používateľa:", error.message);
        res.status(500).send("Chyba SQL.");
    }
});

// 4. Overenie prihlasovacích údajov
app.post("/api/prihlasenie", async (req, res) => {
    const { email, heslo } = req.body;

    if (typeof email !== "string" || !email.trim()
        || typeof heslo !== "string" || !heslo) {
        return res.status(400).json({ sprava: "Zadajte e-mail aj heslo." });
    }

    try {
        const [vysledok] = await db.execute(
            "SELECT id, meno, email, heslo_hash FROM pouzivatelia WHERE email = ?",
            [email.trim()]
        );

        // Rovnaká správa pre neexistujúci e-mail aj zlé heslo –
        // útočník tak nezistí, ktoré e-maily sú v systéme zaregistrované.
        if (vysledok.length === 0) {
            return res.status(401).json({ sprava: "Nesprávny e-mail alebo heslo." });
        }

        const pouzivatel = vysledok[0];
        // Heslo nedešifrujeme – bcrypt.compare ho zahashuje s rovnakou soľou a porovná.
        const zhoda = await bcrypt.compare(heslo, pouzivatel.heslo_hash);
        if (!zhoda) {
            return res.status(401).json({ sprava: "Nesprávny e-mail alebo heslo." });
        }

        res.json({
            sprava: "Prihlásenie úspešné.",
            pouzivatel: {
                id: pouzivatel.id,
                meno: pouzivatel.meno,
                email: pouzivatel.email
            }
        });
    } catch (error) {
        console.error("Chyba pri prihlásení:", error.message);
        res.status(500).json({ sprava: "Chyba SQL." });
    }
});

// 1. Získanie zoznamu používateľov – vyberáme iba id, meno a email (hash hesla nikdy neposielame).
app.get("/api/pouzivatelia", async (req, res) => {
    try {
        const [pouzivatelia] = await db.execute(
            "SELECT id, meno, email FROM pouzivatelia ORDER BY id ASC"
        );
        res.json(pouzivatelia);
    } catch (error) {
        console.error("Chyba pri načítaní používateľov:", error.message);
        res.status(500).send("Chyba SQL.");
    }
});

// Vlastná stránka 404 – musí byť až za všetkými API endpointmi, ale pred app.listen.
app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/404.html");
});

app.listen(port, () => {
    console.log(`WebLab beží na http://localhost:${port}`);
    db.getConnection()
        .then(connection => {
            console.log("Databáza je pripojená.");
            connection.release();
        })
        .catch(error => console.error("Databáza zatiaľ nie je dostupná:", error.message));
});