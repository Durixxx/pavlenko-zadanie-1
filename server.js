require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");

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

app.get("/api/knihy", async (req, res) => {
    try {
        const [knihy] = await db.execute(
            "SELECT id, nazov, autor, rok, cena FROM knihy ORDER BY id DESC"
        );
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

app.patch("/api/knihy/:id/cena", async (req, res) => {
    const cena = Number(req.body.cena);
    if (!Number.isFinite(cena) || cena < 0 || cena > 99999999.99) {
        return res.status(400).send("Cena musí byť nezáporné číslo.");
    }

    try {
        const [result] = await db.execute(
            "UPDATE knihy SET cena = ? WHERE id = ?",
            [cena, req.params.id]
        );
        if (result.affectedRows === 0) return res.sendStatus(404);
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