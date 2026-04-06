CREATE TABLE `custom_event` (
	`id` text PRIMARY KEY NOT NULL,
	`eventBatchId` text,
	`tag` text NOT NULL,
	`payload` blob NOT NULL,
	`timestamp` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`eventBatchId`) REFERENCES `event_batch`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `custom_event_eventBatchId_idx` ON `custom_event` (`eventBatchId`);--> statement-breakpoint
CREATE INDEX `custom_event_timestamp_idx` ON `custom_event` (`timestamp`);--> statement-breakpoint
ALTER TABLE `event_batch` ADD `oldestTimestamp` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `event_batch` ADD `newestTimestamp` integer NOT NULL;--> statement-breakpoint
CREATE INDEX `event_batch_oldestTimestamp_idx` ON `event_batch` (`oldestTimestamp`);--> statement-breakpoint
CREATE INDEX `event_batch_newestTimestamp_idx` ON `event_batch` (`newestTimestamp`);--> statement-breakpoint
CREATE INDEX `device_organizationId_idx` ON `device` (`organizationId`);--> statement-breakpoint
CREATE INDEX `location_organizationId_idx` ON `location` (`organizationId`);