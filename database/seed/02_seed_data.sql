-- =========================================================================
-- AI-Powered Personalized Learning Platform Seed Data
-- Database: learning_platform_db
-- =========================================================================

USE `learning_platform_db`;

-- Insert Initial Canonical Skills
INSERT INTO `skills` (`name`, `category`, `description`) VALUES
('Java Basics & Syntax', 'Programming - Java', 'Variables, data types, operators, conditionals, and control flow in Java.'),
('Object-Oriented Programming (OOP)', 'Programming - Java', 'Classes, objects, inheritance, polymorphism, encapsulation, and abstraction.'),
('Java Collections Framework', 'Programming - Java', 'List, Set, Map, Queue, Iterators, and Collections algorithms.'),
('Exception Handling & I/O', 'Programming - Java', 'Try-catch blocks, custom exceptions, file reading, and streams.'),
('Relational Databases & SQL', 'Databases', 'DDL, DML, Joins, Aggregations, Indexing, and Transactions.'),
('Spring Boot Framework', 'Backend Development', 'Dependency Injection, Spring MVC, REST APIs, and application properties.'),
('Spring Data JPA & Hibernate', 'Backend Development', 'ORM, Entity relationships, CrudRepository, and JPQL queries.'),
('RESTful API Design & Security', 'Backend Development', 'HTTP methods, status codes, JWT authentication, and Spring Security.'),
('Docker & Containerization', 'DevOps & Tooling', 'Containers, Dockerfile, images, volumes, and docker-compose.'),
('Git & Version Control', 'Software Engineering', 'Branching, merging, commit discipline, and pull requests.')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Insert Demo Users (Password: admin123 -> Valid BCrypt: $2a$10$Wan.pV05mAdkdlJE0dgcW.nYW0yFqO49aSh7Ml9pkt1e9WlBglV0i)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `account_status`) VALUES
(1, 'admin@platform.com', '$2a$10$Wan.pV05mAdkdlJE0dgcW.nYW0yFqO49aSh7Ml9pkt1e9WlBglV0i', 'System Admin', 'ADMIN', 'ACTIVE'),
(2, 'rahul@student.com', '$2a$10$Wan.pV05mAdkdlJE0dgcW.nYW0yFqO49aSh7Ml9pkt1e9WlBglV0i', 'Rahul Sharma', 'STUDENT', 'ACTIVE')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `password_hash` = VALUES(`password_hash`);

-- Insert Demo Student Profile for Rahul
INSERT INTO `student_profiles` (`id`, `user_id`, `current_goal`, `current_level`, `target_outcome`, `onboarding_completed`) VALUES
(1, 2, 'Java Backend Developer', 'BEGINNER', 'Build production-ready Spring Boot microservices', FALSE)
ON DUPLICATE KEY UPDATE `current_goal` = VALUES(`current_goal`);

-- Insert Rahul's Preferences
INSERT INTO `learning_preferences` (`profile_id`, `preferred_style`, `weekly_hours`, `pace_preference`) VALUES
(1, 'hands-on with analogies', 8, 'MODERATE')
ON DUPLICATE KEY UPDATE `weekly_hours` = VALUES(`weekly_hours`);
