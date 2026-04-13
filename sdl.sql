-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for foodapp
CREATE DATABASE IF NOT EXISTS `foodapp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `foodapp`;

-- Dumping structure for table foodapp.addresses
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.addresses: ~55 rows (approximately)
INSERT INTO `addresses` (`id`, `user_id`, `address`) VALUES
	(1, 1, '12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City'),
	(2, 2, '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City'),
	(3, 3, '88 Phan Chu Trinh, Hai Chau Ward, Da Nang City'),
	(4, 4, '120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa'),
	(5, 5, '25 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'),
	(7, 7, '210 Bach Dang, Hai Chau Ward, Da Nang City'),
	(8, 8, '17 Nguyen Hue, Hue City, Thua Thien Hue'),
	(9, 9, '12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City'),
	(10, 10, '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City'),
	(11, 11, '88 Phan Chu Trinh, Hai Chau Ward, Da Nang City'),
	(12, 12, '120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa'),
	(13, 13, '25 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'),
	(14, 14, '9 Hung Vuong, Ninh Kieu Ward, Can Tho City'),
	(15, 15, '210 Bach Dang, Hai Chau Ward, Da Nang City'),
	(16, 16, '17 Nguyen Hue, Hue City, Thua Thien Hue'),
	(17, 17, '12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City'),
	(18, 18, '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City'),
	(19, 19, '88 Phan Chu Trinh, Hai Chau Ward, Da Nang City'),
	(20, 20, '120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa'),
	(21, 21, '25 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'),
	(22, 22, '9 Hung Vuong, Ninh Kieu Ward, Can Tho City'),
	(23, 23, '210 Bach Dang, Hai Chau Ward, Da Nang City'),
	(24, 24, '17 Nguyen Hue, Hue City, Thua Thien Hue'),
	(25, 25, '12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City'),
	(26, 26, '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City'),
	(27, 27, '88 Phan Chu Trinh, Hai Chau Ward, Da Nang City'),
	(28, 28, '120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa'),
	(29, 29, '25 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'),
	(30, 30, '9 Hung Vuong, Ninh Kieu Ward, Can Tho City'),
	(31, 31, '210 Bach Dang, Hai Chau Ward, Da Nang City'),
	(32, 32, '17 Nguyen Hue, Hue City, Thua Thien Hue'),
	(33, 33, '12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City'),
	(34, 34, '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City'),
	(35, 35, '88 Phan Chu Trinh, Hai Chau Ward, Da Nang City'),
	(36, 36, '120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa'),
	(37, 37, '25 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'),
	(38, 38, '9 Hung Vuong, Ninh Kieu Ward, Can Tho City'),
	(39, 39, '210 Bach Dang, Hai Chau Ward, Da Nang City'),
	(40, 40, '17 Nguyen Hue, Hue City, Thua Thien Hue'),
	(41, 41, '12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City'),
	(42, 42, '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City'),
	(43, 43, '88 Phan Chu Trinh, Hai Chau Ward, Da Nang City'),
	(44, 44, '120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa'),
	(45, 45, '25 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'),
	(46, 46, '9 Hung Vuong, Ninh Kieu Ward, Can Tho City'),
	(47, 47, '210 Bach Dang, Hai Chau Ward, Da Nang City'),
	(48, 48, '17 Nguyen Hue, Hue City, Thua Thien Hue'),
	(49, 49, '12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City'),
	(50, 50, '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City'),
	(51, 51, '88 Phan Chu Trinh, Hai Chau Ward, Da Nang City'),
	(52, 52, '120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa'),
	(53, 6, 'phường linh trung,khu phố 9'),
	(54, 6, 'phường linh trung khu phố 10'),
	(55, 6, 'khu phố 9, nha trang'),
	(57, 2, '702/45/24 Điện biên phủ');

-- Dumping structure for table foodapp.carts
CREATE TABLE IF NOT EXISTS `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.carts: ~7 rows (approximately)
INSERT INTO `carts` (`id`, `user_id`) VALUES
	(1, 1),
	(2, 2),
	(3, 1),
	(4, 2),
	(5, 1),
	(6, 2),
	(7, 6);

-- Dumping structure for table foodapp.cart_items
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int DEFAULT NULL,
  `food_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.cart_items: ~4 rows (approximately)
INSERT INTO `cart_items` (`id`, `cart_id`, `food_id`, `quantity`) VALUES
	(1, 1, 1, 2),
	(2, 1, 3, 1),
	(4, 1, 1, 2),
	(5, 1, 3, 1);

-- Dumping structure for table foodapp.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.categories: ~5 rows (approximately)
INSERT INTO `categories` (`id`, `name`) VALUES
	(1, 'Mì & Phở'),
	(2, 'Cơm'),
	(3, 'Bánh & Bánh Mì'),
	(4, 'Đồ Uống'),
	(5, 'Tráng Miệng');

-- Dumping structure for table foodapp.foods
CREATE TABLE IF NOT EXISTS `foods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` float DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `restaurant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.foods: ~6 rows (approximately)
INSERT INTO `foods` (`id`, `name`, `price`, `image`, `category_id`, `restaurant_id`) VALUES
	(1, 'Phở Bò', 500000, 'images/pho.jpg', NULL, NULL),
	(2, 'Cơm Tấm', 350000, 'images/comtam.jpg', NULL, NULL),
	(3, 'Bánh Mì', 200000, 'images/banhmi.jpg', NULL, NULL),
	(4, 'Bún Chả', 450000, 'images/buncha.jpg', NULL, NULL),
	(5, 'Mì Xào', 400000, 'images/mixao.jpg', NULL, NULL),
	(6, 'Cơm Gà', 550000, 'images/comga.jpg', NULL, NULL);

