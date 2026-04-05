CREATE TABLE `bible_books` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`abbreviation` text NOT NULL,
	`testament` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bible_verses` (
	`id` integer PRIMARY KEY NOT NULL,
	`book_id` integer NOT NULL,
	`chapter` integer NOT NULL,
	`verse` integer NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `bible_books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `bible_verses_book_chapter_idx` ON `bible_verses` (`book_id`,`chapter`);--> statement-breakpoint
CREATE INDEX `bible_verses_lookup_idx` ON `bible_verses` (`book_id`,`chapter`,`verse`);--> statement-breakpoint
CREATE TABLE `hymns` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`verses` text DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE `layouts` (
	`id` text PRIMARY KEY NOT NULL,
	`show_id` text NOT NULL,
	`name` text NOT NULL,
	`slide_order` text DEFAULT '[]',
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `layouts_show_id_idx` ON `layouts` (`show_id`);--> statement-breakpoint
CREATE TABLE `outputs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`bounds` text,
	`config` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`items` text DEFAULT '[]',
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `sermons` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`location` text,
	`pdf_path` text,
	`extracted_text` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `shows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`meta` text,
	`timestamps` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` text PRIMARY KEY NOT NULL,
	`show_id` text NOT NULL,
	`group_name` text,
	`global_group` text,
	`color` text,
	`notes` text DEFAULT '',
	`items` text DEFAULT '[]',
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `slides_show_id_idx` ON `slides` (`show_id`);