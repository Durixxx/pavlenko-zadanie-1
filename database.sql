CREATE DATABASE IF NOT EXISTS kniznica_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_slovak_ci;

USE kniznica_db;

CREATE TABLE IF NOT EXISTS knihy (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nazov VARCHAR(120) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    rok SMALLINT UNSIGNED NOT NULL,
    cena DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id)
);

-- Cvičenie 10: používatelia (heslá sa ukladajú iba ako bcrypt hash)
CREATE TABLE IF NOT EXISTS pouzivatelia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meno VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    heslo_hash VARCHAR(255) NOT NULL,
    vytvoreny TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);