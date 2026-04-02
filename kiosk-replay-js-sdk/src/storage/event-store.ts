import type { eventWithTime } from "@rrweb/types";
import type { EventBatch } from "./event-batch";

export interface EventStore {
  addBatch(events: eventWithTime[]): Promise<void>;
  getBatches(limit?: number): Promise<EventBatch[]>;
  deleteBatches(keys: string[]): Promise<void>;
} 
