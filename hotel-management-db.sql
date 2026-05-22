-- ============================================================
-- Hotel Management System – Database Setup Script
-- Database: hotel-management-db
-- ============================================================

CREATE DATABASE IF NOT EXISTS `hotel-management-db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `hotel-management-db`;

-- ============================================================
-- Table: account
-- ============================================================
CREATE TABLE IF NOT EXISTS `account` (
    `id`         BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username`   VARCHAR(50)  NOT NULL UNIQUE,
    `password`   VARCHAR(255) NOT NULL,
    `email`      VARCHAR(100) NOT NULL UNIQUE,
    `role`       VARCHAR(20)  NOT NULL DEFAULT 'GUEST',   -- ADMIN | EMPLOYEE | GUEST
    `active`     BOOLEAN      NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: hotel
-- ============================================================
CREATE TABLE IF NOT EXISTS `hotel` (
    `id`      BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name`    VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone`   VARCHAR(20),
    `email`   VARCHAR(100),
    `rating`  DOUBLE       NOT NULL DEFAULT 5.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: room_type
-- ============================================================
CREATE TABLE IF NOT EXISTS `room_type` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name`        VARCHAR(50)  NOT NULL,
    `base_price`  DOUBLE       NOT NULL,
    `capacity`    INT          NOT NULL DEFAULT 1,
    `description` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: room
-- ============================================================
CREATE TABLE IF NOT EXISTS `room` (
    `id`           BIGINT AUTO_INCREMENT PRIMARY KEY,
    `room_number`  VARCHAR(20)  NOT NULL,
    `floor`        INT          NOT NULL DEFAULT 1,
    `status`       VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE | OCCUPIED | CLEANING | MAINTENANCE
    `room_type_id` BIGINT       NOT NULL,
    `hotel_id`     BIGINT       NOT NULL,
    CONSTRAINT `fk_room_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_room_hotel`     FOREIGN KEY (`hotel_id`)     REFERENCES `hotel`(`id`)     ON DELETE CASCADE  ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: guest
-- ============================================================
CREATE TABLE IF NOT EXISTS `guest` (
    `id`         BIGINT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(50)  NOT NULL,
    `last_name`  VARCHAR(50)  NOT NULL,
    `phone`      VARCHAR(20)  NOT NULL,
    `email`      VARCHAR(100),
    `address`    VARCHAR(255),
    `origin`     VARCHAR(100),
    `dob`        DATE,
    `id_number`  VARCHAR(50),
    `account_id` BIGINT UNIQUE,
    CONSTRAINT `fk_guest_account` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: employee
-- ============================================================
CREATE TABLE IF NOT EXISTS `employee` (
    `id`         BIGINT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(50)  NOT NULL,
    `last_name`  VARCHAR(50)  NOT NULL,
    `position`   VARCHAR(50)  NOT NULL,
    `salary`     DOUBLE       NOT NULL DEFAULT 0.0,
    `phone`      VARCHAR(20),
    `hire_date`  DATE,
    `dob`        DATE,
    `id_number`  VARCHAR(50),
    `hotel_id`   BIGINT       NOT NULL,
    `account_id` BIGINT UNIQUE,
    CONSTRAINT `fk_employee_hotel`   FOREIGN KEY (`hotel_id`)   REFERENCES `hotel`(`id`)   ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT `fk_employee_account` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: reservation
-- ============================================================
CREATE TABLE IF NOT EXISTS `reservation` (
    `id`                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    `guest_id`              BIGINT      NOT NULL,
    `hotel_id`              BIGINT      NOT NULL,
    `check_in`              DATE        NOT NULL,
    `check_out`             DATE        NOT NULL,
    `total_amount`          DOUBLE      NOT NULL DEFAULT 0.0,
    `status`                VARCHAR(20) NOT NULL DEFAULT 'BOOKED', -- BOOKED | CHECKED_IN | COMPLETED | CANCELLED | NO_SHOW
    `in_charge_employee_id` BIGINT,
    CONSTRAINT `fk_reservation_guest`    FOREIGN KEY (`guest_id`)              REFERENCES `guest`(`id`)    ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT `fk_reservation_hotel`    FOREIGN KEY (`hotel_id`)              REFERENCES `hotel`(`id`)    ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT `fk_reservation_employee` FOREIGN KEY (`in_charge_employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: reservation_room  (line-items linking rooms to a reservation)
-- ============================================================
CREATE TABLE IF NOT EXISTS `reservation_room` (
    `id`             BIGINT AUTO_INCREMENT PRIMARY KEY,
    `reservation_id` BIGINT NOT NULL,
    `room_id`        BIGINT NOT NULL,
    `price`          DOUBLE NOT NULL DEFAULT 0.0,
    CONSTRAINT `fk_rr_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rr_room`        FOREIGN KEY (`room_id`)        REFERENCES `room`(`id`)        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: payment
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment` (
    `id`             BIGINT AUTO_INCREMENT PRIMARY KEY,
    `reservation_id` BIGINT      NOT NULL,
    `amount`         DOUBLE      NOT NULL,
    `payment_date`   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `method`         VARCHAR(20) NOT NULL DEFAULT 'CASH', -- CASH | BANKING | PAYPAL | CREDIT_CARD | DEBIT_CARD
    `status`         VARCHAR(20) NOT NULL DEFAULT 'PAID',
    CONSTRAINT `fk_payment_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed: Default admin account  (password = "123456" – BCrypt hash)
-- ============================================================
INSERT IGNORE INTO `account` (`id`, `username`, `password`, `email`, `role`)
VALUES (
    1,
    'admin',
    '$2a$10$ohF/WEyDwqrz6ZbTDSrSReUvEwqXJ6a1NmdvSzrEBmLmLbKouYPFS',
    'admin@hotel.com',
    'ADMIN'
);

-- ============================================================
-- Seed: 6 Popular Hotels from guest.html
-- ============================================================
INSERT IGNORE INTO `hotel` (`id`, `name`, `address`, `phone`, `email`, `rating`)
VALUES 
(1, 'The Plaza Hotel', 'New York City, USA', '+1 212-759-3000', 'plaza@fairmont.com', 5.0),
(2, 'Ritz Paris', 'Paris, France', '+33 1 43 16 30 30', 'ritz@ritzparis.com', 5.0),
(3, 'The Peninsula', 'Hong Kong', '+852 2920 2888', 'phk@peninsula.com', 5.0),
(4, 'Atlantis The Palm', 'Dubai, United Arab Emirates', '+971 4 426 2000', 'info@atlantisthepalm.com', 5.0),
(5, 'The Ritz-Carlton', 'Tokyo, Japan', '+81 3-3423-8000', 'tokyo@ritzcarlton.com', 5.0),
(6, 'Marina Bay Sands', 'Singapore', '+65 6688 8868', 'inquiries@marinabaysands.com', 5.0);

-- ============================================================
-- Seed: Default employee account & profile (password = "123456" – BCrypt hash)
-- ============================================================
INSERT IGNORE INTO `account` (`id`, `username`, `password`, `email`, `role`)
VALUES (
    2,
    'employee',
    '$2a$10$ohF/WEyDwqrz6ZbTDSrSReUvEwqXJ6a1NmdvSzrEBmLmLbKouYPFS',
    'employee@hotel.com',
    'EMPLOYEE'
);

INSERT IGNORE INTO `employee` (`id`, `first_name`, `last_name`, `position`, `salary`, `phone`, `hire_date`, `dob`, `id_number`, `hotel_id`, `account_id`)
VALUES (1, 'John', 'Doe', 'Receptionist', 800.0, '0987654321', '2026-01-01', '1990-05-15', '001122334455', 1, 2);

-- ============================================================
-- Seed: Default guest account & profile (password = "123456" – BCrypt hash)
-- ============================================================
INSERT IGNORE INTO `account` (`id`, `username`, `password`, `email`, `role`)
VALUES (
    3,
    'guest',
    '$2a$10$ohF/WEyDwqrz6ZbTDSrSReUvEwqXJ6a1NmdvSzrEBmLmLbKouYPFS',
    'guest@hotel.com',
    'GUEST'
);

INSERT IGNORE INTO `guest` (`id`, `first_name`, `last_name`, `phone`, `email`, `address`, `origin`, `dob`, `id_number`, `account_id`)
VALUES (1, 'Jane', 'Smith', '0123456789', 'guest@hotel.com', 'Hanoi, Vietnam', 'Vietnam', '1995-10-20', '998877665544', 3);

-- ============================================================
-- Seed: Room Types
-- ============================================================
INSERT IGNORE INTO `room_type` (`id`, `name`, `base_price`, `capacity`, `description`)
VALUES 
(1, 'Standard Room', 150.0, 2, 'Comfortable and elegant standard room with modern amenities.'),
(2, 'Deluxe Room', 300.0, 2, 'Spacious deluxe room with premium features and beautiful view.'),
(3, 'Luxury Suite', 600.0, 4, 'Exquisite multi-room suite with luxury styling and VIP services.');

-- ============================================================
-- Seed: Rooms (36 rooms total – 3 room types x 2 rooms per hotel)
-- ============================================================
INSERT IGNORE INTO `room` (`id`, `room_number`, `floor`, `status`, `room_type_id`, `hotel_id`)
VALUES 
-- Hotel 1 Rooms
(1, '101', 1, 'AVAILABLE', 1, 1),
(2, '102', 1, 'AVAILABLE', 1, 1),
(3, '103', 2, 'AVAILABLE', 2, 1),
(4, '104', 2, 'AVAILABLE', 2, 1),
(5, '105', 3, 'AVAILABLE', 3, 1),
(6, '106', 3, 'AVAILABLE', 3, 1),

-- Hotel 2 Rooms
(7, '201', 1, 'AVAILABLE', 1, 2),
(8, '202', 1, 'AVAILABLE', 1, 2),
(9, '203', 2, 'AVAILABLE', 2, 2),
(10, '204', 2, 'AVAILABLE', 2, 2),
(11, '205', 3, 'AVAILABLE', 3, 2),
(12, '206', 3, 'AVAILABLE', 3, 2),

-- Hotel 3 Rooms
(13, '301', 1, 'AVAILABLE', 1, 3),
(14, '302', 1, 'AVAILABLE', 1, 3),
(15, '303', 2, 'AVAILABLE', 2, 3),
(16, '304', 2, 'AVAILABLE', 2, 3),
(17, '305', 3, 'AVAILABLE', 3, 3),
(18, '306', 3, 'AVAILABLE', 3, 3),

-- Hotel 4 Rooms
(19, '401', 1, 'AVAILABLE', 1, 4),
(20, '402', 1, 'AVAILABLE', 1, 4),
(21, '403', 2, 'AVAILABLE', 2, 4),
(22, '404', 2, 'AVAILABLE', 2, 4),
(23, '405', 3, 'AVAILABLE', 3, 4),
(24, '406', 3, 'AVAILABLE', 3, 4),

-- Hotel 5 Rooms
(25, '501', 1, 'AVAILABLE', 1, 5),
(26, '502', 1, 'AVAILABLE', 1, 5),
(27, '503', 2, 'AVAILABLE', 2, 5),
(28, '504', 2, 'AVAILABLE', 2, 5),
(29, '505', 3, 'AVAILABLE', 3, 5),
(30, '506', 3, 'AVAILABLE', 3, 5),

-- Hotel 6 Rooms
(31, '601', 1, 'AVAILABLE', 1, 6),
(32, '602', 1, 'AVAILABLE', 1, 6),
(33, '603', 2, 'AVAILABLE', 2, 6),
(34, '604', 2, 'AVAILABLE', 2, 6),
(35, '605', 3, 'AVAILABLE', 3, 6),
(36, '606', 3, 'AVAILABLE', 3, 6);
