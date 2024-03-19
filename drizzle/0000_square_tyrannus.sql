CREATE TABLE `codes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(256) NOT NULL,
	`language` varchar(10) NOT NULL,
	`stdin` text,
	`code` text,
	`stdout` text,
	`status` varchar(10),
	CONSTRAINT `codes_id` PRIMARY KEY(`id`)
);
