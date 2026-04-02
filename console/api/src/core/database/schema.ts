import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { randomUUIDv7 } from "bun";

export const eventBatches = sqliteTable("event_batches", {
  id: blob().$defaultFn(() => randomUUIDv7()).primaryKey(),
  deviceId: text().notNull().references(() => devices.id),
  events: blob().notNull(),
  createdAt: integer().notNull().$defaultFn(() => Date.now()),
});

export const devices = sqliteTable("devices", {
  id: blob().$defaultFn(() => crypto.randomUUID()).primaryKey(),
  locationId: blob().references(() => locations.id),
  organizationId: blob().notNull().references(() => organizations.id),
  alias: text().notNull().unique(),
  fullName: text().default(""),
  createdAt: integer().notNull().$defaultFn(() => Date.now()),
});

export const locations = sqliteTable("locations", {
  id: blob().$defaultFn(() => crypto.randomUUID()).primaryKey(),
  organizationId: blob().notNull().references(() => organizations.id),
  name: text().notNull(),
  createdAt: integer().notNull().$defaultFn(() => Date.now()),
});

export const organizations = sqliteTable("organizations", {
  id: blob().$defaultFn(() => crypto.randomUUID()).primaryKey(),
  name: text().notNull(),
  createdAt: integer().notNull().$defaultFn(() => Date.now()),
});