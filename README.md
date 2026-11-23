# WebLab: databáza kníh

## Požiadavky

- Node.js a npm
- MySQL Server

## Spustenie

1. V MySQL spustite `database.sql`, napríklad príkazom `mysql -u root -p < database.sql`.
   Databázu aj s ukážkovými knihami obnovíte z exportu: `mysql -u root -p < export-db/kniznica_db.sql`.
2. Skopírujte `.env.example` do `.env` a nastavte v ňom prihlasovacie údaje k MySQL.
3. V priečinku projektu spustite `npm install` a potom `npm start` (alebo `npm run dev` s automatickým reštartom).
4. Otvorte `http://localhost:3000/Index.html` alebo priamo `http://localhost:3000/katalog.html`.

Katalóg číta knihy z databázy. Na stránke „Správa kníh“ ich možno pridávať, upravovať, meniť cenu a mazať,
vyhľadávať podľa názvu alebo autora a zoraďovať podľa ľubovoľného stĺpca.

## Cvičenie 10: používatelia a prihlásenie

- `pouzivatelia.html` – registrácia používateľov a ich zoznam (s možnosťou vymazania).
- `prihlasenie.html` – prihlásenie e-mailom a heslom; prihlásený používateľ sa uloží do `sessionStorage`
  a jeho meno sa zobrazí aj na stránke „Správa kníh“.
- Heslá sa ukladajú do tabuľky `pouzivatelia` iba ako bcrypt hash (knižnica `bcryptjs`, cost factor 10).

Ukážkoví používatelia v exporte databázy (heslo `tajne123`): `jan.novak@example.com`, `eva.kovacova@example.com`.