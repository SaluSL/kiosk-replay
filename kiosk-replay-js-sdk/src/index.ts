
export interface ReplaySDKOptions {
	consoleUrl: string;
	clientIdentifier: string;
}

export function init(options: ReplaySDKOptions): string {
	return `Hello, ${options}!`
}

