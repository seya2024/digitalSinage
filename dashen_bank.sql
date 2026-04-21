-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 05:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dashen_bank`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `symbol` varchar(10) DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'fa-money-bill-wave',
  `country_code` varchar(5) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `name`, `code`, `symbol`, `icon`, `country_code`, `display_order`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'United States Dollar', 'USD', '$', 'fa-dollar-sign', 'us', 1, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(2, 'Euro', 'EUR', '€', 'fa-euro-sign', 'eu', 2, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(3, 'British Pound Sterling', 'GBP', '£', 'fa-pound-sign', 'gb', 3, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(4, 'Saudi Riyal', 'SAR', '﷼', 'fa-money-bill-wave', 'sa', 4, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(5, 'Chinese Yuan', 'CNY', '¥', 'fa-yen-sign', 'cn', 5, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(6, 'Japanese Yen', 'JPY', '¥', 'fa-yen-sign', 'jp', 6, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(7, 'Australian Dollar', 'AUD', 'A$', 'fa-dollar-sign', 'au', 7, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(8, 'Canadian Dollar', 'CAD', 'C$', 'fa-dollar-sign', 'ca', 8, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(9, 'Swiss Franc', 'CHF', 'CHF', 'fa-money-bill-wave', 'ch', 9, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(10, 'UAE Dirham', 'AED', 'د.إ', 'fa-money-bill-wave', 'ae', 10, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(11, 'South African Rand', 'ZAR', 'R', 'fa-money-bill-wave', 'za', 11, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(12, 'Indian Rupee', 'INR', '₹', 'fa-rupee-sign', 'in', 12, 1, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29');

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rates`
--

CREATE TABLE `exchange_rates` (
  `id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `sell_rate` decimal(15,4) NOT NULL,
  `buy_rate` decimal(15,4) NOT NULL,
  `effective_date` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exchange_rates`
--

INSERT INTO `exchange_rates` (`id`, `currency_id`, `sell_rate`, `buy_rate`, `effective_date`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, 153.0501, 156.1111, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(2, 2, 181.8235, 185.4599, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(3, 3, 209.2121, 213.3964, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(4, 4, 43.4859, 44.3556, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(5, 5, 21.2297, 21.6543, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(6, 6, 0.8750, 0.8950, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(7, 7, 62.5000, 64.2000, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(8, 8, 57.8000, 59.3000, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(9, 9, 118.5000, 121.0000, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(10, 10, 42.5000, 43.8000, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(11, 11, 8.2900, 8.4558, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29'),
(12, 12, 1.8400, 1.8768, '2026-04-20', 'active', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:08:29');

-- --------------------------------------------------------

--
-- Table structure for table `pending_changes`
--

CREATE TABLE `pending_changes` (
  `id` int(11) NOT NULL,
  `currency_id` int(11) DEFAULT NULL,
  `currency_name` varchar(100) DEFAULT NULL,
  `currency_code` varchar(10) DEFAULT NULL,
  `currency_symbol` varchar(10) DEFAULT NULL,
  `currency_icon` varchar(50) DEFAULT NULL,
  `sell_rate` decimal(15,4) DEFAULT NULL,
  `buy_rate` decimal(15,4) DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `change_type` enum('add_currency','update_rate','delete_currency') NOT NULL,
  `requested_by` int(11) NOT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rate_history`
--

CREATE TABLE `rate_history` (
  `id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `currency_code` varchar(10) DEFAULT NULL,
  `currency_name` varchar(100) DEFAULT NULL,
  `old_sell_rate` decimal(15,4) DEFAULT NULL,
  `new_sell_rate` decimal(15,4) DEFAULT NULL,
  `old_buy_rate` decimal(15,4) DEFAULT NULL,
  `new_buy_rate` decimal(15,4) DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `action_type` enum('create','update','delete') NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `change_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` varchar(255) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES
(1, 'auto_refresh_interval', '30', 'number', 'Auto-refresh interval in seconds', NULL, '2026-04-20 15:08:29'),
(2, 'default_currency', 'USD', 'string', 'Default base currency', NULL, '2026-04-20 15:08:29'),
(3, 'date_format', 'DD/MM/YYYY', 'string', 'Date display format', NULL, '2026-04-20 15:08:29'),
(4, 'time_format', '24h', 'string', 'Time display format', NULL, '2026-04-20 15:08:29'),
(5, 'maintenance_mode', 'false', 'boolean', 'System maintenance mode', NULL, '2026-04-20 15:08:29'),
(6, 'video_autoplay', 'true', 'boolean', 'Auto-play videos on dashboard', NULL, '2026-04-20 15:08:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('super_admin','admin','viewer') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'super', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super@dashenbank.com', 'System Administrator', 'super_admin', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:10:00'),
(4, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@dashenbank.com', 'System Administrator', 'super_admin', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:10:00'),
(5, 'viewer', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'viewer@dashenbank.com', 'System Administrator', 'super_admin', 1, NULL, '2026-04-20 15:08:29', '2026-04-20 15:10:00');

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `video_url` varchar(500) NOT NULL,
  `video_type` enum('youtube','vimeo','local') DEFAULT 'youtube',
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `display_order` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `title`, `description`, `video_url`, `video_type`, `thumbnail_url`, `duration`, `status`, `display_order`, `start_date`, `end_date`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Welcome to Dashen Bank', 'Your trusted banking partner since 1995', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'youtube', NULL, NULL, 'active', 1, NULL, NULL, 1, '2026-04-20 15:08:29', '2026-04-20 15:08:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_currency_date` (`currency_id`,`effective_date`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_currency_id` (`currency_id`),
  ADD KEY `idx_effective_date` (`effective_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `pending_changes`
--
ALTER TABLE `pending_changes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `currency_id` (`currency_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`approval_status`),
  ADD KEY `idx_change_type` (`change_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `rate_history`
--
ALTER TABLE `rate_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_currency_id` (`currency_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_action_type` (`action_type`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_setting_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_display_order` (`display_order`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `pending_changes`
--
ALTER TABLE `pending_changes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rate_history`
--
ALTER TABLE `rate_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `currencies`
--
ALTER TABLE `currencies`
  ADD CONSTRAINT `currencies_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD CONSTRAINT `exchange_rates_ibfk_1` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exchange_rates_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `exchange_rates_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pending_changes`
--
ALTER TABLE `pending_changes`
  ADD CONSTRAINT `pending_changes_ibfk_1` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pending_changes_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pending_changes_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rate_history`
--
ALTER TABLE `rate_history`
  ADD CONSTRAINT `rate_history_ibfk_1` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rate_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `videos`
--
ALTER TABLE `videos`
  ADD CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
