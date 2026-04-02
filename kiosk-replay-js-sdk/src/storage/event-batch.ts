
import type { eventWithTime } from "@rrweb/types";

export interface EventBatch {
  id: string;
  timestamp: number;
  events: eventWithTime[];
}