-- Dumping structure for table foodapp.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total` float DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_method` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_requested_at` datetime DEFAULT NULL,
  `payment_expires_at` datetime DEFAULT NULL,
  `payment_expired_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shipping_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtotal` float DEFAULT NULL,
  `voucher_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `discount_percent` float DEFAULT NULL,
  `discount_amount` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.orders: ~35 rows (approximately)
INSERT INTO `orders` (`id`, `user_id`, `total`, `status`, `payment_method`, `payment_requested_at`, `payment_expires_at`, `payment_expired_at`, `approved_at`, `rejected_at`, `created_at`, `shipping_address`, `subtotal`, `voucher_code`, `discount_percent`, `discount_amount`) VALUES
	(1, 1, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-07 07:35:47', NULL, NULL, NULL, NULL, NULL),
	(2, 1, NULL, 'delivered', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-07 07:35:47', NULL, NULL, NULL, NULL, NULL),
	(3, 2, NULL, 'payment_expired', 'qr', '2026-04-08 14:11:03', '2026-04-08 14:11:33', '2026-04-08 14:13:08', NULL, NULL, '2026-04-07 07:35:47', NULL, NULL, NULL, NULL, NULL),
	(4, 6, 550000, 'payment_expired', 'qr', '2026-04-08 07:19:03', '2026-04-08 07:19:33', '2026-04-08 07:19:41', NULL, NULL, '2026-04-07 07:38:01', NULL, NULL, NULL, NULL, NULL),
	(5, 6, 522500, 'paid', 'qr', '2026-04-08 00:52:10', '2026-04-08 00:52:40', NULL, '2026-04-08 00:52:21', NULL, '2026-04-08 00:51:09', '9 Hung Vuong, Ninh Kieu Ward, Can Tho City', 550000, 'GIAM5', 5, 27500),
	(6, 6, 380000, 'paid', 'qr', '2026-04-08 01:12:22', '2026-04-08 01:12:52', NULL, '2026-04-08 01:12:42', NULL, '2026-04-08 01:10:37', 'phường linh trung,khu phố 9', 400000, 'GIAM5', 5, 20000),
	(7, 6, 400000, 'paid', 'qr', '2026-04-08 01:17:57', '2026-04-08 01:18:27', NULL, '2026-04-08 01:18:21', NULL, '2026-04-08 01:17:45', 'phường linh trung,khu phố 9', 400000, NULL, 0, 0),
	(8, 6, 380000, 'paid', 'qr', '2026-04-08 01:52:35', '2026-04-08 01:53:05', NULL, '2026-04-08 01:52:54', NULL, '2026-04-08 01:52:09', 'khu phố 9, nha trang', 400000, 'GIAM5', 5, 20000),
	(9, 6, 522500, 'paid', 'qr', '2026-04-08 02:00:52', '2026-04-08 02:01:22', NULL, '2026-04-08 02:01:01', NULL, '2026-04-08 02:00:43', 'khu phố 9, nha trang', 550000, 'GIAM5', 5, 27500),
	(10, 6, 800000, 'paid', 'qr', '2026-04-08 02:10:15', '2026-04-08 02:10:45', NULL, '2026-04-08 02:10:25', NULL, '2026-04-08 02:09:54', '123 Linh Trung, Thủ Đức, TP.HCM', 1000000, 'GIAM20', 20, 200000),
	(11, 6, 800000, 'paid', 'qr', '2026-04-08 02:13:31', '2026-04-08 02:14:01', NULL, '2026-04-08 02:13:42', NULL, '2026-04-08 02:13:01', '123 Linh Trung, Thủ Đức, TP.HCM', 1000000, 'GIAM20', 20, 200000),
	(12, 6, 350000, 'payment_expired', 'qr', '2026-04-08 05:32:44', '2026-04-08 05:33:14', '2026-04-08 05:33:41', NULL, NULL, '2026-04-08 05:31:58', '123 Linh Trung, Thủ Đức, TP.HCM', 350000, NULL, 0, 0),
	(13, 6, 550000, 'payment_expired', 'qr', '2026-04-08 07:19:12', '2026-04-08 07:19:42', '2026-04-08 07:20:41', NULL, NULL, '2026-04-08 07:18:59', '123 Linh Trung, Thủ Đức, TP.HCM', 550000, NULL, 0, 0),
	(14, 6, 400000, 'payment_expired', 'qr', '2026-04-08 07:44:52', '2026-04-08 07:45:22', '2026-04-08 07:45:41', NULL, NULL, '2026-04-08 07:44:26', '123 Linh Trung, Thủ Đức, TP.HCM', 400000, NULL, 0, 0),
	(15, 6, 550000, 'payment_expired', 'qr', '2026-04-08 07:46:21', '2026-04-08 07:46:51', '2026-04-08 07:47:08', NULL, NULL, '2026-04-08 07:45:58', '123 Linh Trung, Thủ Đức, TP.HCM', 550000, NULL, 0, 0),
	(16, 6, 400000, 'pending_payment', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-08 07:53:04', '123 Linh Trung, Thủ Đức, TP.HCM', 400000, NULL, 0, 0),
	(17, 6, 350000, 'payment_expired', 'qr', '2026-04-08 07:59:04', '2026-04-08 07:59:34', '2026-04-08 07:59:34', NULL, NULL, '2026-04-08 07:56:23', '123 Linh Trung, Thủ Đức, TP.HCM', 350000, NULL, 0, 0),
	(18, 6, 550000, 'payment_expired', 'qr', '2026-04-08 08:55:30', '2026-04-08 08:56:00', '2026-04-08 11:23:15', NULL, NULL, '2026-04-08 08:55:07', '123 Linh Trung, Thủ Đức, TP.HCM', 550000, NULL, 0, 0),
	(19, 6, 550000, 'paid', 'qr', '2026-04-08 11:29:11', '2026-04-08 11:29:41', NULL, '2026-04-08 11:29:23', NULL, '2026-04-08 11:23:47', '123 Linh Trung, Thủ Đức, TP.HCM', 550000, NULL, 0, 0),
	(20, 2, 350000, 'payment_expired', 'qr', '2026-04-08 13:13:07', '2026-04-08 13:13:37', '2026-04-08 13:13:38', NULL, NULL, '2026-04-08 13:12:49', '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City', 350000, NULL, 0, 0),
	(21, 2, 2100000, 'paid', 'qr', '2026-04-08 13:15:56', '2026-04-08 13:16:26', NULL, '2026-04-08 13:16:06', NULL, '2026-04-08 13:15:43', '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City', 2100000, NULL, 0, 0),
	(22, 2, 550000, 'payment_expired', 'qr', '2026-04-08 13:24:11', '2026-04-08 13:24:41', '2026-04-08 13:24:41', NULL, NULL, '2026-04-08 13:16:33', '45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City', 550000, NULL, 0, 0),
	(23, 53, 10000, 'payment_expired', 'qr', '2026-04-08 13:22:04', '2026-04-08 13:22:34', '2026-04-08 13:24:19', NULL, NULL, '2026-04-08 13:21:40', '123 Test St', 10000, NULL, 0, 0),
	(24, 2, 440000, 'payment_expired', 'qr', '2026-04-08 14:11:03', '2026-04-08 14:11:33', '2026-04-08 14:13:08', NULL, NULL, '2026-04-08 13:46:27', '702/45/24 Điện biên phủ', 550000, 'GIAM20', 20, 110000),
	(25, 2, 440000, 'payment_expired', 'qr', '2026-04-08 14:04:32', '2026-04-08 14:05:02', '2026-04-08 14:05:03', NULL, NULL, '2026-04-08 14:04:28', '702/45/24 Điện biên phủ', 550000, 'GIAM20', 20, 110000),
	(26, 2, 550000, 'paid', 'qr', '2026-04-08 14:07:18', '2026-04-08 14:07:48', NULL, '2026-04-08 14:07:42', NULL, '2026-04-08 14:07:15', '702/45/24 Điện biên phủ', 550000, NULL, 0, 0),
	(27, 2, 550000, 'payment_expired', 'qr', '2026-04-08 14:12:02', '2026-04-08 14:12:32', '2026-04-08 14:13:08', NULL, NULL, '2026-04-08 14:11:59', '702/45/24 Điện biên phủ', 550000, NULL, 0, 0),
	(28, 2, 550000, 'paid', 'qr', '2026-04-08 14:14:08', '2026-04-08 14:14:38', NULL, '2026-04-08 14:14:26', NULL, '2026-04-08 14:14:04', '702/45/24 Điện biên phủ', 550000, NULL, 0, 0),
	(29, 2, 550000, 'paid', 'qr', '2026-04-08 14:16:22', '2026-04-08 14:16:52', NULL, '2026-04-08 14:16:30', NULL, '2026-04-08 14:16:01', '702/45/24 Điện biên phủ', 550000, NULL, 0, 0),
	(30, 2, 522500, 'payment_expired', 'qr', '2026-04-08 14:18:21', '2026-04-08 14:18:51', '2026-04-08 14:18:52', NULL, NULL, '2026-04-08 14:18:19', '702/45/24 Điện biên phủ', 550000, 'FREESHIP5', 5, 27500),
	(31, 2, 440000, 'payment_expired', 'qr', '2026-04-08 14:21:41', '2026-04-08 14:22:11', '2026-04-08 14:29:04', NULL, NULL, '2026-04-08 14:21:39', '702/45/24 Điện biên phủ', 550000, 'GIAM20', 20, 110000),
	(32, 2, 440000, 'payment_expired', 'qr', '2026-04-08 14:24:08', '2026-04-08 14:24:38', '2026-04-08 14:29:04', NULL, NULL, '2026-04-08 14:24:06', '702/45/24 Điện biên phủ', 550000, 'GIAM20', 20, 110000),
	(33, 2, 760000, 'payment_expired', 'qr', '2026-04-08 14:25:36', '2026-04-08 14:26:06', '2026-04-08 14:29:04', NULL, NULL, '2026-04-08 14:25:33', '702/45/24 Điện biên phủ', 950000, 'GIAM20', 20, 190000),
	(34, 2, 550000, 'payment_expired', 'qr', '2026-04-08 14:26:13', '2026-04-08 14:26:43', '2026-04-08 14:26:43', NULL, NULL, '2026-04-08 14:26:10', '702/45/24 Điện biên phủ', 550000, NULL, 0, 0),
	(35, 2, 160000, 'paid', 'qr', '2026-04-08 14:40:03', '2026-04-08 14:40:33', NULL, '2026-04-08 14:40:11', NULL, '2026-04-08 14:40:00', '702/45/24 Điện biên phủ', 200000, 'GIAM20', 20, 40000);

-- Dumping structure for table foodapp.order_details
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `food_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.order_details: ~39 rows (approximately)
INSERT INTO `order_details` (`id`, `order_id`, `food_id`, `quantity`) VALUES
	(1, 5, 6, 1),
	(2, 6, 5, 1),
	(3, 7, 5, 1),
	(4, 8, 5, 1),
	(5, 9, 6, 1),
	(6, 10, 6, 1),
	(7, 10, 4, 1),
	(8, 11, 6, 1),
	(9, 11, 4, 1),
	(10, 12, 2, 1),
	(11, 13, 6, 1),
	(12, 14, 5, 1),
	(13, 15, 6, 1),
	(14, 16, 5, 1),
	(15, 17, 2, 1),
	(16, 18, 6, 1),
	(17, 19, 6, 1),
	(18, 20, 2, 1),
	(19, 21, 2, 1),
	(20, 21, 6, 1),
	(21, 21, 3, 1),
	(22, 21, 3, 1),
	(23, 21, 5, 1),
	(24, 21, 5, 1),
	(25, 22, 6, 1),
	(26, 23, 1, 1),
	(27, 24, 6, 1),
	(28, 25, 6, 1),
	(29, 26, 6, 1),
	(30, 27, 6, 1),
	(31, 28, 6, 1),
	(32, 29, 6, 1),
	(33, 30, 6, 1),
	(34, 31, 6, 1),
	(35, 32, 6, 1),
	(36, 33, 6, 1),
	(37, 33, 5, 1),
	(38, 34, 6, 1),
	(39, 35, 3, 1);

-- Dumping structure for table foodapp.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `food_id` int DEFAULT NULL,
  `food_name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `quantity` int NOT NULL DEFAULT '1',
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table foodapp.order_items: ~28 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `food_id`, `food_name`, `price`, `quantity`, `image`, `created_at`) VALUES
	(1, 4, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-07 07:38:01'),
	(3, 6, 5, 'Mì Xào', 400000.00, 1, 'images/mixao.jpg', '2026-04-08 01:10:37'),
	(10, 11, 4, 'Bún Chả', 450000.00, 1, 'images/buncha.jpg', '2026-04-08 02:13:01'),
	(13, 14, 5, 'Mì Xào', 400000.00, 1, 'images/mixao.jpg', '2026-04-08 07:44:26'),
	(14, 15, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 07:45:58'),
	(16, 17, 2, 'Cơm Tấm', 350000.00, 1, 'images/comtam.jpg', '2026-04-08 07:56:23'),
	(19, 20, 2, 'Cơm Tấm', 350000.00, 1, 'images/comtam.jpg', '2026-04-08 13:12:49'),
	(20, 21, 2, 'Cơm Tấm', 350000.00, 1, 'images/comtam.jpg', '2026-04-08 13:15:43'),
	(21, 21, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 13:15:43'),
	(22, 21, 3, 'Bánh Mì', 200000.00, 1, 'images/banhmi.jpg', '2026-04-08 13:15:43'),
	(23, 21, 3, 'Bánh Mì', 200000.00, 1, 'images/banhmi.jpg', '2026-04-08 13:15:43'),
	(24, 21, 5, 'Mì Xào', 400000.00, 1, 'images/mixao.jpg', '2026-04-08 13:15:43'),
	(25, 21, 5, 'Mì Xào', 400000.00, 1, 'images/mixao.jpg', '2026-04-08 13:15:43'),
	(26, 22, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 13:16:33'),
	(27, 23, 1, 'Test Food', 10000.00, 1, '', '2026-04-08 13:21:40'),
	(28, 24, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 13:46:27'),
	(29, 25, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:04:28'),
	(30, 26, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:07:15'),
	(31, 27, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:11:59'),
	(32, 28, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:14:04'),
	(33, 29, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:16:01'),
	(34, 30, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:18:19'),
	(35, 31, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:21:39'),
	(36, 32, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:24:06'),
	(37, 33, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:25:33'),
	(38, 33, 5, 'Mì Xào', 400000.00, 1, 'images/mixao.jpg', '2026-04-08 14:25:33'),
	(39, 34, 6, 'Cơm Gà', 550000.00, 1, 'images/comga.jpg', '2026-04-08 14:26:10'),
	(40, 35, 3, 'Bánh Mì', 200000.00, 1, 'images/banhmi.jpg', '2026-04-08 14:40:00');

-- Dumping structure for table foodapp.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `requested_at` datetime DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_payments_order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.payments: ~32 rows (approximately)
INSERT INTO `payments` (`id`, `order_id`, `method`, `status`, `note`, `requested_at`, `reviewed_at`) VALUES
	(2, 5, 'qr', 'paid', 'Admin approved payment', '2026-04-08 00:52:10', '2026-04-08 00:52:21'),
	(4, 6, 'qr', 'paid', 'Admin approved payment', '2026-04-08 01:12:22', '2026-04-08 01:12:42'),
	(6, 7, 'qr', 'paid', 'Admin approved payment', '2026-04-08 01:17:57', '2026-04-08 01:18:21'),
	(7, 4, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 07:19:03', '2026-04-08 15:23:30'),
	(9, 8, 'qr', 'awaiting_approval', 'Admin approved payment', '2026-04-08 01:52:35', '2026-04-08 01:52:54'),
	(11, 9, 'qr', 'paid', 'Admin approved payment', '2026-04-08 02:00:52', '2026-04-08 02:01:01'),
	(13, 10, 'qr', 'paid', 'Admin approved payment', '2026-04-08 02:10:15', '2026-04-08 02:10:25'),
	(15, 11, 'qr', 'paid', 'Admin approved payment', '2026-04-08 02:13:31', '2026-04-08 02:13:42'),
	(16, 12, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 05:32:44', '2026-04-08 15:23:30'),
	(18, 13, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 07:19:12', '2026-04-08 15:23:30'),
	(21, 14, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 07:44:52', '2026-04-08 15:23:30'),
	(22, 15, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 07:46:21', '2026-04-08 15:23:30'),
	(25, 17, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 07:59:04', '2026-04-08 15:23:30'),
	(26, 18, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 08:55:30', '2026-04-08 15:23:30'),
	(28, 19, 'qr', 'paid', 'Admin approved payment', '2026-04-08 11:29:11', '2026-04-08 11:29:23'),
	(30, 20, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 13:13:07', '2026-04-08 15:23:30'),
	(32, 21, 'qr', 'paid', 'Admin approved payment', '2026-04-08 13:15:56', '2026-04-08 13:16:06'),
	(34, 22, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 13:24:11', '2026-04-08 15:23:30'),
	(36, 23, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 13:22:04', '2026-04-08 15:23:30'),
	(37, 24, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:11:03', '2026-04-08 15:23:30'),
	(39, 3, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:11:03', '2026-04-08 15:23:30'),
	(40, 25, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:04:32', '2026-04-08 15:23:30'),
	(41, 26, 'qr', 'paid', 'Admin approved payment', '2026-04-08 14:07:18', '2026-04-08 14:07:42'),
	(42, 27, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:12:02', '2026-04-08 15:23:30'),
	(43, 28, 'qr', 'paid', 'Admin approved payment', '2026-04-08 14:14:08', '2026-04-08 14:14:26'),
	(44, 29, 'qr', 'paid', 'Admin approved payment', '2026-04-08 14:16:22', '2026-04-08 14:16:30'),
	(45, 30, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:18:21', '2026-04-08 15:23:30'),
	(46, 31, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:21:41', '2026-04-08 15:23:30'),
	(47, 32, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:24:08', '2026-04-08 15:23:30'),
	(48, 33, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:25:36', '2026-04-08 15:23:30'),
	(49, 34, 'qr', 'payment_expired', 'Order expired automatically', '2026-04-08 14:26:13', '2026-04-08 15:23:30'),
	(50, 35, 'qr', 'paid', 'Admin approved payment', '2026-04-08 14:40:03', '2026-04-08 14:40:11');

-- Dumping structure for table foodapp.restaurants
CREATE TABLE IF NOT EXISTS `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `opening_hours` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.restaurants: ~3 rows (approximately)
INSERT INTO `restaurants` (`id`, `name`, `address`, `phone`, `email`, `description`, `opening_hours`) VALUES
	(1, 'Cơm Tấm Long Xuyên', '123 Nguyễn Huệ, Q1, TPHCM', '0787855469', 'comtamlongxuyen@gmail.com', 'Cơm tấm từ lâu đã vượt xa ý nghĩa của một món ăn bình dân để trở thành biểu tượng của sự chắt ch lọc và sáng tạo trong ẩm thực Việt. Tại nhà hàng, chúng tôi trân trọng từng "hạt ngọc" vụn để dệt nên một trải nghiệm ẩm thực vừa thân thuộc, vừa đẳng cấp.', '7:00 - 18:00'),
	(3, 'Nhà hàng C - Bánh Mì Việt', '789 Bùi Viện, Q1, TPHCM', '0787855469', 'banhmiviet@gmail.com', 'Nếu phở là linh hồn của bàn tiệc Việt, thì bánh mì chính là bản giao hưởng tuyệt vời của kết cấu và hương vị. Tại nhà hàng của chúng tôi, ổ bánh mì không đơn thuần là một món ăn đường phố, mà đã được nâng tầm thành một trải nghiệm ẩm thực tinh tế, đánh thức mọi giác quan.', '7:00 - 19:00'),
	(20, 'Bánh Mì Thủ Đức', '12, Quận 4', '0776808309', 'banhmithuduc@gmail.com', 'Thưởng thức bánh mì tại nhà hàng là cách chúng tôi kể lại câu chuyện về sự sáng tạo của người Việt. Từ những nguyên liệu bình dị nhất, qua đôi bàn tay khéo léo của người đầu bếp, bánh mì trở thành một tác phẩm nghệ thuật: đủ sắc - đủ hương - đủ vị.', '7:00 - 22:00');

-- Dumping structure for table foodapp.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `food_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.reviews: ~10 rows (approximately)
INSERT INTO `reviews` (`id`, `user_id`, `food_id`, `rating`, `comment`) VALUES
	(2, 2, 1, 5, 'Vị vừa miệng, phần ăn đầy đặn.'),
	(3, 3, 1, 4, 'Đóng gói gọn gàng, chất lượng ổn định.'),
	(6, 4, 2, 5, 'Giá hợp lý so với khẩu phần và chất lượng.'),
	(9, 5, 3, 4, 'Sẽ đặt lại lần sau, gia đình mình rất thích.'),
	(12, 6, 4, 5, 'Nước sốt đậm đà, món ăn nhìn rất bắt mắt.'),
	(13, 5, 5, 4, 'Sẽ đặt lại lần sau, gia đình mình rất thích.'),
	(14, 6, 5, 5, 'ngon'),
	(15, 7, 5, 4, 'Khẩu vị khá ổn, giao hàng nhanh.'),
	(16, 6, 6, 5, 'ngon ăn là ghiền'),
	(19, 2, 3, 5, 'món ăn ngon sạch sẽ');

-- Dumping structure for table foodapp.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.users: ~53 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
	(1, 'Phuc An', 'phucan@gmail.com', '$2b$10$Ld5lhC72trZVmzrEA874yOZVlYA6DXI.1EuhTnROVbNq7j1aJcrGO', 'user'),
	(2, 'hao456', 'tangvihao8706@gmail.com', '$2b$10$9ycLvcf.bnvdT6vMTgJaEOmltN4fvouxvUqEArzw12JJRkszVgp1m', 'user'),
	(3, 'tin', 'dttin004@gmail.com', '$2b$10$r1clR5IQzE6jHbuhZOHwQO25.OBg75.Rgauuta/O4QJB.RdEOwxt.', 'user'),
	(4, 'tin', 'tinvanvo079@gmail.com', '$2b$10$MQNFWbHuVlIg9w8s9vz.J.ZQHgbhEuJC2zIV1F/rLOADmtEwy8UIO', 'user'),
	(5, 'vin', 'vincentdang004@gmail.com', '$2b$10$MrcbgVoJLLc.1bSsP3zwPOpaYCtNH5vN0oSGkty.nCgp895tFbhZq', 'user'),
	(6, 'hi', 'hihi@gmail.com', '$2b$10$Xc7/lAfWdaoen55hXBK7POkeW0qHHTJlSRwxAy9qP7VN0h8dqIiaO', 'user'),
	(7, 'hi', 'hihi@gmail.com', '$2b$10$.LWarvjgs3hvNSItG.sMsOJ/mF461uK91WkoapmcaaKXoE0DT567O', 'user'),
	(8, 'hi', 'hihi@gmail.com', '$2b$10$ZrvLOxXdnT28M9IpiqtazOtkwEAhKMUm43o6FcE.tR3VOVq8575Re', 'user'),
	(9, 'hi', 'hihi@gmail.com', '$2b$10$8eO1nM3sP9ItBdInpdQ0Pe4zG3R9vFexpvBgsxMTn3OFcN9Tipfva', 'user'),
	(10, 'hi', 'hihi@gmail.com', '$2b$10$9XRhL84pjWhFJtzSTdPzO.r3IpWjACOOe6fX0QgODF9CJ12k2D2AC', 'user'),
	(11, 'hi', 'hihi@gmail.com', '$2b$10$Re75OawGBYVvPYrg2rvKy.XUKGu87SzzVZwu.3vIIhgGIGyJvqmSy', 'user'),
	(12, 'hi', 'hihi@gmail.com', '$2b$10$JNCvHpuwsVJMaA3tslKoE.zDUZgU6IcZt8/tAoh./8702vnLNKsIq', 'user'),
	(13, 'hi', 'hihi@gmail.com', '$2b$10$masGYw2DvqZ8f7gOGAzVR./BnHx/HC5HZj3ra.0w71pH3PpjFjJta', 'user'),
	(14, 'hi', 'hihi@gmail.com', '$2b$10$XJxWYNxd8IF/a7BX0ad17uFJdfggAa4bqIoo3F3TpVaagOho2ixDG', 'user'),
	(15, 'hi', 'hihi@gmail.com', '$2b$10$jm8/kCjPLcVFDbr48EC9gOnMPxfCcAO1LliyBSHjr9neTtLqKY.la', 'user'),
	(16, 'hi', 'hihi@gmail.com', '$2b$10$PWCsvQaRmjDyJBGhMEUYce/jhV6jhNg39cFa.IWkONWU1j5oj99fC', 'user'),
	(17, 'hi', 'hihi@gmail.com', '$2b$10$qpeanB.wOAkaygn2YPqaDOj.t1MXlr2sHeMk1GIph4qP9AVzikEai', 'user'),
	(18, 'hi', 'hihi@gmail.com', '$2b$10$H/m3zjvBxGVRE089q2XcWO3IXAnHRklya1F.5YZDgBwBPy4vSpdy6', 'user'),
	(19, 'hi', 'hihi@gmail.com', '$2b$10$8YsDVQEpwplLP7o3slrRmel.oP1S29QI6Pb19iyKT4LXYYK4v8dZC', 'user'),
	(20, 'hi', 'hihi@gmail.com', '$2b$10$uM5/oSa.XWpmFf3qP9GnaeL4D5BhSzZFny31RDA3uzrbys7EesOFO', 'user'),
	(21, 'hi', 'hihi@gmail.com', '$2b$10$mTyr0a1WTFgfYPe3SzhMP.Mm.LQTbJdMlXCpdWoXD7NBKHh3nmLZy', 'user'),
	(22, 'hi', 'hihi@gmail.com', '$2b$10$6oeeoZ4P6DR7QHItBeuM1uC5Qf8w/c7Ggf/WqmAgu80kgQ8R2Klmm', 'user'),
	(23, 'hi', 'hihi@gmail.com', '$2b$10$J6Ne9oc7rpoIcUXlKrJdPeviZZm6uKXKxvn7gbM0LQsJsD8vhhj/2', 'user'),
	(24, 'hi', 'hihi@gmail.com', '$2b$10$112fpQ6kTcdn7FwqdILVdOmLqzF6bmptz2JYLovo0ISAHoWrGX/oK', 'user'),
	(25, 'hi', 'hihi@gmail.com', '$2b$10$cs8f8hpw/LdeQgdsqpgRyO.xB2fkDzzHrkuJksMWhJzQe7nfQIEe6', 'user'),
	(26, 'hi', 'hihi@gmail.com', '$2b$10$97RCcIizPFbB0Wk66g1vPuA9prU6WPVoHB3/njlmZgVqBQPW.LMJ6', 'user'),
	(27, 'hi', 'hihi@gmail.com', '$2b$10$2PhO77oQqX2iSs4wW1ukBuwsQrJ8.VXX3KXPXywpcoWPw6UoPl5gG', 'user'),
	(28, 'hi', 'hihi@gmail.com', '$2b$10$IbZyOg1mTpieD8P8oC.uu.Jo3lfJ9g96TJGIq/E.MsYX80uvxoKk2', 'user'),
	(29, 'hi', 'hihi@gmail.com', '$2b$10$VccVqWvVaCX0.Zz0snx55uzovC7tRcrafZbUz5EuioFR3UaI/05Qe', 'user'),
	(30, 'hi', 'hihi@gmail.com', '$2b$10$xwhG4GmdQ2hcKWKotdTw1eNvflSFMkA4YPNm2m7PGbf6cZqPINbNS', 'user'),
	(31, 'hi', 'hihi@gmail.com', '$2b$10$UdCT6JTQmgrFrEdjnlnCHOjXPSOE6zXE4..b94IoT3K3QgXYKDfiS', 'user'),
	(32, 'hi', 'hihi@gmail.com', '$2b$10$CABVDkiCV47Ms2soepWjPuly2Nd7Qr/eIrE1UGvtRzdAy1bodKt4C', 'user'),
	(33, 'hi', 'hihi@gmail.com', '$2b$10$le1/7th5V/MZU9i9tvxBleY8R7BicpmzqCDzxYVWy4TIncOf7nn2G', 'user'),
	(34, 'hi', 'hihi@gmail.com', '$2b$10$apQCSP8gPfTvdUt6xAof7.d7MUb1NFmp5QvMjzLnJALqwMVpHwWv6', 'user'),
	(35, 'hi', 'hihi@gmail.com', '$2b$10$VT/Nm6DKaeqwDJmnv1F.ze5m3dnxwdjjIQwrsCDGlqoqZJ2UshO0S', 'user'),
	(36, 'hi', 'hihi@gmail.com', '$2b$10$OLLjo5fMOU4bvphyBP2UOeAUKPzH3SsnOHupIqxiSOgiTJhCK8Mme', 'user'),
	(37, 'hi', 'hihi@gmail.com', '$2b$10$T5TcgKtkGzkIaBlOpSP7EeHHJl69UJ00ra0SwPiM162oWPNscbJ42', 'user'),
	(38, 'hi', 'hihi@gmail.com', '$2b$10$4AJaaCaYGkjo6cc4jFwKUeRYMPrsRTpdAubN2t4x5unDGyCTOYi2K', 'user'),
	(39, 'hi', 'hihi@gmail.com', '$2b$10$cAU3TdBgtisUv.aR8XjDcOu1qc8TA6ujNsWnW3zICbTCl2JB.D2YC', 'user'),
	(40, 'hi', 'hihi@gmail.com', '$2b$10$leuZMffGCM5jJpKzMOgZBuq3tCqM/lEAsM/2GOfihN7p.FRu/ftpq', 'user'),
	(41, 'hi', 'hihi@gmail.com', '$2b$10$HC7qdyt86nuaSb5wVnDNbuUtdv.OQZEKLlSNbZlidKN.Y/LBhQ9DK', 'user'),
	(42, 'hi', 'hihi@gmail.com', '$2b$10$qRrN92Tep.fToIQHb5kwne0gRTpxssPDEMHHMojBEpBxTbmNKMoHy', 'user'),
	(43, 'hi', 'hihi@gmail.com', '$2b$10$isOKMTxiZBip/QxyYjBfCOuOQWa46kTEWs7l48Aimg7vn6pOMZbCm', 'user'),
	(44, '', '', '$2b$10$AWtXhtne21XQNd1WDrJPOOm8mNZEflVnA03v6WuruXQLt04g2nlgK', 'user'),
	(45, '', '', '$2b$10$UPLB8ByuhqTCfvm5afcfKuBAdVT1i1KX7xUx0y6oSphkSXF2gONXC', 'user'),
	(46, '', '', '$2b$10$RRl7uVQmlU02j5k3z2kb5e3nxFv69hDovOuyjZFI4DeeT0buiU2b.', 'user'),
	(47, 'hihi', 'hihi@gmail.com', '$2b$10$R1U4UGxf4IxrD1jdoOd.veDFw117zm9D8b6aurOWWyliaIdK0QJdG', 'user'),
	(48, 'hi', 'hihi@gmail.com', '$2b$10$rXMqg3THEKxWVoufv7MFoeJ6a3eH9ucwvXi3FUsHw2qgzJ8QIHjvu', 'user'),
	(49, 'hi', 'hihi@gmail.com', '$2b$10$JZICJDOp6UMXMO2S97seyOVVsMj.9mhnTu8gw8Wq.AW326jwYKC5e', 'user'),
	(50, 'hi', 'hihi@gmail.com', '$2b$10$HouBrEH2yGSI69PZtIDTkuWDXCN3DzKUbFugf.ca3shQPTK7YFsuq', 'user'),
	(51, 'hi', 'hihi@gmail.com', '$2b$10$BOyz.kzORo04Jcn3NF5tne39.SMviIV4bivYOVuZVkq9PILze7Oe.', 'user'),
	(52, 'Administrator', 'admin@gmail.com', '$2b$10$kKG33JxE1gbk/glYbveNuucsV.GCGyPgAhojUyh6l738DC3V.KW0G', 'admin'),
	(53, 'test', 'test1@example.com', '$2b$10$GSgHFAjpHQYBNC4BRO5ENeJk2qJO5OS0Qhh9cRM/4KTw7IERZ54pK', 'user');

-- Dumping structure for table foodapp.vouchers
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `discount` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table foodapp.vouchers: ~4 rows (approximately)
INSERT INTO `vouchers` (`id`, `code`, `discount`) VALUES
	(1, 'GIAM10', 10),
	(2, 'GIAM20', 20),
	(3, 'FREESHIP5', 5),
	(4, 'GIAM5', 5);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
