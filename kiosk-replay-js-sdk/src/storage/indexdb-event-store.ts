import type { eventWithTime } from "@rrweb/types";
import type { EventStore } from "./event-store";
import type { EventBatch } from "./event-batch";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface EventDatabase extends DBSchema {
  'events': {
    value: EventBatch;
    key: string;
    indexes: {
      by_timestamp: number;
    };
  };
}

export class IndexedDBEventStore implements EventStore {
  private readonly DB_NAME = "kiosk-replay";
  private readonly STORE_NAME = "events";

  private db: IDBPDatabase<EventDatabase> | null = null;
  
  private generateBatchId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random()}`;
  }

  private async openDatabase(): Promise<IDBPDatabase<EventDatabase>> {
    const storeName = this.STORE_NAME;
    return openDB<EventDatabase>(this.DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" })
            .createIndex("by_timestamp", "timestamp", { unique: false });
        }
      },
    });
  }

  private async getDB(): Promise<IDBPDatabase<EventDatabase>> {
    if (this.db) return this.db;

    this.db = await this.openDatabase();

    this.db.onclose = () => {
      this.db = null;
    };

    return this.db;
  }

  async addBatch(values: eventWithTime[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_NAME, "readwrite");

    await tx.store.add({
      id: this.generateBatchId(),
      timestamp: Date.now(),
      events: values,
    });
    
    await tx.done;
  }
  
  async getBatches(limit?: number): Promise<EventBatch[]> {
    const db = await this.getDB();
    const batches = await db.getAllFromIndex(this.STORE_NAME, "by_timestamp", undefined, limit);
    
    return batches;
  }

  async deleteBatches(keys: string[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_NAME, "readwrite");

    for (const key of keys) {
      tx.store.delete(key);
    }
    
    await tx.done;
  }
}
