CREATE DATABASE  IF NOT EXISTS `quiz_master` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `quiz_master`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: quiz_master
-- ------------------------------------------------------
-- Server version	8.0.18

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
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `course_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) NOT NULL,
  `course_quiz_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'python',NULL),(4,'c+',NULL),(5,'java',NULL),(6,'c',NULL),(7,'vscode ',NULL),(8,'new',NULL);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_category`
--

DROP TABLE IF EXISTS `course_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_category` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `course_category_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_category`
--

LOCK TABLES `course_category` WRITE;
/*!40000 ALTER TABLE `course_category` DISABLE KEYS */;
INSERT INTO `course_category` VALUES (1,1,'core python with dijangoss',NULL),(6,5,'core java',NULL),(7,6,'C++',NULL),(8,7,'dp',NULL),(9,5,'inter',NULL),(10,8,'addnew',NULL);
/*!40000 ALTER TABLE `course_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursewithquiz`
--

DROP TABLE IF EXISTS `coursewithquiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursewithquiz` (
  `cwq_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `course_college_name` varchar(255) DEFAULT NULL,
  `no_of_questions` int(11) DEFAULT NULL,
  `questions_type` enum('easy','medium','hard','random') NOT NULL DEFAULT 'easy',
  `category_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cwq_id`),
  KEY `course_id` (`course_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `coursewithquiz_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `coursewithquiz_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `course_category` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursewithquiz`
--

LOCK TABLES `coursewithquiz` WRITE;
/*!40000 ALTER TABLE `coursewithquiz` DISABLE KEYS */;
INSERT INTO `coursewithquiz` VALUES (12,1,1,'ssec',5,'hard','IZN-328'),(13,5,9,'dd',1,'random','PGM-636');
/*!40000 ALTER TABLE `coursewithquiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz` (
  `quiz_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `quiz_name` varchar(255) NOT NULL,
  `quiz_question` text NOT NULL,
  `quiz_correct_answer` text NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `quiz_description` text,
  `quiz_options` json DEFAULT NULL,
  `quiz_type` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
  PRIMARY KEY (`quiz_id`),
  KEY `fk_quiz_course` (`course_id`),
  KEY `fk_quiz_topic` (`category_id`),
  CONSTRAINT `fk_quiz_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_quiz_topic` FOREIGN KEY (`category_id`) REFERENCES `course_category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz`
--

LOCK TABLES `quiz` WRITE;
/*!40000 ALTER TABLE `quiz` DISABLE KEYS */;
INSERT INTO `quiz` VALUES (1,1,1,'variables','add the two variables 10 + 10 = ?','[{\"id\":1,\"text\":\"20\",\"isCorrect\":true}]',0,'the ans must be correct','\"[{\\\"id\\\":0,\\\"text\\\":\\\"10\\\",\\\"isCorrect\\\":false},{\\\"id\\\":1,\\\"text\\\":\\\"20\\\",\\\"isCorrect\\\":true}]\"','medium'),(2,1,1,'sssssssssss','ssssss','[{\"id\":0,\"text\":\"s\",\"isCorrect\":true}]',0,'sssss','[{\"id\": 0, \"text\": \"s\"}, {\"id\": 1, \"text\": \"ss\"}]','medium'),(4,1,1,'objects','what is on','[{\"id\":0,\"text\":\"10\",\"isCorrect\":true}]',0,'to be eloborate','\"[{\\\"id\\\":0,\\\"text\\\":\\\"10\\\",\\\"isCorrect\\\":true},{\\\"id\\\":1,\\\"text\\\":\\\"20\\\",\\\"isCorrect\\\":false},{\\\"id\\\":2,\\\"text\\\":\\\"30\\\",\\\"isCorrect\\\":false},{\\\"id\\\":3,\\\"text\\\":\\\"40\\\",\\\"isCorrect\\\":false},{\\\"id\\\":4,\\\"text\\\":\\\"50\\\",\\\"isCorrect\\\":false},{\\\"id\\\":5,\\\"text\\\":\\\"60\\\",\\\"isCorrect\\\":false}]\"','easy');
/*!40000 ALTER TABLE `quiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_progress`
--

DROP TABLE IF EXISTS `quiz_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_progress` (
  `quiz_progress_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `total_quiz` int(11) NOT NULL,
  `attended_quiz` int(11) DEFAULT '0',
  `pending_quiz` int(11) DEFAULT '0',
  `wrong_quiz` int(11) DEFAULT '0',
  `correct_quiz` int(11) DEFAULT '0',
  `quiz_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`quiz_progress_id`),
  KEY `student_id` (`student_id`),
  KEY `category_id` (`category_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_progress_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `course_category` (`category_id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_progress_ibfk_3` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_progress`
--

LOCK TABLES `quiz_progress` WRITE;
/*!40000 ALTER TABLE `quiz_progress` DISABLE KEYS */;
INSERT INTO `quiz_progress` VALUES (34,5,1,5,1,2,NULL,0,2),(35,5,1,5,2,2,NULL,1,1),(36,5,1,5,3,2,NULL,0,4);
/*!40000 ALTER TABLE `quiz_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `year` varchar(20) NOT NULL,
  `department` varchar(100) NOT NULL,
  `cwq_id` int(11) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `college` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  KEY `fk_cwq_id` (`cwq_id`),
  CONSTRAINT `fk_course_id` FOREIGN KEY (`cwq_id`) REFERENCES `coursewithquiz` (`cwq_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (5,'Vignesh K','vigneshk66060@gmil.com','6383772564','1st Year','CSE',12,'Vignesh@2211','ssce'),(6,'anubu','deval@gmail.com','1234567890','2nd Year','CSE',12,'Deval@2211','ssec'),(7,'anbu','anbu@gmail.com','9876543212','1st Year','CSE',12,'Anbu@2211','ssce');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_review`
--

DROP TABLE IF EXISTS `student_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_review` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `presentation_skills` enum('excellent','good','poor') NOT NULL,
  `response_to_questions` enum('excellent','good','poor') NOT NULL,
  `session_rating` enum('excellent','good','poor') NOT NULL,
  `interested_in_courses` enum('yes','no') NOT NULL,
  `interested_in_internships` enum('yes','no') NOT NULL,
  `technologies` json NOT NULL,
  PRIMARY KEY (`review_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_review_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_review`
--

LOCK TABLES `student_review` WRITE;
/*!40000 ALTER TABLE `student_review` DISABLE KEYS */;
INSERT INTO `student_review` VALUES (3,5,1,'excellent','good','good','yes','yes','[\"AWS\", \"CorePython\", \"CyberSecurity\", \"ML\", \"CoreJava\"]');
/*!40000 ALTER TABLE `student_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','superadmin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Aravinth','aravinth@xploreitcorp.com','$2a$10$aVWgXOJqGuK2abmh.Fz8zueHWf0oUJXeLVVs07XE7UCCOvtCekVzG','superadmin','2024-12-14 09:23:02'),(2,'Ananthi','superadmin@example.com','$2a$10$aVWgXOJqGuK2abmh.Fz8zueHWf0oUJXeLVVs07XE7UCCOvtCekVzG','admin','2024-12-14 09:23:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'quiz_master'
--

--
-- Dumping routines for database 'quiz_master'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-03 16:15:17
