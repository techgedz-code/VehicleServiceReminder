CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`issuer` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `workshops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_account_idx` ON `accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `credits_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`workshop_id` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`reference_id` text,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `credits_workshop_idx` ON `credits_ledger` (`workshop_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`workshop_id` text NOT NULL,
	`gateway` text NOT NULL,
	`gateway_payment_id` text,
	`amount_rm` integer NOT NULL,
	`credits_amount` integer NOT NULL,
	`status` text NOT NULL,
	`payload` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `payments_workshop_idx` ON `payments` (`workshop_id`);--> statement-breakpoint
CREATE TABLE `service_records` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`workshop_id` text NOT NULL,
	`service_date` integer NOT NULL,
	`service_type` text NOT NULL,
	`oil_used` text,
	`mileage_at_service` integer NOT NULL,
	`next_service_mileage` integer,
	`next_service_date` integer,
	`qr_token` text NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_records_qr_token_unique` ON `service_records` (`qr_token`);--> statement-breakpoint
CREATE INDEX `services_vehicle_idx` ON `service_records` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `services_workshop_idx` ON `service_records` (`workshop_id`);--> statement-breakpoint
CREATE INDEX `services_next_date_idx` ON `service_records` (`next_service_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `services_qr_token_idx` ON `service_records` (`qr_token`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `workshops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_idx` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`workshop_id` text NOT NULL,
	`plate_number` text NOT NULL,
	`owner_name` text NOT NULL,
	`owner_phone` text,
	`owner_email` text,
	`pdpa_consent` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `vehicles_workshop_idx` ON `vehicles` (`workshop_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_workshop_plate_idx` ON `vehicles` (`workshop_id`,`plate_number`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')),
	`updated_at` integer DEFAULT (strftime('%s','now'))
);
--> statement-breakpoint
CREATE TABLE `workshops` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`password_hash` text,
	`google_id` text,
	`name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`ban_expires` integer,
	`phone` text,
	`address` text,
	`credits_balance` integer DEFAULT 5 NOT NULL,
	`total_credits_purchased` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workshops_email_unique` ON `workshops` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `workshops_google_id_unique` ON `workshops` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `workshops_email_idx` ON `workshops` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `workshops_google_id_idx` ON `workshops` (`google_id`);