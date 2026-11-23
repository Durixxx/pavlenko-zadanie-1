/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: kniznica_db
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `kniznica_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `kniznica_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_slovak_ci */;

USE `kniznica_db`;

--
-- Table structure for table `knihy`
--

DROP TABLE IF EXISTS `knihy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `knihy` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nazov` varchar(120) NOT NULL,
  `autor` varchar(150) NOT NULL,
  `rok` smallint(5) unsigned NOT NULL,
  `cena` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_slovak_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knihy`
--

LOCK TABLES `knihy` WRITE;
/*!40000 ALTER TABLE `knihy` DISABLE KEYS */;
INSERT INTO `knihy` VALUES
(4,'Malý princ','Antoine de Saint-Exupéry',1943,9.90),
(5,'1984','George Orwell',1949,12.50),
(6,'Krvavé sonety','Pavol Országh Hviezdoslav',1919,7.80),
(7,'Harry Potter a Kameň mudrcov','J. K. Rowlingová',1997,15.00);
/*!40000 ALTER TABLE `knihy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pouzivatelia`
--

DROP TABLE IF EXISTS `pouzivatelia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pouzivatelia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meno` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `heslo_hash` varchar(255) NOT NULL,
  `vytvoreny` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_slovak_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pouzivatelia`
--

LOCK TABLES `pouzivatelia` WRITE;
/*!40000 ALTER TABLE `pouzivatelia` DISABLE KEYS */;
INSERT INTO `pouzivatelia` VALUES
(2,'Ján Novák','jan.novak@example.com','$2b$10$yZxCVUkIMyFMWBaYPJ0QJOZyeXdKQgGkA0ayx1vPYFbn9p4NWubae','2026-11-23 09:22:39'),
(3,'Eva Kováčová','eva.kovacova@example.com','$2b$10$HAF7SlTU3c9gKzQOO5B4HuDExcuLQZFIg8w4TLm0yL7kZRElF2HoW','2026-11-23 09:22:39');
/*!40000 ALTER TABLE `pouzivatelia` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
