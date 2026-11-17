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

Katalóg číta knihy z databázy. Na stránke „Správa kníh“ ich možno pridávať, meniť cenu a mazať.