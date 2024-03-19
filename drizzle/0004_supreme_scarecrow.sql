ALTER TABLE `codes` MODIFY COLUMN `stdin` text NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `codes` MODIFY COLUMN `code` text NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `codes` MODIFY COLUMN `stdout` text NOT NULL DEFAULT ('');