import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { AppEnv } from "@/lib/types";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";
import { eventWithTime, EventType } from "@rrweb/types";
import { customEventWithTime } from "@/lib/types";
import { db } from "@/lib/database/db";
import {
  customEvent as dbCustomEvent,
  device,
  eventBatch,
} from "@/lib/database/schema/core";
import { compress } from "@/lib/helpers/compress";
import { eq } from "drizzle-orm";

export const eventAddRoute = new Hono<AppEnv>();

/*
 * ----------------------------------------------------------------------------
 * Schema
 * ----------------------------------------------------------------------------
 */
const eventAddSchema = z
  .array(
    z.object({
      id: z.string(),
      timestamp: z.number(),
      events: z.array(z.custom<eventWithTime>()).min(1),
    }),
  )
  .min(1);

interface EventBatchInsert {
  events: Uint8Array;
  compression: "brotli";
  idFromClient: string;
  oldestTimestamp: number;
  newestTimestamp: number;
  deviceId: string;
}

interface EventBatch {
  id: string;
  timestamp: number;
  events: eventWithTime[];
}

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */
eventAddRoute.post(
  "/:deviceAlias",
  zValidator("json", eventAddSchema),
  async (c) => {
    const batches = await c.req.json();
    // TODO: client (device) token authentication

    const deviceId = await getDeviceIdByAlias(c.req.param("deviceAlias"));
    if (!deviceId) {
      return c.json(
        new ApiMsgResponse("Device not found", "api.device.notFound"),
        404,
      );
    }

    await addEvents(batches, deviceId);

    return c.json(
      new ApiMsgResponse("Events added successfully", "api.event.added"),
      201,
    );
  },
);

/*
 * ----------------------------------------------------------------------------
 * Command
 * ----------------------------------------------------------------------------
 */
async function addEvents(
  batches: EventBatch[],
  deviceId: string,
): Promise<void> {
  const customEventsBatches = getCustomEventsBatches(batches);
  const eventBatchIds = await saveEventBatches(batches, deviceId);
  await saveCustomEvents(customEventsBatches, eventBatchIds);
}

/*
 * ----------------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------------------
 */
function getOldestTimestamp(events: eventWithTime[]): number {
  return Math.min(...events.map((event) => event.timestamp));
}

function getNewestTimestamp(events: eventWithTime[]): number {
  return Math.max(...events.map((event) => event.timestamp));
}

function getCustomEventsBatches(
  batches: EventBatch[],
): Record<string, customEventWithTime[]> {
  const customEventsBatches: Record<string, customEventWithTime[]> = {};

  for (const batch of batches) {
    for (const event of batch.events) {
      if (event.type === EventType.Custom) {
        if (!customEventsBatches.hasOwnProperty(batch.id)) {
          customEventsBatches[batch.id] = [];
        }
        customEventsBatches[batch.id].push(event as customEventWithTime);
      }
    }
  }
  return customEventsBatches;
}

async function saveCustomEvents(
  customEventsBatches: Record<string, customEventWithTime[]>,
  eventBatchIds: Map<string, string>,
): Promise<void> {
  const serialized = [];

  for (const [idFromClient, events] of Object.entries(customEventsBatches)) {
    const eventBatchId = eventBatchIds.get(idFromClient);
    if (!eventBatchId) {
      throw new Error(
        `Event batch not found for idFromClient: ${idFromClient}`,
      );
    }
    serialized.push(
      ...events.map((event) => ({
        timestamp: event.timestamp,
        tag: event.data.tag,
        payload: new TextEncoder().encode(JSON.stringify(event.data.payload)),
        eventBatchId,
      })),
    );
  }
  await db.insert(dbCustomEvent).values(serialized);
}

async function saveEventBatches(
  batches: EventBatch[],
  deviceId: string,
): Promise<Map<string, string>> {
  const serializedBatches: EventBatchInsert[] = [];
  for (const batch of batches) {
    const compressedEvents = await compress(batch.events, "brotli");
    serializedBatches.push({
      events: compressedEvents,
      compression: "brotli",
      idFromClient: batch.id,
      oldestTimestamp: getOldestTimestamp(batch.events),
      newestTimestamp: getNewestTimestamp(batch.events),
      deviceId,
    });
  }
  const newEventBatches = await db
    .insert(eventBatch)
    .values(serializedBatches)
    .returning();

  const clientIdToIdMap = new Map<string, string>();
  for (const batch of newEventBatches) {
    if (!batch.idFromClient) {
      continue;
    }
    clientIdToIdMap.set(batch.idFromClient, batch.id);
  }
  return clientIdToIdMap;
}

async function getDeviceIdByAlias(alias: string): Promise<string | undefined> {
  const [d] = await db.select().from(device).where(eq(device.alias, alias));
  return d?.id;
}
