// Cez Live Server (iný port) posielame požiadavky na Node server na porte 3000.
const API = location.port === "3000" ? "" : "http://localhost:3000";

const listMessage = document.querySelector("#list-message");
const booksList = document.querySelector("#books-list");

async function loadBooks() {
    listMessage.textContent = "";
    booksList.replaceChildren();

    try {
        const response = await fetch(`${API}/api/knihy`);
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Chyba servera (${response.status})`);
        }

        const books = await response.json();
        if (!Array.isArray(books)) {
            throw new Error("Server vrátil údaje v neočakávanom formáte.");
        }

        if (books.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.textContent = "V katalógu zatiaľ nie sú žiadne knihy.";
            row.append(cell);
            booksList.append(row);
            return;
        }

        for (const book of books) {
            const row = document.createElement("tr");
            const price = Number(book.cena ?? 0);
            const values = [book.nazov, book.autor, book.rok,
                Number.isFinite(price) ? price.toFixed(2) : book.cena ?? ""];

            for (const value of values) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.append(cell);
            }
            booksList.append(row);
        }
    } catch (error) {
        listMessage.textContent = `Knihy sa nepodarilo načítať: ${error.message}`;
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.textContent = "Skontrolujte, či sú server a databáza spustené.";
        row.append(cell);
        booksList.append(row);
    }
}

loadBooks();