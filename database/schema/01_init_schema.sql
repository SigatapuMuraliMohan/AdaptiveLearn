-- =========================================================================
-- AI-Powered Personalized Learning Platform Database Schema
-- Database: learning_platform_db
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `learning_platform_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `learning_platform_db`;

-- Drop tables in reverse order of foreign keys if recreating
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `admin_actions`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `conversations`;
DROP TABLE IF EXISTS `risk_predictions`;
DROP TABLE IF EXISTS `recommendations`;
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `student_answers`;
DROP TABLE IF EXISTS `assessment_attempts`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `assessments`;
DROP TABLE IF EXISTS `learning_activity`;
DROP TABLE IF EXISTS `learning_sessions`;
DROP TABLE IF EXISTS `learning_path_items`;
DROP TABLE IF EXISTS `learning_paths`;
DROP TABLE IF EXISTS `student_skills`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `learning_preferences`;
DROP TABLE IF EXISTS `learning_goals`;
DROP TABLE IF EXISTS `student_profiles`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Auth & Identity)
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `account_status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Student Profiles (Private Learner Profile)
CREATE TABLE `student_profiles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `current_goal` VARCHAR(255) DEFAULT NULL,
    `current_level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
    `target_outcome` TEXT DEFAULT NULL,
    `onboarding_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Learning Goals
CREATE TABLE `learning_goals` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL,
    `goal_text` VARCHAR(255) NOT NULL,
    `target_outcome` TEXT DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_goal_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Learning Preferences
CREATE TABLE `learning_preferences` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL UNIQUE,
    `preferred_style` VARCHAR(100) DEFAULT 'hands-on',
    `weekly_hours` INT NOT NULL DEFAULT 5,
    `pace_preference` ENUM('SLOW', 'MODERATE', 'FAST') DEFAULT 'MODERATE',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pref_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Canonical Skills
CREATE TABLE `skills` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `category` VARCHAR(100) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_skill_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Student Skills (Mastery Tracker)
CREATE TABLE `student_skills` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL,
    `skill_id` BIGINT NOT NULL,
    `mastery_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'MASTERED', 'NEEDS_REVISION') NOT NULL DEFAULT 'NOT_STARTED',
    `last_assessed_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_profile_skill` (`profile_id`, `skill_id`),
    CONSTRAINT `fk_studentskill_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_studentskill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Personalized Learning Paths
CREATE TABLE `learning_paths` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL,
    `goal_text` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'ADAPTED') NOT NULL DEFAULT 'ACTIVE',
    `total_milestones` INT NOT NULL DEFAULT 1,
    `completed_milestones` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_path_profile` (`profile_id`),
    CONSTRAINT `fk_path_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Learning Path Items (Milestones/Lessons)
CREATE TABLE `learning_path_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `path_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `topic_name` VARCHAR(150) NOT NULL,
    `sequence_order` INT NOT NULL DEFAULT 1,
    `difficulty_level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `estimated_minutes` INT NOT NULL DEFAULT 30,
    `status` ENUM('LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED', 'REMEDIAL') NOT NULL DEFAULT 'LOCKED',
    `is_remedial` BOOLEAN NOT NULL DEFAULT FALSE,
    `lesson_content` LONGTEXT DEFAULT NULL,
    `lesson_content_json` LONGTEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_item_path` (`path_id`),
    CONSTRAINT `fk_item_path` FOREIGN KEY (`path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Learning Sessions
CREATE TABLE `learning_sessions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL,
    `item_id` BIGINT DEFAULT NULL,
    `start_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `end_time` TIMESTAMP NULL DEFAULT NULL,
    `duration_minutes` INT DEFAULT 0,
    CONSTRAINT `fk_session_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_session_item` FOREIGN KEY (`item_id`) REFERENCES `learning_path_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Learning Activity
CREATE TABLE `learning_activity` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `session_id` BIGINT DEFAULT NULL,
    `profile_id` BIGINT NOT NULL,
    `activity_type` VARCHAR(50) NOT NULL,
    `activity_data` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_act_session` FOREIGN KEY (`session_id`) REFERENCES `learning_sessions` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_act_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Assessments
