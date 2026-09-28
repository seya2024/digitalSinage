-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2026 at 07:09 PM
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
-- Database: `digital_signage`
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
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `district_id` int(11) DEFAULT NULL,
  `grade` enum('I','II','III','IV','V') NOT NULL DEFAULT 'V',
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_heartbeat` timestamp NULL DEFAULT NULL,
  `status` enum('online','offline','unknown') DEFAULT 'unknown',
  `version` varchar(20) DEFAULT 'v2.0',
  `tv_ip` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `code`, `name`, `district_id`, `grade`, `message`, `created_at`, `updated_at`, `last_heartbeat`, `status`, `version`, `tv_ip`) VALUES
(1, '021', 'Jimma Branch', 7, 'III', 'We are here to serve you passionately!', '2026-09-28 13:13:59', '2026-09-28 16:05:57', NULL, 'unknown', 'v1.0', '192.168.163.251'),
(2, '471', 'Hirmata Branch', 7, 'I', 'We are here to serve you passionately!', '2026-09-28 13:13:59', '2026-09-28 13:51:13', NULL, 'unknown', 'v1.0', NULL),
(3, '104', 'Bonga Branch', 11, 'II', 'We are here to serve you passionately!', '2026-09-28 13:13:59', '2026-09-28 13:51:48', NULL, 'unknown', 'v1.0', NULL),
(4, '054', 'Bedele Branch', 7, 'II', 'We are here to serve you passionately!', '2026-09-28 13:13:59', '2026-09-28 13:51:39', NULL, 'unknown', 'v1.0', NULL);

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
(1, 'US Dollar', 'USD', '$', 'fa-dollar-sign', 'US', 1, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(2, 'Pound Sterling', 'GBP', '£', 'fa-pound-sign', 'GB', 2, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(3, 'United Arab Emirates Dirham', 'AED', 'د.إ', 'fa-money-bill-wave', 'AE', 3, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(4, 'Euro', 'EUR', '€', 'fa-euro-sign', 'EU', 4, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(5, 'Swiss Franc', 'CHF', 'Fr', 'fa-money-bill-wave', 'CH', 5, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(6, 'Kenyan Shilling', 'KES', 'KSh', 'fa-money-bill-wave', 'KE', 6, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(7, 'South African Rand', 'ZAR', 'R', 'fa-money-bill-wave', 'ZA', 7, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(8, 'Swedish Kroner', 'SEK', 'kr', 'fa-money-bill-wave', 'SE', 8, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(9, 'Japanese Yen', 'JPY', '¥', 'fa-yen-sign', 'JP', 9, 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28');

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `location_type` enum('city','upcountry') NOT NULL DEFAULT 'upcountry',
  `contact` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `districts`
--

INSERT INTO `districts` (`id`, `name`, `location_type`, `contact`, `created_at`, `updated_at`) VALUES
(1, 'South Addis District', 'city', '+251911000001', '2026-09-28 13:13:48', '2026-09-28 13:45:23'),
(2, 'East Addis District', 'city', '+251911000002', '2026-09-28 13:13:48', '2026-09-28 13:45:33'),
(3, 'North Addis District', 'city', '+251911000003', '2026-09-28 13:13:48', '2026-09-28 13:45:43'),
(4, 'West Addis District', 'city', '+251911000004', '2026-09-28 13:13:48', '2026-09-28 13:45:54'),
(5, 'Dire Dawa District', 'upcountry', '+251911000005', '2026-09-28 13:13:48', '2026-09-28 13:46:36'),
(6, 'Adama District', 'upcountry', '+251911000006', '2026-09-28 13:13:48', '2026-09-28 13:46:31'),
(7, 'Jimma District', 'upcountry', '+251911000007', '2026-09-28 13:13:48', '2026-09-28 13:13:48'),
(8, 'Hawassa District', 'upcountry', '+251911000008', '2026-09-28 13:13:48', '2026-09-28 13:13:48'),
(9, 'Mekelle District', 'upcountry', '+251911000009', '2026-09-28 13:13:48', '2026-09-28 13:13:48'),
(10, 'Bahir Dar District', 'upcountry', '+251911000010', '2026-09-28 13:13:48', '2026-09-28 13:13:48'),
(11, 'South West District', 'upcountry', '+251911000011', '2026-09-28 13:13:48', '2026-09-28 13:46:54'),
(13, 'Dessie District', 'upcountry', '+251911000013', '2026-09-28 13:13:48', '2026-09-28 13:13:48'),
(14, 'Nekemte District', 'upcountry', '+251911000014', '2026-09-28 13:13:48', '2026-09-28 13:13:48'),
(15, 'Arba Minch District', 'upcountry', '+251911000015', '2026-09-28 13:13:48', '2026-09-28 13:13:48');

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
(1, 3, 47.1173, 46.1934, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(2, 5, 208.5728, 204.4831, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(3, 4, 190.9465, 187.2025, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(4, 2, 217.1029, 212.8460, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(5, 9, 1.0813, 1.0601, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(6, 6, 1.2355, 1.2113, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(7, 8, 15.1405, 14.8436, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(8, 1, 164.0218, 160.8057, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(9, 7, 8.8884, 8.7141, '2026-09-28', 'active', 1, 1, '2026-09-28 14:05:28', '2026-09-28 14:05:28'),
(10, 1, 158.5000, 155.5000, '2026-09-27', 'active', 1, 1, '2026-09-28 16:56:10', '2026-09-28 16:56:10'),
(11, 2, 220.0000, 215.5000, '2026-09-27', 'active', 1, 1, '2026-09-28 16:56:10', '2026-09-28 16:56:10');

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

--
-- Dumping data for table `pending_changes`
--

INSERT INTO `pending_changes` (`id`, `currency_id`, `currency_name`, `currency_code`, `currency_symbol`, `currency_icon`, `sell_rate`, `buy_rate`, `effective_date`, `change_type`, `requested_by`, `approval_status`, `approved_by`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 'United States Dollar', 'USD', '$', 'fa-dollar-sign', 153.0501, 156.1111, '2026-09-28', 'update_rate', 1, 'pending', NULL, NULL, '2026-09-28 13:34:13', '2026-09-28 13:34:13'),
(2, 1, 'United States Dollar', 'USD', '$', 'fa-dollar-sign', 153.0501, 156.1111, '2026-09-28', 'update_rate', 1, 'pending', NULL, NULL, '2026-09-28 13:54:49', '2026-09-28 13:54:49');

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
(1, 'admin', '$2a$10$OjxJqRWCFnSSYi6vI57b4eiA1f20AnNVZaCNok4ItT17olyBM7u82', 'seidm2031@gmail.com', NULL, 'super_admin', 1, '2026-09-28 16:05:18', '2026-09-28 13:15:07', '2026-09-28 16:05:18'),
(2, 'ibd_user', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ibd@dashenbank.com', NULL, '', 1, NULL, '2026-09-28 13:15:07', '2026-09-28 13:15:07'),
(3, 'ibd_manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ibd.manager@dashenbank.com', NULL, '', 1, NULL, '2026-09-28 13:15:07', '2026-09-28 13:15:07'),
(4, 'ibd_officer', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ibd.officer@dashenbank.com', NULL, '', 1, NULL, '2026-09-28 13:15:07', '2026-09-28 13:15:07'),
(5, 'admin_user', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'adminuser@dashenbank.com', NULL, 'admin', 1, NULL, '2026-09-28 13:15:07', '2026-09-28 13:15:07'),
(6, 'admin_tech', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tech@dashenbank.com', NULL, 'admin', 1, NULL, '2026-09-28 13:15:07', '2026-09-28 13:15:07');

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
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_district` (`district_id`),
  ADD KEY `idx_grade` (`grade`),
  ADD KEY `idx_last_heartbeat` (`last_heartbeat`),
  ADD KEY `idx_tv_status` (`status`);

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
-- Indexes for table `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_location_type` (`location_type`);

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
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `pending_changes`
--
ALTER TABLE `pending_changes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE SET NULL;

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
