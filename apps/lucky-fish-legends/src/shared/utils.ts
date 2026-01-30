// Shared utilities - accessible from both client and server

/**
 * Formats a message with a timestamp prefix
 */
export function formatMessage(message: string): string {
	return `[${os.date("%X")}] ${message}`;
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
	return math.max(min, math.min(max, value));
}

/**
 * Waits for a child of type T on an instance
 */
export function waitForChildOfType<T extends Instance>(
	parent: Instance,
	className: keyof Instances,
	timeout?: number,
): T | undefined {
	const child = timeout !== undefined 
		? parent.WaitForChild(className, timeout) 
		: parent.WaitForChild(className);
	return child?.IsA(className as never) ? (child as T) : undefined;
}