CREATE TABLE `assessments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `path_item_id` BIGINT DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL,
    `assessment_type` ENUM('DIAGNOSTIC', 'TOPIC_QUIZ', 'MILESTONE_TEST') NOT NULL DEFAULT 'TOPIC_QUIZ',
    `total_points` INT NOT NULL DEFAULT 10,
    `passing_percentage` DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_assessment_item` FOREIGN KEY (`path_item_id`) REFERENCES `learning_path_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Assessment Questions
CREATE TABLE `questions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `assessment_id` BIGINT NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('MCQ', 'DESCRIPTIVE', 'CODING') NOT NULL DEFAULT 'MCQ',
    `options_json` JSON DEFAULT NULL,
    `correct_answer` TEXT DEFAULT NULL,
    `evaluation_rubric` TEXT DEFAULT NULL,
    `test_cases_json` JSON DEFAULT NULL,
    `points` INT NOT NULL DEFAULT 1,
    `sequence_order` INT NOT NULL DEFAULT 1,
    INDEX `idx_question_assessment` (`assessment_id`),
    CONSTRAINT `fk_question_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Assessment Attempts
CREATE TABLE `assessment_attempts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `assessment_id` BIGINT NOT NULL,
    `profile_id` BIGINT NOT NULL,
    `score` DECIMAL(5,2) DEFAULT 0.00,
    `max_score` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    `percentage` DECIMAL(5,2) DEFAULT 0.00,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'PASSED') NOT NULL DEFAULT 'PENDING',
    `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_attempt_profile` (`profile_id`),
    CONSTRAINT `fk_attempt_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attempt_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Student Answers
CREATE TABLE `student_answers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `attempt_id` BIGINT NOT NULL,
    `question_id` BIGINT NOT NULL,
    `submitted_answer` LONGTEXT DEFAULT NULL,
    `score_awarded` DECIMAL(5,2) DEFAULT 0.00,
    `is_correct` BOOLEAN DEFAULT FALSE,
    `evaluation_details` JSON DEFAULT NULL,
    `feedback_text` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_answer_attempt` (`attempt_id`),
    CONSTRAINT `fk_answer_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `assessment_attempts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Feedback
CREATE TABLE `feedback` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `attempt_id` BIGINT NOT NULL UNIQUE,
    `profile_id` BIGINT NOT NULL,
    `summary` TEXT NOT NULL,
    `strengths` JSON DEFAULT NULL,
    `weaknesses` JSON DEFAULT NULL,
    `actionable_recommendations` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_feedback_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `assessment_attempts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_feedback_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Recommendations
CREATE TABLE `recommendations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL,
    `recommendation_type` ENUM('NEXT_LESSON', 'REVISION', 'PRACTICE_QUIZ', 'REMEDIAL_MODULE') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `reason` TEXT NOT NULL,
    `target_item_id` BIGINT DEFAULT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_rec_profile` (`profile_id`),
    CONSTRAINT `fk_rec_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rec_item` FOREIGN KEY (`target_item_id`) REFERENCES `learning_path_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Risk Predictions (ML Output)
CREATE TABLE `risk_predictions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL,
    `risk_level` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
    `risk_score` DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    `feature_values` JSON DEFAULT NULL,
    `generated_reason` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_risk_profile` (`profile_id`),
    CONSTRAINT `fk_risk_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Conversations (AI Tutor Sessions)
CREATE TABLE `conversations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` BIGINT NOT NULL,
    `item_id` BIGINT DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL DEFAULT 'Learning Assistant Chat',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_conv_profile` (`profile_id`),
    CONSTRAINT `fk_conv_profile` FOREIGN KEY (`profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_conv_item` FOREIGN KEY (`item_id`) REFERENCES `learning_path_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Chat Messages
CREATE TABLE `chat_messages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` BIGINT NOT NULL,
    `sender` ENUM('STUDENT', 'AI', 'SYSTEM') NOT NULL,
    `message_text` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_chat_conv` (`conversation_id`),
    CONSTRAINT `fk_chat_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. Admin Audit Actions
CREATE TABLE `admin_actions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_user_id` BIGINT NOT NULL,
    `action_type` VARCHAR(100) NOT NULL,
    `target_type` VARCHAR(50) DEFAULT NULL,
    `target_id` BIGINT DEFAULT NULL,
    `details` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. Password Reset OTPs
CREATE TABLE IF NOT EXISTS `password_reset_otps` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL,
    `otp` VARCHAR(6) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_otp_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

