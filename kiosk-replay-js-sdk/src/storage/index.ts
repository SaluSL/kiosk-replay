import type { EventStore } from "./event-store";
import { IndexedDBEventStore } from "./indexdb-event-store";

export const store: EventStore = new IndexedDBEventStore();