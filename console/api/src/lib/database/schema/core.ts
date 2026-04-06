import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { randomUUIDv7 } from "bun";
import { organization } from "./auth";

export const eventBatch = sqliteTable(
  "event_batch",
  {
    id: text()
      .$defaultFn(() => randomUUIDv7())
      .primaryKey(),
    deviceId: text().references(() => device.id, { onDelete: "set null" }),
    events: blob().notNull(),
    oldestTimestamp: integer().notNull(),
    newestTimestamp: integer().notNull(),
    createdAt: integer()
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (table) => [
    index("event_batch_oldestTimestamp_idx").on(table.oldestTimestamp),
    index("event_batch_newestTimestamp_idx").on(table.newestTimestamp),
  ],
);

export const customEvent = sqliteTable(
  "custom_event",
  {
    id: text()
      .$defaultFn(() => randomUUIDv7())
      .primaryKey(),
    eventBatchId: text().references(() => eventBatch.id, {
      onDelete: "cascade",
    }),
    tag: text().notNull(),
    payload: blob().notNull(),
    timestamp: integer().notNull(),
    createdAt: integer()
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (table) => [
    index("custom_event_eventBatchId_idx").on(table.eventBatchId),
    index("custom_event_timestamp_idx").on(table.timestamp),
  ],
);

export const device = sqliteTable(
  "device",
  {
    id: text()
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    locationId: text().references(() => location.id),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    alias: text().notNull().unique(),
    fullName: text().default(""),
    createdAt: integer()
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (table) => [index("device_organizationId_idx").on(table.organizationId)],
);

export const location = sqliteTable(
  "location",
  {
    id: text()
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text().notNull(),
    createdAt: integer()
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (table) => [index("location_organizationId_idx").on(table.organizationId)],
);

export const eventBatchRelations = relations(eventBatch, ({ one }) => ({
  device: one(device, {
    fields: [eventBatch.deviceId],
    references: [device.id],
  }),
}));

export const deviceRelations = relations(device, ({ one, many }) => ({
  location: one(location, {
    fields: [device.locationId],
    references: [location.id],
  }),
  organization: one(organization, {
    fields: [device.organizationId],
    references: [organization.id],
  }),
  eventBatches: many(eventBatch),
}));

export const locationRelations = relations(location, ({ one, many }) => ({
  organization: one(organization, {
    fields: [location.organizationId],
    references: [organization.id],
  }),
  devices: many(device),
}));
