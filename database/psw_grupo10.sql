CREATE DATABASE  IF NOT EXISTS `psw_projeto` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `psw_projeto`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: psw_projeto
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `desporto`
--

DROP TABLE IF EXISTS `desporto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desporto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `createdOn` date NOT NULL,
  `createdBy` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `desporto_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `desporto`
--

LOCK TABLES `desporto` WRITE;
/*!40000 ALTER TABLE `desporto` DISABLE KEYS */;
INSERT INTO `desporto` VALUES (1,'Ciclismo','2025-11-03',1),(2,'Padel','2025-11-05',1),(4,'Futsal','2025-11-10',2),(5,'Natação','2025-11-10',1),(6,'Corrida','2025-11-10',3),(7,'Futebol','2025-11-10',3),(8,'Pesca','2025-11-10',4),(9,'Caça','2025-11-10',4),(10,'Vela','2025-11-10',5),(11,'Surf','2025-11-10',5),(12,'Mergulho','2025-11-10',5);
/*!40000 ALTER TABLE `desporto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessao`
--

DROP TABLE IF EXISTS `sessao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `desportoId` int NOT NULL,
  `duracao` int NOT NULL,
  `localizacao` varchar(255) NOT NULL,
  `data` date NOT NULL,
  `hora` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `desportoId` (`desportoId`),
  CONSTRAINT `sessao_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `sessao_ibfk_2` FOREIGN KEY (`desportoId`) REFERENCES `desporto` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessao`
--

LOCK TABLES `sessao` WRITE;
/*!40000 ALTER TABLE `sessao` DISABLE KEYS */;
INSERT INTO `sessao` VALUES (2,1,2,60,'Pista da Sobreda','2025-11-04','12:30:00'),(3,1,1,80,'Almada','2025-11-05','12:12:00'),(5,1,2,56,'Feijo','2025-11-03','12:34:00'),(7,2,4,54,'Almada','2025-11-03','09:00:00'),(8,1,5,120,'Palmela','2025-11-10','11:30:00'),(9,1,4,45,'Alvalade','2025-11-06','12:30:00'),(10,1,1,79,'Vendas Novas','2025-11-07','07:00:00'),(11,3,6,67,'Ginasio','2025-11-03','12:09:00'),(12,3,6,20,'almada','2025-11-05','12:30:00'),(13,3,1,45,'Corroios','2025-10-27','12:45:00'),(14,3,2,15,'Lisboa','2025-11-08','10:00:00'),(15,3,7,60,'Alvalade','2025-11-09','11:00:00'),(16,3,6,120,'Almada','2025-11-04','12:45:00'),(17,4,8,300,'Rio Tejo','2025-11-08','06:00:00'),(18,4,1,60,'Almada','2025-11-04','12:00:00'),(19,4,5,30,'Corroios','2025-11-05','13:00:00'),(20,4,8,700,'Sado','2025-11-06','14:00:00'),(21,4,7,50,'Lisboa','2025-10-27','17:00:00'),(22,4,8,250,'Sado','2025-11-07','22:00:00'),(23,5,12,140,'Tejo','2025-11-04','16:00:00'),(24,5,1,60,'Azeitão','2025-11-05','08:55:00'),(25,5,11,70,'Costa da caparica','2025-10-28','12:00:00'),(26,5,10,300,'Barreiro','2025-10-16','11:00:00'),(27,5,10,500,'Sines','2025-10-29','13:40:00'),(28,5,10,600,'Barreiro','2025-11-05','17:30:00'),(29,2,9,600,'Alentejo','2025-11-04','13:40:00'),(30,2,9,350,'Reserva de caça do Minho','2025-10-31','10:00:00'),(31,2,1,45,'Almada','2025-11-04','11:00:00'),(32,2,5,20,'Corroios','2025-11-02','06:30:00'),(33,2,9,340,'Alentejo','2025-11-08','06:00:00'),(34,2,9,470,'Norte','2025-11-01','05:45:00');
/*!40000 ALTER TABLE `sessao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdOn` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Ruben Garrido','ruben@gmail.com','$2b$10$Irp6iXLguqZiyeRZFlrgjumKhiKN2H2ZQkpYq3p1bcdhj68nm99M6','2025-11-03'),(2,'Tiago Marques','tiago@gmail.com','$2b$10$IO.giEvtLxqZy3S/9OlEieQXh/hdMCzjKZaUg460P5ur/pAdxw4Yq','2025-11-10'),(3,'Alexandre Santos','alex@gmail.com','$2b$10$8h/tXCpOegurQyScCsTnm.7vxj/c.oaRRKtv4ak2g2vkSbVv5gko6','2025-11-10'),(4,'Miguel Possante','miguel@gmail.com','$2b$10$Uf9mYltJyYt0MatyZhWSpeC1CfR/sCGWpZGL25xTvLs2fTeqK5MEq','2025-11-10'),(5,'Afonso Freitas','afonso@gmail.com','$2b$10$iepi3ciHLJP/RdrZ.I.2gOBTvMjYNiMnBlCchZokDbLZ/4RtXMyja','2025-11-10');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userlog`
--

DROP TABLE IF EXISTS `userlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userlog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `acessoDateTime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `userlog_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userlog`
--

LOCK TABLES `userlog` WRITE;
/*!40000 ALTER TABLE `userlog` DISABLE KEYS */;
INSERT INTO `userlog` VALUES (1,1,'2025-11-03 14:31:28'),(2,1,'2025-11-03 15:03:03'),(3,1,'2025-11-03 15:30:59'),(4,1,'2025-11-03 15:34:01'),(5,1,'2025-11-03 15:37:05'),(6,1,'2025-11-03 15:39:22'),(7,1,'2025-11-05 15:33:00'),(8,1,'2025-11-05 15:53:24'),(9,1,'2025-11-05 16:27:18'),(10,1,'2025-11-05 16:32:45'),(11,1,'2025-11-05 16:40:49'),(12,1,'2025-11-05 18:19:58'),(13,1,'2025-11-10 16:43:13'),(14,1,'2025-11-10 17:00:20'),(15,1,'2025-11-10 19:33:54'),(16,1,'2025-11-10 19:34:07'),(17,1,'2025-11-10 19:36:24'),(18,2,'2025-11-10 19:40:00'),(19,1,'2025-11-10 20:28:49'),(20,2,'2025-11-10 20:29:09'),(21,1,'2025-11-10 20:48:49'),(22,1,'2025-11-10 20:53:42'),(23,1,'2025-11-10 21:02:01'),(24,2,'2025-11-10 21:02:56'),(25,1,'2025-11-10 22:42:50'),(26,1,'2025-11-10 22:57:14'),(27,1,'2025-11-10 23:05:25'),(28,3,'2025-11-10 23:08:25'),(29,4,'2025-11-10 23:11:56'),(30,5,'2025-11-10 23:16:30'),(31,2,'2025-11-10 23:22:49'),(32,1,'2025-11-10 23:26:07'),(33,2,'2025-11-10 23:26:31'),(34,2,'2025-11-10 23:26:38'),(35,2,'2025-11-10 23:26:44'),(36,2,'2025-11-10 23:26:50'),(37,2,'2025-11-10 23:26:56'),(38,2,'2025-11-10 23:27:03'),(39,2,'2025-11-10 23:27:08'),(40,2,'2025-11-10 23:27:14'),(41,2,'2025-11-10 23:27:19'),(42,2,'2025-11-10 23:27:24'),(43,5,'2025-11-10 23:27:46'),(44,5,'2025-11-10 23:27:52'),(45,5,'2025-11-10 23:27:57'),(46,5,'2025-11-10 23:28:02'),(47,5,'2025-11-10 23:28:08'),(48,5,'2025-11-10 23:28:13'),(49,5,'2025-11-10 23:28:18'),(50,5,'2025-11-10 23:28:23'),(51,5,'2025-11-10 23:28:28'),(52,5,'2025-11-10 23:28:33'),(53,5,'2025-11-10 23:28:38'),(54,5,'2025-11-10 23:28:45'),(55,5,'2025-11-10 23:28:55'),(56,5,'2025-11-10 23:29:00'),(57,5,'2025-11-10 23:29:06'),(58,5,'2025-11-10 23:29:13'),(59,5,'2025-11-10 23:29:19'),(60,5,'2025-11-10 23:29:25'),(61,5,'2025-11-10 23:29:30'),(62,3,'2025-11-10 23:29:52'),(63,3,'2025-11-10 23:30:15'),(64,3,'2025-11-10 23:30:21'),(65,3,'2025-11-10 23:30:26'),(66,3,'2025-11-10 23:30:31'),(67,3,'2025-11-10 23:30:38'),(68,3,'2025-11-10 23:30:43'),(69,3,'2025-11-10 23:30:49'),(70,3,'2025-11-10 23:30:55'),(71,3,'2025-11-10 23:31:00'),(72,3,'2025-11-10 23:31:05'),(73,3,'2025-11-10 23:31:10'),(74,3,'2025-11-10 23:31:15'),(75,3,'2025-11-10 23:31:20'),(76,3,'2025-11-10 23:31:25'),(77,3,'2025-11-10 23:31:30'),(78,3,'2025-11-10 23:31:34'),(79,3,'2025-11-10 23:31:39'),(80,3,'2025-11-10 23:31:44'),(81,3,'2025-11-10 23:31:52'),(82,3,'2025-11-10 23:31:58'),(83,3,'2025-11-10 23:32:11'),(84,3,'2025-11-10 23:32:21'),(85,3,'2025-11-10 23:32:26'),(86,3,'2025-11-10 23:32:31'),(87,3,'2025-11-10 23:32:36'),(88,4,'2025-11-10 23:32:48'),(89,4,'2025-11-10 23:32:54'),(90,4,'2025-11-10 23:33:00'),(91,4,'2025-11-10 23:33:05'),(92,4,'2025-11-10 23:33:11'),(93,4,'2025-11-10 23:33:16'),(94,4,'2025-11-10 23:33:21'),(95,4,'2025-11-10 23:33:26'),(96,4,'2025-11-10 23:33:27');
/*!40000 ALTER TABLE `userlog` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-10 23:38:53
