import { record } from '@rrweb/record';
import type { eventWithTime } from '@rrweb/types';
import { store } from './storage';
import { syncWithRemote } from './sync';

export interface ReplaySDKOptions {
	consoleUrl: string;
	clientIdentifier: string;
	batchLocalStoreIntervalMs?: number;
	remoteSyncIntervalMs?: number;
}

export function createReplaySDK(options: ReplaySDKOptions): ReplaySDK {
	return new ReplaySDK(options);
}

export class ReplaySDK {
	private eventBatch: eventWithTime[] = [];
	private batchIntervalId?: ReturnType<typeof setInterval>;
	private remoteSyncIntervalId?: ReturnType<typeof setInterval>;
	private stopRecording?: () => void;
	private started = false;
	private isFlushing = false;
	private isSyncing = false;
	private options: ReplaySDKOptions;

	constructor(options: ReplaySDKOptions) {
		this.options = options;
	}
	
	start(): void {
		if (this.started) {
			return;
		}
		
		this.stopRecording = record({
			emit: (event) => {
				this.eventBatch.push(event);
			},
		});

		this.batchIntervalId = setInterval(() => {
			this.flushBatchToLocalStore();
		}, this.options.batchLocalStoreIntervalMs || 5 * 1000);

		this.remoteSyncIntervalId = setInterval(() => {
			this.flushLocalToRemote();
		}, this.options.remoteSyncIntervalMs || 20 * 1000);
		
		this.started = true;
	}
	
	stop(): void {
		if (!this.started) {
			return;
		}
		
		if (this.batchIntervalId) {
			clearInterval(this.batchIntervalId);
		}
		if (this.remoteSyncIntervalId) {
			clearInterval(this.remoteSyncIntervalId);
		}
		if (this.stopRecording) {
			this.stopRecording();
		}
		this.flushBatchToLocalStore();
		this.flushLocalToRemote();

		this.batchIntervalId = undefined;
		this.remoteSyncIntervalId = undefined;
		this.stopRecording = undefined;
		this.started = false;
	}

	addCustomEvent<T>(name: string, data: T): void {
		record.addCustomEvent<T>(name, data);
	}

	private async flushBatchToLocalStore(): Promise<void> {
		if (this.isFlushing || this.eventBatch.length === 0) return;

		this.isFlushing = true;

		const batch = this.eventBatch;
		this.eventBatch = [];

		try {
			await store.addBatch(batch);
		} finally {
			this.isFlushing = false;
		}
	}

	private async flushLocalToRemote(): Promise<void> {
		if (this.isSyncing) return;
		
		this.isSyncing = true;
		
		try {
			await syncWithRemote({
				consoleUrl: this.options.consoleUrl,
				clientIdentifier: this.options.clientIdentifier,
			});
		} finally {
			this.isSyncing = false;
		}
	}
}

