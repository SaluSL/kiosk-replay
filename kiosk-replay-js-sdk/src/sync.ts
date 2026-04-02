import { store } from "./storage";

const SYNC_MAX_BATCHES_TO_SEND = 50;

export interface SyncOptions {
    consoleUrl: string;
    clientIdentifier: string;
}

export async function syncWithRemote(options: SyncOptions): Promise<void> {
    const events = await store.getBatches(SYNC_MAX_BATCHES_TO_SEND);
    // TODO: Send events to remote
    console.log(`Sending events to remote: ${options.consoleUrl}/api/events/${options.clientIdentifier}`, events);
    // TODO: Delete sent events from local storage
    await store.deleteBatches(events.map(e => e.id));
}

