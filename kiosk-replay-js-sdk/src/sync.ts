import { store } from "./storage";

const SYNC_MAX_BATCHES_TO_SEND = 50;

export interface SyncOptions {
  consoleUrl: string;
  deviceAlias: string;
}

export async function syncWithRemote(options: SyncOptions): Promise<void> {
  const eventBatches = await store.getBatches(SYNC_MAX_BATCHES_TO_SEND);
  // TODO: Send events to remote
  console.log(
    `Sending events to remote: ${options.consoleUrl}/api/v1/event/${options.deviceAlias}`,
    eventBatches,
  );
  const response = await fetch(
    `${options.consoleUrl}/api/v1/event/${options.deviceAlias}`,
    {
      method: "POST",
      body: JSON.stringify(eventBatches),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to send events to remote: ${response.statusText}`);
  }
  // TODO: Delete sent events from local storage
  await store.deleteBatches(eventBatches.map((e) => e.id));
}
