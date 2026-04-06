CREATE TABLE `media_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`type` text NOT NULL,
	`mime_type` text,
	`created_at` integer
);
