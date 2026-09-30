CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`catalogId` varchar(64) NOT NULL,
	`kind` enum('package','refill') NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`compareAt` int,
	`stock` int NOT NULL DEFAULT 0,
	`imageAssetId` int,
	`active` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_catalogId_unique` UNIQUE(`catalogId`)
);
--> statement-breakpoint
ALTER TABLE `assets` ADD `category` enum('product','banner','flavor','other') DEFAULT 'other' NOT NULL;